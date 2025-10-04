const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SingulAITreasury", function () {
  let mockToken;
  let treasury;
  let dao; // We'll use a mock DAO (just the owner address) for these tests
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // For simplicity, we'll use owner as the mock DAO
    dao = owner;
    
    // Deploy mock SGL token
    const MockSGLToken = await ethers.getContractFactory("MockSGLToken");
    mockToken = await MockSGLToken.deploy(ethers.utils.parseEther("1000000"));
    await mockToken.deployed();
    
    // Deploy Treasury with the owner (mock DAO) as controller
    const SingulAITreasury = await ethers.getContractFactory("SingulAITreasury");
    treasury = await SingulAITreasury.deploy(dao.address);
    await treasury.deployed();
    
    // Send some ETH to treasury
    await addr1.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1.0")
    });
    
    // Send some tokens to treasury
    await mockToken.transfer(treasury.address, ethers.utils.parseEther("10000"));
  });
  
  describe("Deployment", function () {
    it("Should set the correct owner (DAO)", async function () {
      expect(await treasury.owner()).to.equal(dao.address);
    });
  });
  
  describe("ETH Management", function () {
    it("Should accept ETH transfers", async function () {
      // Send additional ETH
      await addr1.sendTransaction({
        to: treasury.address,
        value: ethers.utils.parseEther("0.5")
      });
      
      // Check balance
      expect(await ethers.provider.getBalance(treasury.address)).to.equal(
        ethers.utils.parseEther("1.5")
      );
    });
    
    it("Should report ETH balance correctly", async function () {
      const balance = await treasury.getETHBalance();
      expect(balance).to.equal(ethers.utils.parseEther("1.0"));
    });
    
    it("Should allow owner (DAO) to send ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(addr2.address);
      
      // Send ETH to addr2
      await treasury.sendETH(addr2.address, ethers.utils.parseEther("0.5"));
      
      // Check addr2 received the ETH
      const newBalance = await ethers.provider.getBalance(addr2.address);
      expect(newBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther("0.5"));
      
      // Check treasury balance decreased
      expect(await ethers.provider.getBalance(treasury.address)).to.equal(
        ethers.utils.parseEther("0.5")
      );
    });
    
    it("Should not allow non-owner to send ETH", async function () {
      await expect(
        treasury.connect(addr1).sendETH(addr2.address, ethers.utils.parseEther("0.1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should not allow sending more ETH than balance", async function () {
      await expect(
        treasury.sendETH(addr2.address, ethers.utils.parseEther("2.0"))
      ).to.be.revertedWith("Insufficient balance");
    });
    
    it("Should not allow sending 0 ETH", async function () {
      await expect(
        treasury.sendETH(addr2.address, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });
    
    it("Should not allow sending ETH to zero address", async function () {
      await expect(
        treasury.sendETH(ethers.constants.AddressZero, ethers.utils.parseEther("0.1"))
      ).to.be.revertedWith("Cannot send to zero address");
    });
  });
  
  describe("Token Management", function () {
    it("Should report token balance correctly", async function () {
      const balance = await treasury.getTokenBalance(mockToken.address);
      expect(balance).to.equal(ethers.utils.parseEther("10000"));
    });
    
    it("Should allow deposit of tokens", async function () {
      // Approve first
      await mockToken.connect(addr1).approve(treasury.address, ethers.utils.parseEther("500"));
      
      // Deposit
      await treasury.connect(addr1).depositTokens(
        mockToken.address, 
        ethers.utils.parseEther("500")
      );
      
      // Check balance
      const balance = await mockToken.balanceOf(treasury.address);
      expect(balance).to.equal(ethers.utils.parseEther("10500"));
    });
    
    it("Should allow owner (DAO) to send tokens", async function () {
      // Send tokens to addr2
      await treasury.sendTokens(
        mockToken.address, 
        addr2.address, 
        ethers.utils.parseEther("1000")
      );
      
      // Check addr2 received the tokens
      const addr2Balance = await mockToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.utils.parseEther("1000"));
      
      // Check treasury balance decreased
      const treasuryBalance = await mockToken.balanceOf(treasury.address);
      expect(treasuryBalance).to.equal(ethers.utils.parseEther("9000"));
    });
    
    it("Should not allow non-owner to send tokens", async function () {
      await expect(
        treasury.connect(addr1).sendTokens(
          mockToken.address, 
          addr2.address, 
          ethers.utils.parseEther("100")
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should not allow sending tokens to zero address", async function () {
      await expect(
        treasury.sendTokens(
          mockToken.address, 
          ethers.constants.AddressZero, 
          ethers.utils.parseEther("100")
        )
      ).to.be.revertedWith("Cannot send to zero address");
    });
    
    it("Should not allow sending 0 tokens", async function () {
      await expect(
        treasury.sendTokens(mockToken.address, addr2.address, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });
  });
});