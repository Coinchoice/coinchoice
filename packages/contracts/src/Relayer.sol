// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20Permit} from "./openzeppelin/token/ERC20/extensions/IERC20Permit.sol";
import {IERC20} from "./openzeppelin/interfaces/IERC20.sol";
import {Ownable} from "./openzeppelin/access/Ownable.sol";

library StringHelper {
    function concat(bytes memory a, bytes memory b) internal pure returns (bytes memory) {
        return abi.encodePacked(a, b);
    }

    function toStringBytes(uint256 v) internal pure returns (bytes memory) {
        if (v == 0) {
            return "0";
        }

        uint256 j = v;
        uint256 len;

        while (j != 0) {
            len++;
            j /= 10;
        }

        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;

        while (v != 0) {
            bstr[k--] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }

        return bstr;
    }

    function getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        if (_returnData.length < 68) return "Transaction reverted silently";

        assembly {
            _returnData := add(_returnData, 0x04)
        }

        return abi.decode(_returnData, (string));
    }
}

interface IWETH9 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    function deposit() external payable;

    function withdraw(uint256 wad) external;

    function totalSupply() external view returns (uint256);

    function approve(address guy, uint256 wad) external returns (bool);

    function transfer(address dst, uint256 wad) external returns (bool);

    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) external returns (bool);
}

// Relayer that takes funds form user with sig.
contract Relayer is Ownable {
    using StringHelper for bytes;
    using StringHelper for uint256;

    mapping(address => bool) isExecutioner;

    bool private _reentrancyGuard;

    struct PermitParams {
        address owner;
        address spender;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    IWETH9 immutable WETH;

    constructor(address _weth) Ownable() {
        WETH = IWETH9(_weth);
        isExecutioner[msg.sender] = true;
    }

    // Prevents reentrancy attacks via tokens with callback mechanisms.
    modifier nonReentrant() {
        require(!_reentrancyGuard, "no reentrancy");
        _reentrancyGuard = true;
        _;
        _reentrancyGuard = false;
    }

    modifier onlyExecutioner() {
        require(isExecutioner[msg.sender]);
        _;
    }

    // Deposit some amount of an ERC20 token into this contract
    function depositERC20(
        address user,
        address token,
        uint256 amount,
        PermitParams calldata permit
    ) external nonReentrant {
        IERC20Permit(token).permit(
            permit.owner,
            permit.spender,
            permit.value,
            permit.deadline,
            permit.v,
            permit.r,
            permit.s
        );

        // Transfer tokens from the caller to ourselves.
        IERC20(address(token)).transferFrom(user, address(this), amount);
    }

    function relaySwapToETH(
        address user,
        address token,
        PermitParams calldata permit,
        address swapSpender,
        address to,
        bytes calldata swapCall
    ) external payable nonReentrant onlyExecutioner {
        // use permit to draw user's "gas"
        IERC20Permit(token).permit(
            permit.owner,
            permit.spender,
            permit.value,
            permit.deadline,
            permit.v,
            permit.r,
            permit.s
        );

        // Transfer tokens from the caller to ourselves.
        IERC20(token).transferFrom(user, address(this), permit.value);

        // approve spending from relayer
        IERC20(token).approve(swapSpender, type(uint256).max);

        // call 0x swap
        (bool success, bytes memory res) = to.call{value: msg.value}(swapCall);
        require(success, string(bytes("SWAP_CALL_FAILED: ").concat(bytes(res.getRevertMsg()))));

        // withdraw eth and send to user
        uint256 wethBalance = WETH.balanceOf(address(this));
        if (wethBalance > 0) {
            WETH.withdraw(wethBalance);
            (success, ) = payable(user).call{value: address(this).balance}("");
            require(success, "send ETH failed");
        } else {
            revert("no WETH received");
        }
        // refund dust to user
        IERC20(token).transfer(user, IERC20(token).balanceOf(address(this)));
    }

    function swap0x(
        address recipient,
        address token,
        address spender,
        address to,
        bytes calldata swapCall
    ) external payable nonReentrant onlyExecutioner {
        // approve spending from relayer
        IERC20(address(token)).approve(spender, type(uint256).max);

        // call 0x swap
        (bool success, bytes memory res) = to.call{value: msg.value}(swapCall);
        require(success, string(bytes("SWAP_CALL_FAILED: ").concat(bytes(res.getRevertMsg()))));

        // withdraw eth and send to user
        uint256 wethBalance = WETH.balanceOf(address(this));
        if (wethBalance > 0) {
            WETH.withdraw(wethBalance);
            (success, ) = payable(recipient).call{value: address(this).balance}("");
            require(success, "send ETH failed");
        } else {
            revert("no WETH received");
        }
    }

    function unsafeGeneralCall(address to, bytes calldata swapCall) external nonReentrant onlyOwner {
        unsafeCall(to, swapCall);
    }

    // Return ERC20 tokens deposited by the caller.
    function unsafeCall(address to, bytes calldata data) internal returns (bytes memory res) {
        bool success;
        (success, res) = to.call{value: msg.value}(data);
        require(success, string(bytes("SWAP_CALL_FAILED: ").concat(bytes(res.getRevertMsg()))));
    }

    function relayApprove(IERC20 token, address spender) external onlyOwner {
        token.approve(spender, type(uint256).max);
    }

    function relaySwipe(IERC20 token) external onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    function relaySwipeETH() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function addExecutioner(address _executioner) external onlyOwner {
        isExecutioner[_executioner] = true;
    }

    receive() external payable {}

    fallback() external payable {}
}
