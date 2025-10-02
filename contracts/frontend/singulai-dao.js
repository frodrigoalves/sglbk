// SingulAI DAO Frontend Integration
// This file provides functionality for interacting with the SingulAI DAO contracts

// DAO contract configurations
const DAO_CONTRACTS = {
    SINGULAI_DAO: {
        address: '', // Will be filled after deployment
        abi: [
            // Only including the methods we need for the frontend
            "function createProposal(string memory _description, uint256 _votingPeriod, address _target, bytes memory _callData) public returns (uint256)",
            "function castVote(uint256 _proposalId, bool _support) public",
            "function executeProposal(uint256 _proposalId) public",
            "function cancelProposal(uint256 _proposalId) public",
            "function getProposalStatus(uint256 _proposalId) public view returns (uint8)",
            "function proposals(uint256 proposalId) public view returns (address proposer, string description, uint256 startTime, uint256 endTime, address target, bytes callData, uint256 forVotes, uint256 againstVotes, bool executed, bool canceled)",
            "function proposalCount() public view returns (uint256)",
            "function proposalThreshold() public view returns (uint256)",
            "function minVotingPeriod() public view returns (uint256)",
            "function quorumPercentage() public view returns (uint256)",
            "function hasRole(bytes32 role, address account) public view returns (bool)",
            "function ADMIN_ROLE() public view returns (bytes32)",
            "function sglToken() public view returns (address)"
        ]
    },
    SINGULAI_TREASURY: {
        address: '', // Will be filled after deployment
        abi: [
            "function getETHBalance() external view returns (uint256)",
            "function getTokenBalance(address _token) external view returns (uint256)",
            "function depositTokens(address _token, uint256 _amount) external",
            "event FundsReceived(address indexed sender, uint256 amount)",
            "event FundsSent(address indexed recipient, uint256 amount)",
            "event TokensReceived(address indexed token, address indexed sender, uint256 amount)",
            "event TokensSent(address indexed token, address indexed recipient, uint256 amount)"
        ]
    }
};

// Initialize the DAO functionality
class SingulAIDAOManager {
    constructor(web3Instance, tokenAddress) {
        this.web3 = web3Instance;
        this.userAccount = null;
        this.tokenAddress = tokenAddress;
        this.daoContract = null;
        this.treasuryContract = null;
        this.tokenContract = null;
        this.isInitialized = false;
        
        // Status mapping for proposals
        this.proposalStatus = [
            "Pending",
            "Active",
            "Canceled",
            "Defeated",
            "Succeeded",
            "Executed"
        ];
    }
    
    // Initialize the DAO contracts
    async initialize(daoAddress, treasuryAddress) {
        try {
            if (!this.web3) {
                console.error("Web3 not available");
                return false;
            }
            
            // Store contract addresses
            DAO_CONTRACTS.SINGULAI_DAO.address = daoAddress;
            DAO_CONTRACTS.SINGULAI_TREASURY.address = treasuryAddress;
            
            // Initialize DAO contract
            this.daoContract = new this.web3.eth.Contract(
                DAO_CONTRACTS.SINGULAI_DAO.abi,
                daoAddress
            );
            
            // Initialize Treasury contract
            this.treasuryContract = new this.web3.eth.Contract(
                DAO_CONTRACTS.SINGULAI_TREASURY.abi,
                treasuryAddress
            );
            
            // Get token ABI from existing contracts
            const tokenAbi = CONTRACTS.MOCK_TOKEN.abi;
            
            // Initialize token contract
            this.tokenContract = new this.web3.eth.Contract(
                tokenAbi,
                this.tokenAddress
            );
            
            this.isInitialized = true;
            console.log("DAO Manager initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing DAO Manager:", error);
            return false;
        }
    }
    
    // Set the current user account
    setAccount(account) {
        this.userAccount = account;
    }
    
