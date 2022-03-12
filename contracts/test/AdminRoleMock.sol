// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.17;

import '../registry/AdminRole.sol';

contract AdminRoleMock is AdminRole {
    constructor(address[] memory accounts) public AdminRole(accounts) {}
}
