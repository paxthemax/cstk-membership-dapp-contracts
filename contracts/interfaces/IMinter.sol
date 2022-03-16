// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.17;

/// @title IMinter
/// @notice CSTK token minter interface
contract IMinter {
    /// @notice Set the ratio (numerator/denominator) used for minting calculation.
    /// @dev Can only be called by an Admin account.
    /// @param _numerator The ratio numerator
    /// @param _denominator The ratio denominator
    function setRatio(uint256 _numerator, uint256 _denominator) external;

    /// @notice Mint a given amount of CSTK tokens to a recipient account.
    ///
    /// If the account is not a member (has a CSTK token balance of 0), this will increase the pending balance
    /// of the account.
    ///
    /// The recipient cannot receive an mount of tokens greater than the `maxTrust` value of her account
    /// in the Registry contract.
    /// @dev Can only be called by an Admin account.
    /// @param recipient The account to receive CSTK tokens
    /// @param toMint The amount of CSTK we expect to mint
    function mint(address recipient, uint256 toMint) external;

    /// @notice Change the address of the collector.
    /// @dev Can only be called by an Admin account.
    /// @param _collector The collector address.
    function changeCollector(address payable _collector) external;

    /// @notice Pay eth and mint the appropiate amount of CSTK tokens to the beneficiary.
    ///
    /// The amount of tokens recieved is equal to value of eth send multiplied by the current ratio.
    /// @dev Payments are forwarded to the collector.
    /// @param beneficiary The beneficiary of the minted CSTK tokens
    function pay(address beneficiary) external payable;

    /// @dev Event emitted when a payment of eth is received by the Minter
    /// @param sender The account making the payment
    /// @param amount The amount of wei received
    event PaymentReceived(address sender, uint256 amount);

    /// @dev Event emitted when CSTK tokens are minted to the recipient.
    /// @param recipient The address receiving the tokens
    /// @param amount The amount of CSTK tokens received
    event Mint(address indexed recipient, uint256 amount);

    /// @dev Event emitted when the mint ratio is changed
    /// @param nominator The new nominator value
    /// @param denominator The new denominator value
    event RatioChanged(uint256 nominator, uint256 denominator);

    /// @dev Event emitted when the collector address is changed
    /// @param collector The new collector address
    /// @param admin The admin that made the change
    event CollectorChanged(address indexed collector, address admin);
}
