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

    function deposit(
        address sender,
        address token,
        uint64 receiverId,
        uint256 amount,
        bytes32 homeTx
    ) external;

    /// @notice Change the address of the collector.
    /// @dev Can only be called by an Admin account.
    /// @param _collector The collector address.
    function changeCollector(address _collector) external;

    /// @dev Event emitted when a donation has been made by a sender.
    /// @param sender The sender that made the donation
    /// @param token The token received
    /// @param receiverId TODO: do we need this?
    /// @param amount The amount of tokens donated
    /// @param receivedCSTK The amount of CSTK tokens received in return
    /// @param homeTx TODO: do we need this?
    event Donate(
        address indexed sender,
        address indexed token,
        uint64 indexed receiverId,
        uint256 amount,
        uint256 receivedCSTK,
        bytes32 homeTx
    );

    /// @dev Event emitted when CSTK tokens are minted to the recipient.
    /// @param recipient The address receiving the tokens
    /// @param amount The amount of CSTK tokens received
    event Mint(address indexed recipient, uint256 amount);

    /// @dev Event emitted when the collector address is changed
    /// @param collector The new collector address
    /// @param admin The admin that made the change
    event CollectorChanged(address indexed collector, address admin);
}
