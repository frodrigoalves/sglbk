// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SingulAITreasury
 * @dev A treasury contract for the SingulAI DAO that holds and manages funds.
 * It can only be controlled by the DAO contract.
 */
contract SingulAITreasury is Ownable {
    using SafeERC20 for IERC20;

    // Events
    event FundsReceived(address indexed sender, uint256 amount);
    event FundsSent(address indexed recipient, uint256 amount);
    event TokensReceived(address indexed token, address indexed sender, uint256 amount);
    event TokensSent(address indexed token, address indexed recipient, uint256 amount);
    
    /**
     * @dev Constructor that sets the DAO as the owner
     * @param _daoAddress Address of the DAO contract that will control this treasury
     */
    constructor(address _daoAddress) {
        require(_daoAddress != address(0), "DAO address cannot be zero");
        transferOwnership(_daoAddress);
    }
    
    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Sends ETH to a recipient (can only be called by the DAO)
     * @param _recipient Address to send ETH to
     * @param _amount Amount of ETH to send
     */
    function sendETH(address payable _recipient, uint256 _amount) external onlyOwner {
        require(_recipient != address(0), "Cannot send to zero address");
        require(_amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= _amount, "Insufficient balance");
        
        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "ETH transfer failed");
        
        emit FundsSent(_recipient, _amount);
    }
    
    /**
     * @dev Allows the treasury to receive ERC20 tokens
     * @param _token Address of the ERC20 token
     * @param _amount Amount of tokens to transfer to the treasury
     */
    function depositTokens(address _token, uint256 _amount) external {
        require(_token != address(0), "Token address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");
        
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        emit TokensReceived(_token, msg.sender, _amount);
    }
    
    /**
     * @dev Sends ERC20 tokens to a recipient (can only be called by the DAO)
     * @param _token Address of the ERC20 token
     * @param _recipient Address to send tokens to
     * @param _amount Amount of tokens to send
     */
    function sendTokens(address _token, address _recipient, uint256 _amount) external onlyOwner {
        require(_token != address(0), "Token address cannot be zero");
        require(_recipient != address(0), "Cannot send to zero address");
        require(_amount > 0, "Amount must be greater than zero");
        
        IERC20(_token).safeTransfer(_recipient, _amount);
        
        emit TokensSent(_token, _recipient, _amount);
    }
    
    /**
     * @dev Gets the current ETH balance of the treasury
     * @return The ETH balance
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Gets the current token balance of the treasury
     * @param _token Address of the ERC20 token
     * @return The token balance
     */
    function getTokenBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
}