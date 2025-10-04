const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SingulAIDAO", function () {
  let mockToken;
  let dao;
  let treasury;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  
  // Constants for DAO parameters
  const PROPOSAL_THRESHOLD = ethers.utils.parseEther("1000");
  const MIN_VOTING_PERIOD = 60 * 60 * 24; // 1 day in seconds
  const QUORUM_PERCENTAGE = 10; // 10%
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    
    // Deploy mock SGL token
    const MockSGLToken = await ethers.getContractFactory("MockSGLToken");
    mockToken = await MockSGLToken.deploy(ethers.utils.parseEther("1000000")); // 1 million tokens
    await mockToken.deployed();
    
    // Distribute tokens for testing
    await mockToken.transfer(addr1.address, ethers.utils.parseEther("100000")); // 100k tokens
    await mockToken.transfer(addr2.address, ethers.utils.parseEther("200000")); // 200k tokens
    await mockToken.transfer(addr3.address, ethers.utils.parseEther("50000"));  // 50k tokens
    
    // Deploy DAO
    const SingulAIDAO = await ethers.getContractFactory("SingulAIDAO");
    dao = await SingulAIDAO.deploy(
      mockToken.address,
      PROPOSAL_THRESHOLD,
      MIN_VOTING_PERIOD,
      QUORUM_PERCENTAGE
    );
    await dao.deployed();
    
    // Deploy Treasury
    const SingulAITreasury = await ethers.getContractFactory("SingulAITreasury");
    treasury = await SingulAITreasury.deploy(dao.address);
    await treasury.deployed();
  });
  
  describe("Deployment", function () {
    it("Should set the right token address", async function () {
      expect(await dao.sglToken()).to.equal(mockToken.address);
    });
    
    it("Should set the correct proposal threshold", async function () {
      expect(await dao.proposalThreshold()).to.equal(PROPOSAL_THRESHOLD);
    });
    
    it("Should set the correct minimum voting period", async function () {
      expect(await dao.minVotingPeriod()).to.equal(MIN_VOTING_PERIOD);
    });
    
    it("Should set the correct quorum percentage", async function () {
      expect(await dao.quorumPercentage()).to.equal(QUORUM_PERCENTAGE);
    });
    
    it("Should set the deployer as admin", async function () {
      const ADMIN_ROLE = await dao.ADMIN_ROLE();
      expect(await dao.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    });
    
    it("Treasury should be owned by the DAO", async function () {
      expect(await treasury.owner()).to.equal(dao.address);
    });
  });
  
  describe("Proposal Creation", function () {
    it("Should allow users with enough tokens to create proposals", async function () {
      // addr2 has enough tokens to create a proposal
      const callData = "0x";
      const proposal = await dao.connect(addr2).createProposal(
        "Test Proposal",
        MIN_VOTING_PERIOD,
        treasury.address,
        callData
      );
      
      const txReceipt = await proposal.wait();
      const proposalId = txReceipt.events[0].args.proposalId;
      
      expect(proposalId).to.equal(0);
    });
    
    it("Should not allow users without enough tokens to create proposals", async function () {
      // Create a new signer with no tokens
      const noTokenSigner = ethers.Wallet.createRandom().connect(ethers.provider);
      
      // Try to create a proposal
      await expect(
        dao.connect(noTokenSigner).createProposal(
          "Test Proposal",
          MIN_VOTING_PERIOD,
          treasury.address,
          "0x"
        )
      ).to.be.revertedWith("Insufficient tokens to create proposal");
    });
    
    it("Should not allow proposals with voting period less than minimum", async function () {
      const tooShortVotingPeriod = MIN_VOTING_PERIOD - 1;
      
      await expect(
        dao.connect(addr2).createProposal(
          "Test Proposal",
          tooShortVotingPeriod,
          treasury.address,
          "0x"
        )
      ).to.be.revertedWith("Voting period too short");
    });
    
    it("Should not allow proposals with zero target address", async function () {
      await expect(
        dao.connect(addr2).createProposal(
          "Test Proposal",
          MIN_VOTING_PERIOD,
          ethers.constants.AddressZero,
          "0x"
        )
      ).to.be.revertedWith("Target cannot be zero address");
    });
  });
  
  describe("Voting", function () {
    let proposalId;
    
    beforeEach(async function () {
      // Create a proposal
      const tx = await dao.connect(addr2).createProposal(
        "Test Proposal",
        MIN_VOTING_PERIOD,
        treasury.address,
        "0x"
      );
      const receipt = await tx.wait();
      proposalId = receipt.events[0].args.proposalId;
    });
    
    it("Should allow token holders to vote on proposals", async function () {
      // addr1 votes in favor
      await dao.connect(addr1).castVote(proposalId, true);
      
      // Check vote count
      const proposal = await dao.proposals(proposalId);
      expect(proposal.forVotes).to.equal(ethers.utils.parseEther("100000"));
    });
    
    it("Should not allow users to vote twice", async function () {
      // addr1 votes once
      await dao.connect(addr1).castVote(proposalId, true);
      
      // Try to vote again
      await expect(
        dao.connect(addr1).castVote(proposalId, true)
      ).to.be.revertedWith("Already voted");
    });
    
    it("Should not allow users with no tokens to vote", async function () {
      const noTokenSigner = ethers.Wallet.createRandom().connect(ethers.provider);
      
      await expect(
        dao.connect(noTokenSigner).castVote(proposalId, true)
      ).to.be.revertedWith("No voting power");
    });
  });
  
  describe("Proposal Execution", function () {
    let proposalId;
    
    beforeEach(async function () {
      // Create a proposal for the treasury to receive ETH
      const callData = "0x"; // Empty call data for this test
      
      const tx = await dao.connect(addr2).createProposal(
        "Test Proposal",
        MIN_VOTING_PERIOD,
        treasury.address,
        callData
      );
      const receipt = await tx.wait();
      proposalId = receipt.events[0].args.proposalId;
      
      // Both addr1 and addr2 vote in favor (300k tokens total)
      await dao.connect(addr1).castVote(proposalId, true);
      await dao.connect(addr2).castVote(proposalId, true);
    });
    
    it("Should not allow execution before voting period ends", async function () {
      await expect(
        dao.executeProposal(proposalId)
      ).to.be.revertedWith("Voting not ended");
    });
    
    it("Should allow execution after voting period with enough votes", async function () {
      // Fast forward time to after voting period
      await ethers.provider.send("evm_increaseTime", [MIN_VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Execute proposal
      await dao.executeProposal(proposalId);
      
      // Check proposal is marked as executed
      const proposal = await dao.proposals(proposalId);
      expect(proposal.executed).to.equal(true);
    });
    
    it("Should not allow executing the same proposal twice", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [MIN_VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Execute proposal first time
      await dao.executeProposal(proposalId);
      
      // Try to execute again
      await expect(
        dao.executeProposal(proposalId)
      ).to.be.revertedWith("Proposal already executed");
    });
    
    it("Should not execute if quorum not reached", async function () {
      // Create new proposal
      const tx = await dao.connect(addr2).createProposal(
        "Low Participation Proposal",
        MIN_VOTING_PERIOD,
        treasury.address,
        "0x"
      );
      const receipt = await tx.wait();
      const newProposalId = receipt.events[0].args.proposalId;
      
      // Only addr3 votes (50k tokens, not enough for 10% quorum of 1M tokens)
      await dao.connect(addr3).castVote(newProposalId, true);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [MIN_VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Try to execute
      await expect(
        dao.executeProposal(newProposalId)
      ).to.be.revertedWith("Quorum not reached");
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow admin to update proposal threshold", async function () {
      const newThreshold = ethers.utils.parseEther("2000");
      await dao.updateProposalThreshold(newThreshold);
      expect(await dao.proposalThreshold()).to.equal(newThreshold);
    });
    
    it("Should allow admin to update minimum voting period", async function () {
      const newMinVotingPeriod = MIN_VOTING_PERIOD * 2;
      await dao.updateMinVotingPeriod(newMinVotingPeriod);
      expect(await dao.minVotingPeriod()).to.equal(newMinVotingPeriod);
    });
    
    it("Should allow admin to update quorum percentage", async function () {
      const newQuorumPercentage = 20;
      await dao.updateQuorumPercentage(newQuorumPercentage);
      expect(await dao.quorumPercentage()).to.equal(newQuorumPercentage);
    });
    
    it("Should not allow non-admin to update parameters", async function () {
      await expect(
        dao.connect(addr1).updateProposalThreshold(ethers.utils.parseEther("2000"))
      ).to.be.reverted;
      
      await expect(
        dao.connect(addr1).updateMinVotingPeriod(MIN_VOTING_PERIOD * 2)
      ).to.be.reverted;
      
      await expect(
        dao.connect(addr1).updateQuorumPercentage(20)
      ).to.be.reverted;
    });
  });
  
  describe("Treasury", function () {
    beforeEach(async function () {
      // Send some ETH to treasury
      await owner.sendTransaction({
        to: treasury.address,
        value: ethers.utils.parseEther("1.0")
      });
      
      // Send some tokens to treasury
      await mockToken.transfer(treasury.address, ethers.utils.parseEther("10000"));
    });
    
    it("Should correctly store ETH", async function () {
      expect(await ethers.provider.getBalance(treasury.address)).to.equal(ethers.utils.parseEther("1.0"));
    });
    
    it("Should correctly store tokens", async function () {
      expect(await mockToken.balanceOf(treasury.address)).to.equal(ethers.utils.parseEther("10000"));
    });
    
    it("Should not allow non-owner (non-DAO) to send funds", async function () {
      await expect(
        treasury.connect(addr1).sendETH(addr2.address, ethers.utils.parseEther("0.5"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        treasury.connect(addr1).sendTokens(mockToken.address, addr2.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should allow DAO to control funds through proposal execution", async function () {
      // Create call data for sending ETH from treasury to addr3
      const treasuryInterface = new ethers.utils.Interface([
        "function sendETH(address payable _recipient, uint256 _amount)"
      ]);
      const callData = treasuryInterface.encodeFunctionData("sendETH", [
        addr3.address,
        ethers.utils.parseEther("0.5")
      ]);
      
      // Create proposal
      const tx = await dao.connect(addr2).createProposal(
        "Send ETH from Treasury",
        MIN_VOTING_PERIOD,
        treasury.address,
        callData
      );
      const receipt = await tx.wait();
      const proposalId = receipt.events[0].args.proposalId;
      
      // Vote
      await dao.connect(addr1).castVote(proposalId, true);
      await dao.connect(addr2).castVote(proposalId, true);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [MIN_VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Record balance before
      const balanceBefore = await ethers.provider.getBalance(addr3.address);
      
      // Execute proposal
      await dao.executeProposal(proposalId);
      
      // Check balance after
      const balanceAfter = await ethers.provider.getBalance(addr3.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(ethers.utils.parseEther("0.5"));
    });
  });
});