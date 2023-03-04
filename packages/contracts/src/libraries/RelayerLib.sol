// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20Permit} from "../openzeppelin/token/ERC20/extensions/IERC20Permit.sol";
import {IERC20} from "../openzeppelin/interfaces/IERC20.sol";
import {Ownable} from "../openzeppelin/access/Ownable.sol";

library RelayerLib {
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

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