    // Get proposal threshold in tokens
    async getProposalThreshold() {
        if (!this.isInitialized) return 0;
        
        try {
            const threshold = await this.daoContract.methods.proposalThreshold().call();
            return this.web3.utils.fromWei(threshold, 'ether');
        } catch (error) {
            console.error("Error getting proposal threshold:", error);
            return 0;
        }
    }
    
    // Get the total number of proposals
    async getProposalCount() {
        if (!this.isInitialized) return 0;
        
        try {
            return await this.daoContract.methods.proposalCount().call();
        } catch (error) {
            console.error("Error getting proposal count:", error);
            return 0;
        }
    }
    
    // Get details for a specific proposal
    async getProposal(proposalId) {
        if (!this.isInitialized) return null;
        
        try {
            const proposal = await this.daoContract.methods.proposals(proposalId).call();
            const status = await this.daoContract.methods.getProposalStatus(proposalId).call();
            
            // Format the proposal data
            return {
                id: proposalId,
                proposer: proposal.proposer,
                description: proposal.description,
                startTime: new Date(proposal.startTime * 1000).toLocaleString(),
                endTime: new Date(proposal.endTime * 1000).toLocaleString(),
                forVotes: this.web3.utils.fromWei(proposal.forVotes, 'ether'),
                againstVotes: this.web3.utils.fromWei(proposal.againstVotes, 'ether'),
                executed: proposal.executed,
                canceled: proposal.canceled,
                status: this.proposalStatus[status],
                statusCode: status
            };
        } catch (error) {
            console.error(`Error getting proposal ${proposalId}:`, error);
            return null;
        }
    }
    
    // Get multiple proposals
    async getProposals(startId, count) {
        if (!this.isInitialized) return [];
        
        try {
            const proposals = [];
            const totalProposals = await this.getProposalCount();
            const endId = Math.min(startId + count, totalProposals);
            
            for (let i = startId; i < endId; i++) {
                const proposal = await this.getProposal(i);
                if (proposal) {
                    proposals.push(proposal);
                }
            }
            
            return proposals;
        } catch (error) {
            console.error("Error getting proposals:", error);
            return [];
        }
    }
    
