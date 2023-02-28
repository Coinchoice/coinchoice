// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "hardhat/console.sol";

// Relayer that takes funds form user with sig.
contract TestCallee {
    uint256 counter;

    function testCall1(bool sendMessage) external {
        if (sendMessage) {
            console.log("Message sent from 1");
            counter += 1;
        }
    }

    function testCall2(bool sendMessage) external {
        if (sendMessage) {
            console.log("Message sent from 2");
            counter += 1;
        }
    }
}
