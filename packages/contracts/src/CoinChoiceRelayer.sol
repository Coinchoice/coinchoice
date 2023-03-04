// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20Permit} from "./openzeppelin/token/ERC20/extensions/IERC20Permit.sol";
import {IERC20} from "./openzeppelin/interfaces/IERC20.sol";
import {Ownable} from "./openzeppelin/access/Ownable.sol";
import {AccessControl} from "./openzeppelin/access/AccessControl.sol";
import {Pausable} from "./openzeppelin/security/Pausable.sol";
import {ReentrancyGuard} from "./openzeppelin/security/ReentrancyGuard.sol";
import {Initializable} from "./openzeppelin/proxy/utils/Initializable.sol";
import {IWETH9} from "./libraries/IWETH9.sol";
import {RelayerLib} from "./libraries/RelayerLib.sol";

// Relayer that takes funds form user with sig.
contract CoinChoiceRelayer is Ownable, AccessControl, Pausable, ReentrancyGuard, Initializable {
    using RelayerLib for bytes;
    using RelayerLib for uint256;

    bytes32 public constant EXECUTIONER_ROLE = keccak256("EXECUTIONER");
    bytes32 public constant PROXY_ADMIN_ROLE = keccak256("PROXY_ADMIN");

    struct PermitParams {
        address owner;
        address spender;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    IWETH9 public WETH;

    constructor() Ownable() ReentrancyGuard() AccessControl() Initializable() Pausable() {}

    function initialize(address _weth) external initializer {
        WETH = IWETH9(_weth);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTIONER_ROLE, msg.sender);
    }

    // Deposit some amount of an ERC20 token into this contract
    function depositERC20(
        address user,
        address token,
        uint256 amount,
        PermitParams calldata permit
    ) external nonReentrant onlyRole(EXECUTIONER_ROLE) {
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

    /**
     * @dev Consumes signature from user, swaps to WETH, wraps to ETH and sends funds
     * to the user
     * @param user the user to swap on behalf of
     * @param token the token that the user wants to trade in
     * @param swapAmount the amount to be swaped provided by a routing api
     * @param permit the user's permit to swap without approval
     * @param swapSpender the address that the reayer will have to approve
     * @param to swap target
     * @param swapCall swap calldata
     */
    function relaySwapToETH(
        address user,
        address token,
        uint256 swapAmount,
        PermitParams calldata permit,
        address swapSpender,
        address to,
        bytes calldata swapCall
    ) external payable nonReentrant whenNotPaused onlyRole(EXECUTIONER_ROLE) {
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
        IERC20(token).transferFrom(user, address(this), swapAmount);

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

    /**
     * @dev For testing purposes only
     */
    function swap0x(
        address recipient,
        address token,
        address spender,
        address to,
        bytes calldata swapCall
    ) external payable nonReentrant whenNotPaused onlyRole(EXECUTIONER_ROLE) {
        uint256 wethBalanceBefore = WETH.balanceOf(address(this));
        // approve spending from relayer
        IERC20(address(token)).approve(spender, type(uint256).max);

        // call 0x swap
        (bool success, bytes memory res) = to.call{value: msg.value}(swapCall);
        require(success, string(bytes("SWAP_CALL_FAILED: ").concat(bytes(res.getRevertMsg()))));

        // withdraw eth and send to user
        uint256 wethBalanceAfter = WETH.balanceOf(address(this));
        uint256 wethReceived = wethBalanceAfter - wethBalanceBefore;
        if (wethReceived > 0) {
            WETH.withdraw(wethReceived);
            (success, ) = payable(recipient).call{value: wethReceived}("");
            require(success, "send ETH failed");
        } else {
            revert("no WETH received");
        }
    }

    function unsafeGeneralCall(address to, bytes calldata swapCall)
        external
        nonReentrant
        whenNotPaused
        onlyRole(EXECUTIONER_ROLE)
    {
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

    receive() external payable {}

    fallback() external payable {}
}
