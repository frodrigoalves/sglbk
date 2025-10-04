// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title SingulAIDAO
 * @dev A governance DAO contract for SingulAI that allows token holders to create and vote on proposals.
 */
contract SingulAIDAO is AccessControl {
    using SafeMath for uint256;

    // Define roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    // SGL Token address
    IERC20 public sglToken;
    
    // Minimum token balance required to submit a proposal
    uint256 public proposalThreshold;
    
    // Minimum voting period in seconds
    uint256 public minVotingPeriod;
    
    // Quorum percentage (out of 100) required for a proposal to pass
    uint256 public quorumPercentage;
    
    // Structure to store proposal details
    struct Proposal {
        address proposer;         // Creator of the proposal
        string description;       // Description of what the proposal wants to achieve
        uint256 startTime;        // Start time of voting period
        uint256 endTime;          // End time of voting period
        address target;           // Contract to call if the proposal passes
        bytes callData;           // Data to pass to the target contract
        uint256 forVotes;         // Number of votes in favor
        uint256 againstVotes;     // Number of votes against
        bool executed;            // Whether the proposal has been executed
        bool canceled;            // Whether the proposal has been canceled
        mapping(address => bool) hasVoted;  // Track who has already voted
    }
    
    // Mapping to store proposals by ID
    mapping(uint256 => Proposal) public proposals;
    
    // Counter to generate new proposal IDs
    uint256 public proposalCount;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    
    /**
     * @dev Constructor to initialize the DAO contract
     * @param _tokenAddress Address of the SGL token
     * @param _proposalThreshold Minimum token balance required to submit a proposal
     * @param _minVotingPeriod Minimum voting period in seconds
     * @param _quorumPercentage Percentage of total supply required for quorum
     */
    constructor(
        address _tokenAddress,
        uint256 _proposalThreshold,
        uint256 _minVotingPeriod,
        uint256 _quorumPercentage
    ) {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(_quorumPercentage <= 100, "Quorum percentage must be <= 100");
        
        sglToken = IERC20(_tokenAddress);
        proposalThreshold = _proposalThreshold;
        minVotingPeriod = _minVotingPeriod;
        quorumPercentage = _quorumPercentage;
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PROPOSER_ROLE, msg.sender);
    }
    
    /**
     * @dev Creates a new proposal
     * @param _description Description of the proposal
     * @param _votingPeriod Voting period in seconds (must be >= minVotingPeriod)
     * @param _target Contract to call if the proposal passes
     * @param _callData Function data to call on the target contract
     * @return proposalId The ID of the newly created proposal
     */
    function createProposal(
        string memory _description,
        uint256 _votingPeriod,
        address _target,
        bytes memory _callData
    ) public returns (uint256) {
        require(
            sglToken.balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient tokens to create proposal"
        );
        require(_votingPeriod >= minVotingPeriod, "Voting period too short");
        require(_target != address(0), "Target cannot be zero address");
        
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _votingPeriod;
        
        uint256 proposalId = proposalCount++;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.proposer = msg.sender;
        newProposal.description = _description;
        newProposal.startTime = startTime;
        newProposal.endTime = endTime;
        newProposal.target = _target;
        newProposal.callData = _callData;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            _description,
            startTime,
            endTime
        );
        
        return proposalId;
    }
    
    /**
     * @dev Allows a token holder to cast a vote on a proposal
     * @param _proposalId The ID of the proposal to vote on
     * @param _support Whether the voter supports the proposal
     */
    function castVote(uint256 _proposalId, bool _support) public {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votes = sglToken.balanceOf(msg.sender);
        require(votes > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.forVotes = proposal.forVotes.add(votes);
        } else {
            proposal.againstVotes = proposal.againstVotes.add(votes);
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, votes);
    }
    
    /**
     * @dev Executes a proposal if it has passed
     * @param _proposalId The ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) public {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        uint256 totalVotes = proposal.forVotes.add(proposal.againstVotes);
        uint256 totalTokens = sglToken.totalSupply();
        uint256 quorumVotes = totalTokens.mul(quorumPercentage).div(100);
        
        require(totalVotes >= quorumVotes, "Quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        // Execute the proposal call
        (bool success, ) = proposal.target.call(proposal.callData);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(_proposalId);
    }
    
    /**
     * @dev Cancels a proposal (only the proposer or admin can cancel)
     * @param _proposalId The ID of the proposal to cancel
     */
    function cancelProposal(uint256 _proposalId) public {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        
        require(
            proposal.proposer == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not proposer or admin"
        );
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(_proposalId);
    }
    
    /**
     * @dev Checks if a proposal has reached quorum
     * @param _proposalId The ID of the proposal to check
     * @return bool True if quorum has been reached
     */
    function hasReachedQuorum(uint256 _proposalId) public view returns (bool) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        
        uint256 totalVotes = proposal.forVotes.add(proposal.againstVotes);
        uint256 totalTokens = sglToken.totalSupply();
        uint256 quorumVotes = totalTokens.mul(quorumPercentage).div(100);
        
        return totalVotes >= quorumVotes;
    }
    
    /**
     * @dev Gets the current status of a proposal
     * @param _proposalId The ID of the proposal to check
     * @return status 0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded, 5=Executed
     */
    function getProposalStatus(uint256 _proposalId) public view returns (uint8) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.canceled) {
            return 2; // Canceled
        }
        
        if (proposal.executed) {
            return 5; // Executed
        }
        
        if (block.timestamp <= proposal.startTime) {
            return 0; // Pending
        }
        
        if (block.timestamp <= proposal.endTime) {
            return 1; // Active
        }
        
        uint256 totalVotes = proposal.forVotes.add(proposal.againstVotes);
        uint256 totalTokens = sglToken.totalSupply();
        uint256 quorumVotes = totalTokens.mul(quorumPercentage).div(100);
        
        if (totalVotes < quorumVotes) {
            return 3; // Defeated (no quorum)
        }
        
        if (proposal.forVotes <= proposal.againstVotes) {
            return 3; // Defeated (more against votes)
        }
        
        return 4; // Succeeded
    }
    
    /**
     * @dev Updates the proposal threshold
     * @param _newThreshold New threshold value
     */
    function updateProposalThreshold(uint256 _newThreshold) public onlyRole(ADMIN_ROLE) {
        proposalThreshold = _newThreshold;
    }
    
    /**
     * @dev Updates the minimum voting period
     * @param _newMinVotingPeriod New minimum voting period in seconds
     */
    function updateMinVotingPeriod(uint256 _newMinVotingPeriod) public onlyRole(ADMIN_ROLE) {
        minVotingPeriod = _newMinVotingPeriod;
    }
    
    /**
     * @dev Updates the quorum percentage
     * @param _newQuorumPercentage New quorum percentage (0-100)
     */
    function updateQuorumPercentage(uint256 _newQuorumPercentage) public onlyRole(ADMIN_ROLE) {
        require(_newQuorumPercentage <= 100, "Quorum percentage must be <= 100");
        quorumPercentage = _newQuorumPercentage;
    }
    
    /**
     * @dev Grants the proposer role to an address
     * @param _address Address to grant the role to
     */
    function addProposer(address _address) public onlyRole(ADMIN_ROLE) {
        grantRole(PROPOSER_ROLE, _address);
    }
    
    /**
     * @dev Revokes the proposer role from an address
     * @param _address Address to revoke the role from
     */
    function removeProposer(address _address) public onlyRole(ADMIN_ROLE) {
        revokeRole(PROPOSER_ROLE, _address);
    }
}