    // Create a new proposal
    async createProposal(description, votingPeriodDays, targetAddress, callData) {
        if (!this.isInitialized || !this.userAccount) {
            console.error("DAO not initialized or user not connected");
            return null;
        }
        
        try {
            // Convert days to seconds
            const votingPeriod = votingPeriodDays * 24 * 60 * 60;
            
            // Check if user has enough tokens to create a proposal
            const threshold = await this.daoContract.methods.proposalThreshold().call();
            const balance = await this.tokenContract.methods.balanceOf(this.userAccount).call();
            
            if (BigInt(balance) < BigInt(threshold)) {
                const thresholdInTokens = this.web3.utils.fromWei(threshold, 'ether');
                throw new Error(`Insufficient token balance. You need at least ${thresholdInTokens} SGL tokens to create a proposal.`);
            }
            
            // Create the proposal
            const tx = await this.daoContract.methods.createProposal(
                description,
                votingPeriod,
                targetAddress,
                callData
            ).send({ from: this.userAccount });
            
            // Extract the proposal ID from the event
            const proposalId = tx.events.ProposalCreated.returnValues.proposalId;
            
            return {
                success: true,
                proposalId: proposalId,
                txHash: tx.transactionHash
            };
        } catch (error) {
            console.error("Error creating proposal:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Vote on a proposal
    async voteOnProposal(proposalId, support) {
        if (!this.isInitialized || !this.userAccount) {
            console.error("DAO not initialized or user not connected");
            return false;
        }
        
        try {
            await this.daoContract.methods.castVote(proposalId, support)
                .send({ from: this.userAccount });
            return true;
        } catch (error) {
            console.error("Error voting on proposal:", error);
            return false;
        }
    }
    
    // Execute a proposal
    async executeProposal(proposalId) {
        if (!this.isInitialized || !this.userAccount) {
            console.error("DAO not initialized or user not connected");
            return false;
        }
        
        try {
            await this.daoContract.methods.executeProposal(proposalId)
                .send({ from: this.userAccount });
            return true;
        } catch (error) {
            console.error("Error executing proposal:", error);
            return false;
        }
    }
    
    // Cancel a proposal
    async cancelProposal(proposalId) {
        if (!this.isInitialized || !this.userAccount) {
            console.error("DAO not initialized or user not connected");
            return false;
        }
        
        try {
            await this.daoContract.methods.cancelProposal(proposalId)
                .send({ from: this.userAccount });
            return true;
        } catch (error) {
            console.error("Error canceling proposal:", error);
            return false;
        }
    }
    
    // Get treasury ETH balance
    async getTreasuryETHBalance() {
        if (!this.isInitialized) return 0;
        
        try {
            const balance = await this.treasuryContract.methods.getETHBalance().call();
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error("Error getting treasury ETH balance:", error);
            return 0;
        }
    }
    
    // Get treasury token balance
    async getTreasuryTokenBalance() {
        if (!this.isInitialized) return 0;
        
        try {
            const balance = await this.treasuryContract.methods.getTokenBalance(this.tokenAddress).call();
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error("Error getting treasury token balance:", error);
            return 0;
        }
    }
    
    // Deposit tokens into the treasury
    async depositTokensToTreasury(amount) {
        if (!this.isInitialized || !this.userAccount) {
            console.error("DAO not initialized or user not connected");
            return false;
        }
        
        try {
            // Convert amount to wei
            const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
            
            // First approve the tokens
            await this.tokenContract.methods.approve(
                this.treasuryContract._address,
                amountWei
            ).send({ from: this.userAccount });
            
            // Then deposit them
            await this.treasuryContract.methods.depositTokens(
                this.tokenAddress,
                amountWei
            ).send({ from: this.userAccount });
            
            return true;
        } catch (error) {
            console.error("Error depositing tokens to treasury:", error);
            return false;
        }
    }
    
    // Check if user is an admin
    async isAdmin() {
        if (!this.isInitialized || !this.userAccount) return false;
        
        try {
            const adminRole = await this.daoContract.methods.ADMIN_ROLE().call();
            return await this.daoContract.methods.hasRole(adminRole, this.userAccount).call();
        } catch (error) {
            console.error("Error checking admin role:", error);
            return false;
        }
    }
    
    // Generate call data for a token transfer from the treasury
    generateTokenTransferCallData(recipient, amount) {
        if (!this.web3) return null;
        
        try {
            // Create interface for treasury contract
            const treasuryInterface = new this.web3.eth.Contract([
                {
                    "inputs": [
                        {"name": "_token", "type": "address"},
                        {"name": "_recipient", "type": "address"},
                        {"name": "_amount", "type": "uint256"}
                    ],
                    "name": "sendTokens",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ]);
            
            // Convert amount to wei
            const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
            
            // Encode function call
            return treasuryInterface.methods.sendTokens(
                this.tokenAddress,
                recipient,
                amountWei
            ).encodeABI();
        } catch (error) {
            console.error("Error generating call data:", error);
            return null;
        }
    }
    
    // Generate call data for an ETH transfer from the treasury
    generateETHTransferCallData(recipient, amount) {
        if (!this.web3) return null;
        
        try {
            // Create interface for treasury contract
            const treasuryInterface = new this.web3.eth.Contract([
                {
                    "inputs": [
                        {"name": "_recipient", "type": "address"},
                        {"name": "_amount", "type": "uint256"}
                    ],
                    "name": "sendETH",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ]);
            
            // Convert amount to wei
            const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
            
            // Encode function call
            return treasuryInterface.methods.sendETH(
                recipient,
                amountWei
            ).encodeABI();
        } catch (error) {
            console.error("Error generating call data:", error);
            return null;
        }
    }
}

// Create singleton instance when script loads
let daoManager = null;