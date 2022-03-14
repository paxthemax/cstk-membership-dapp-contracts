// SPDX-License-Identifier: UNLICENSED
// uniswap-v3-core/contracts/test/TestERC20.sol
pragma solidity ^0.5.17;

import '../interfaces/IERC20Minimal.sol';

/***
 * @dev UniswapV3 Core based minimal ERC20 token. Code updated to compile with solc 0.6.17 */
contract TestERC20 is IERC20Minimal {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 amountToMint) public {
        mint(msg.sender, amountToMint);
    }

    function mint(address to, uint256 amount) public {
        uint256 balanceNext = balanceOf[to] + amount;
        require(balanceNext >= amount, 'overflow balance');
        balanceOf[to] = balanceNext;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        uint256 balanceBefore = balanceOf[msg.sender];
        require(balanceBefore >= amount, 'insufficient balance');
        balanceOf[msg.sender] = balanceBefore - amount;

        uint256 balanceRecipient = balanceOf[recipient];
        require(balanceRecipient + amount >= balanceRecipient, 'recipient balance overflow');
        balanceOf[recipient] = balanceRecipient + amount;

        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        uint256 allowanceBefore = allowance[sender][msg.sender];
        require(allowanceBefore >= amount, 'allowance insufficient');

        allowance[sender][msg.sender] = allowanceBefore - amount;

        uint256 balanceRecipient = balanceOf[recipient];
        require(balanceRecipient + amount >= balanceRecipient, 'overflow balance recipient');
        balanceOf[recipient] = balanceRecipient + amount;
        uint256 balanceSender = balanceOf[sender];
        require(balanceSender >= amount, 'underflow balance sender');
        balanceOf[sender] = balanceSender - amount;

        emit Transfer(sender, recipient, amount);
        return true;
    }
}
