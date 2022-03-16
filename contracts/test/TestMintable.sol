// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.17;

import '../interfaces/IMintable.sol';

contract TestMintable is IMintable {
    address public lastCaller;
    address public lastReceiver;
    uint256 public lastAmount;

    event Minted(address caller, address who, uint256 value);

    function mint(address _who, uint256 _value) external {
        lastCaller = msg.sender;
        lastReceiver = _who;
        lastAmount = _value;
        emit Minted(msg.sender, _who, _value);
    }
}
