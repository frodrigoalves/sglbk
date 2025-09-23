const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AvatarWalletLink", function () {
  let AvatarWalletLink;
  let walletLink;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy AvatarWalletLink
    AvatarWalletLink = await ethers.getContractFactory("AvatarWalletLink");
    walletLink = await AvatarWalletLink.deploy();
    await walletLink.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(walletLink.target).to.be.properAddress;
    });
  });

  describe("Wallet Linking", function () {
    it("Should link a wallet to an avatar", async function () {
      const avatarId = 1;
      const walletAddress = addr1.address;
      
      await walletLink.link(avatarId, walletAddress);
      
      const linkedWallet = await walletLink.ownerOf(avatarId);
      expect(linkedWallet).to.equal(walletAddress);
    });

    it("Should emit WalletLinked event", async function () {
      const avatarId = 1;
      const walletAddress = addr1.address;
      
      await expect(walletLink.link(avatarId, walletAddress))
        .to.emit(walletLink, "WalletLinked")
        .withArgs(avatarId, walletAddress);
    });

    it("Should allow relinking to a different wallet", async function () {
      const avatarId = 1;
      
      // Link first wallet
      await walletLink.link(avatarId, addr1.address);
      expect(await walletLink.ownerOf(avatarId)).to.equal(addr1.address);
      
      // Relink to second wallet
      await walletLink.link(avatarId, addr2.address);
      expect(await walletLink.ownerOf(avatarId)).to.equal(addr2.address);
    });

    it("Should handle multiple avatar links", async function () {
      await walletLink.link(1, addr1.address);
      await walletLink.link(2, addr2.address);
      
      expect(await walletLink.ownerOf(1)).to.equal(addr1.address);
      expect(await walletLink.ownerOf(2)).to.equal(addr2.address);
    });
  });
});
