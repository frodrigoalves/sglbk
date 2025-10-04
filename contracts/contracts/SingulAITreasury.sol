// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SingulAITreasury
 * @dev Treasury contract for the SingulAI DAO
 * Holds ETH and tokens that can be managed through DAO proposals
 */
contract SingulAITreasury {
    // State variables
    IERC20 public immutable token;
    address public immutable owner; // DAO contract address
    
    // Events
    event EthReceived(address indexed from, uint256 amount);
    event EthTransferred(address indexed to, uint256 amount);
    event TokensDeposited(address indexed from, uint256 amount);
    event TokensTransferred(address indexed to, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _token The SGL token address
     * @param _owner The owner address (DAO contract)
     */
    constructor(address _token, address _owner) {
        require(_token != address(0), "Token address cannot be zero");
        require(_owner != address(0), "Owner address cannot be zero");
        
        token = IERC20(_token);
        owner = _owner;
    }
    
    /**
     * @dev Modifier to restrict function access to owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        emit EthReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Deposit tokens into the treasury
     * @param amount Amount of tokens to deposit
     */
    function depositTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        emit TokensDeposited(msg.sender, amount);
    }
    
    /**
     * @dev Transfer tokens from treasury (only callable by owner/DAO)
     * @param to Recipient address
     * @param amount Amount of tokens to transfer
     */
    function transferTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Recipient cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        
        require(
            token.transfer(to, amount),
            "Token transfer failed"
        );
        
        emit TokensTransferred(to, amount);
    }
    
    /**
     * @dev Transfer ETH from treasury (only callable by owner/DAO)
     * @param to Recipient address
     * @param amount Amount of ETH to transfer
     */
    function transferEth(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "Recipient cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= address(this).balance, "Insufficient ETH balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit EthTransferred(to, amount);
    }
}