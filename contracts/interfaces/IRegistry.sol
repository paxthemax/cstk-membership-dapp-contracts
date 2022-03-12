// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.17;

/// @title Registry tracks trusted contributors: accounts and their max trust.
// Max trust will determine the maximum amount of tokens the account can obtain.
/// @author Nelson Melina, Pavle Batuta
interface IRegistry {
    /// @dev Emit when a contributor has been added:
    event ContributorAdded(address adr);

    /// @dev Emit when a contributor has been removed:
    event ContributorRemoved(address adr);

    /// @notice Register a contributor and set a non-zero max trust.
    /// @dev Can only be called by Admin role.
    /// @param _adr (address) The address to register as contributor
    /// @param _maxTrust (uint256) The amount to set as max trust
    function registerContributor(address _adr, uint256 _maxTrust) external;

    /// @notice Remove an existing contributor.
    /// @dev Can only be called by Admin role.
    /// @param _adr (address) Address to remove
    function removeContributor(address _adr) external;

    /// @notice Register a list of contributors with max trust amounts.
    /// @dev Can only be called by Admin role.
    /// @param _cnt (uint256) Number of contributors to add
    /// @param _adrs (address[]) Addresses to register as contributors
    /// @param _trusts (uint256[]) Max trust values to set to each contributor (in order)
    function registerContributors(
        uint256 _cnt,
        address[] calldata _adrs,
        uint256[] calldata _trusts
    ) external;

    /// @notice Return all registered contributor addresses.
    /// @return contributors (address[]) Adresses of all contributors
    function getContributors() external view returns (address[] memory contributors);

    /// @notice Return contributor information about all accounts in the Registry.
    /// @return contrubutors (address[]) Adresses of all contributors
    /// @return trusts (uint256[]) Max trust values for all contributors, in order.
    function getContributorInfo() external view returns (address[] memory contributors, uint256[] memory trusts);

    /// @notice Return the max trust of an address, or 0 if the address is not a contributor.
    /// @param _adr (address) Address to check
    /// @return allowed (uint256) Max trust of the address, or 0 if not a contributor.
    function getMaxTrust(address _adr) external view returns (uint256 maxTrust);
}
