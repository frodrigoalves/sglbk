// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockToken
 * @dev A simple ERC20 token for testing SingulAI MVP with governance capabilities
 */
contract MockToken is ERC20, ERC20Votes, Ownable {
    // Mapping to track authorized contracts
    mapping(address => bool) public authorizedContracts;
    
    /**
     * @dev Constructor that gives the msg.sender all existing tokens
     */
    constructor(uint256 initialSupply) ERC20("SingulAI Token", "SGL") ERC20Permit("SingulAI Token") Ownable() {
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @dev Authorize a contract to interact with this token
     */
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }
    
    /**
     * @dev Revoke authorization for a contract
     */
    function revokeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }
    
    /**
     * @dev Check if a contract is authorized
     */
    function isContractAuthorized(address contractAddress) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }
    
    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Required overrides for ERC20Votes
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}