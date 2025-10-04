// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockSGLToken
 * @dev A mock SGL token for testing purposes
 */
contract MockSGLToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("SingulAI Token", "SGL") {
        _mint(msg.sender, initialSupply);
    }
    
    // Function to mint more tokens (only for testing)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}