// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SingulAIDAO
 * @dev DAO governance contract for SingulAI platform
 */
contract SingulAIDAO is AccessControl {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // State variables
    ERC20Votes public immutable token;
    address public immutable treasury;
    uint256 public proposalCount;
    uint256 public constant PROPOSAL_THRESHOLD = 100 * 10**18; // 100 tokens to create proposal
    uint256 public constant QUORUM_VOTES = 500 * 10**18; // 500 tokens needed for quorum
    uint256 public constant MIN_VOTING_PERIOD = 1 days; // Minimum voting period

    // Proposal struct
    struct Proposal {
        uint256 id;
        address proposer;
        address target;
        uint256 value;
        bytes data;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool canceled;
        string description;
        mapping(address => bool) hasVoted;
    }

    // Events
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        address targets,
        uint256 values,
        string description,
        uint256 endTime
    );
    event VoteCast(
        address indexed voter,
        uint256 proposalId,
        bool support,
        uint256 weight
    );
    event ProposalExecuted(uint256 proposalId);
    event ProposalCanceled(uint256 proposalId);

    // Proposal state enum
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Executed
    }

    // Storage for proposals
    mapping(uint256 => Proposal) public proposals;

    /**
     * @dev Constructor sets the token and treasury address
     * @param _token Address of the governance token
     * @param _treasury Address of the treasury contract
     */
    constructor(address _token, address _treasury) {
        require(_token != address(0), "Token address cannot be zero");
        require(_treasury != address(0), "Treasury address cannot be zero");
        
        token = ERC20Votes(_token);
        treasury = _treasury;
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Creates a new proposal
     * @param description Description of the proposal
     * @param target Target address for the proposal action
     * @param value ETH value to send with the proposal
     * @param data Function call data for the target
     * @param votingPeriod Duration of the voting period in seconds
     * @return uint256 Proposal ID
     */
    function createProposal(
        string memory description,
        address target,
        uint256 value,
        bytes memory data,
        uint256 votingPeriod
    ) public returns (uint256) {
        require(token.getVotes(msg.sender) >= PROPOSAL_THRESHOLD, "Not enough votes to create proposal");
        require(votingPeriod >= MIN_VOTING_PERIOD, "Voting period too short");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(target != address(0), "Target cannot be zero address");

        uint256 proposalId = proposalCount++;
        Proposal storage newProposal = proposals[proposalId];
        
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.target = target;
        newProposal.value = value;
        newProposal.data = data;
        newProposal.description = description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingPeriod;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            target,
            value,
            description,
            newProposal.endTime
        );
        
        return proposalId;
    }

    /**
     * @dev Casts a vote on a proposal
     * @param proposalId ID of the proposal
     * @param support Whether to support the proposal
     */
    function castVote(uint256 proposalId, bool support) public {
        require(state(proposalId) == ProposalState.Active, "Proposal not active");
        
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votes = token.getVotes(msg.sender);
        require(votes > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit VoteCast(msg.sender, proposalId, support, votes);
    }

    /**
     * @dev Executes a successful proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) public {
        require(state(proposalId) == ProposalState.Succeeded, "Proposal not successful");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancels a proposal (only proposer or admin)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) public {
        ProposalState currentState = state(proposalId);
        require(
            currentState == ProposalState.Pending || 
            currentState == ProposalState.Active, 
            "Cannot cancel completed proposal"
        );
        
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.proposer == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to cancel"
        );
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }

    /**
     * @dev Gets the current state of a proposal
     * @param proposalId ID of the proposal
     * @return ProposalState Current state of the proposal
     */
    function state(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.Canceled;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        } else if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        } else if (proposal.forVotes <= proposal.againstVotes || 
                  proposal.forVotes < QUORUM_VOTES) {
            return ProposalState.Defeated;
        } else {
            return ProposalState.Succeeded;
        }
    }

    /**
     * @dev Checks if a voter has voted on a proposal
     * @param proposalId ID of the proposal
     * @param account Address of the voter
     * @return bool Whether the voter has voted
     */
    function hasVoted(uint256 proposalId, address account) public view returns (bool) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        return proposals[proposalId].hasVoted[account];
    }

    /**
     * @dev Gets the voting power of an account
     * @param account Address of the voter
     * @return uint256 Voting power
     */
    function getVotes(address account) public view returns (uint256) {
        return token.getVotes(account);
    }
}