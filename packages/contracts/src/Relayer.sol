// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20Permit} from "./openzeppelin/token/ERC20/extensions/IERC20Permit.sol";
import {IERC20} from "./openzeppelin/interfaces/IERC20.sol";

// Relayer that takes funds form user with sig.
contract Relayer {
    bool private _reentrancyGuard;
    // The canonical permit2 contract.
    // User -> token -> deposit balance
    mapping(address => mapping(address => uint256)) public tokenBalancesByUser;

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
        // Credit the caller.
        tokenBalancesByUser[msg.sender][token] += amount;

        IERC20Permit(token).permit(permit.owner, permit.spender, permit.value, permit.deadline, permit.v, permit.r, permit.s);

        // Transfer tokens from the caller to ourselves.
        IERC20(address(token)).transferFrom(user, address(this), amount);
    }

    // Return ERC20 tokens deposited by the caller.
    function withdrawERC20(address token, uint256 amount) external nonReentrant {
        tokenBalancesByUser[msg.sender][token] -= amount;
        // TODO: In production, use an ERC20 compatibility library to
        // execute thie transfer to support non-compliant tokens.
        IERC20(token).transfer(msg.sender, amount);
    }
}
