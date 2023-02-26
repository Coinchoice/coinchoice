// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// Open Zeppelin libraries for controlling upgradability and access.
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Greeter is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    function initialize(
        address owner
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();

        transferOwnership(owner);
    }
}
