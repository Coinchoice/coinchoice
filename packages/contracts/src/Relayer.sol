// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20Permit} from "./openzeppelin/token/ERC20/extensions/IERC20Permit.sol";
import {IERC20} from "./openzeppelin/interfaces/IERC20.sol";
import {Ownable} from "./openzeppelin/access/Ownable.sol";

// Relayer that takes funds form user with sig.
contract Relayer is Ownable {
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

    constructor() {}

    // Prevents reentrancy attacks via tokens with callback mechanisms.
    modifier nonReentrant() {
        require(!_reentrancyGuard, "no reentrancy");
        _reentrancyGuard = true;
        _;
        _reentrancyGuard = false;
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

    function depositAndSwapToETH(
        address user,
        address token,
        uint256 amount,
        PermitParams calldata permit,
        address to,
        bytes calldata swapCall
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

        // approve spending from relayer
        IERC20(address(token)).approve(to, type(uint256).max);

        // call 0x swap
        unsafeCall(to, swapCall);
    }

    function swap0x(
        address token,
        address to,
        bytes calldata swapCall
    ) external nonReentrant onlyOwner {
        // approve spending from relayer
        IERC20(address(token)).approve(to, type(uint256).max);

        // call 0x swap
        unsafeCall(to, swapCall);
    }

    function unsafeGeneralCall(address to, bytes calldata swapCall) external nonReentrant onlyOwner {
        unsafeCall(to, swapCall);
    }

    // Return ERC20 tokens deposited by the caller.
    function unsafeCall(address to, bytes calldata data) internal returns (bytes memory res) {
        bool success;
        (success, res) = to.call(data);
        if (success == false) {
            assembly {
                revert(add(res, 32), mload(res))
            }
        }
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
}
