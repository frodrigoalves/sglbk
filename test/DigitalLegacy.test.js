const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DigitalLegacy", function () {
  let DigitalLegacy;
  let digitalLegacy;
  let owner;
  let heir;
  let other;

  beforeEach(async function () {
    [owner, heir, other] = await ethers.getSigners();
    
    // Deploy DigitalLegacy
    DigitalLegacy = await ethers.getContractFactory("DigitalLegacy");
    digitalLegacy = await DigitalLegacy.deploy();
    await digitalLegacy.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(digitalLegacy.target).to.be.properAddress;
    });
  });

  describe("Legacy Planning", function () {
    it("Should create a legacy", async function () {
      const avatarId = 1;
      const cid = "QmTest123";
      const rules = "Test rules";
      
      await digitalLegacy.createLegacy(avatarId, cid, rules);
      
      const legacyId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      const legacy = await digitalLegacy.legacies(legacyId);
      
      expect(legacy.avatarId).to.equal(avatarId);
      expect(legacy.cid).to.equal(cid);
      expect(legacy.rules).to.equal(rules);
      expect(legacy.unlocked).to.equal(false);
    });

    it("Should emit LegacyCreated event", async function () {
      const avatarId = 1;
      const cid = "QmTest123";
      const rules = "Test rules";
      
      const legacyId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      
      await expect(digitalLegacy.createLegacy(avatarId, cid, rules))
        .to.emit(digitalLegacy, "LegacyCreated")
        .withArgs(legacyId, avatarId, cid, rules);
    });

    it("Should unlock a legacy", async function () {
      const avatarId = 1;
      const cid = "QmTest123";
      const rules = "Test rules";
      
      await digitalLegacy.createLegacy(avatarId, cid, rules);
      
      const legacyId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      await digitalLegacy.unlockLegacy(legacyId);
      
      const legacy = await digitalLegacy.legacies(legacyId);
      expect(legacy.unlocked).to.equal(true);
    });

    it("Should emit LegacyUnlocked event", async function () {
      const avatarId = 1;
      const cid = "QmTest123";
      const rules = "Test rules";
      
      await digitalLegacy.createLegacy(avatarId, cid, rules);
      
      const legacyId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      
      await expect(digitalLegacy.unlockLegacy(legacyId))
        .to.emit(digitalLegacy, "LegacyUnlocked")
        .withArgs(legacyId, avatarId);
    });

    it("Should revert when trying to unlock already unlocked legacy", async function () {
      const avatarId = 1;
      const cid = "QmTest123";
      const rules = "Test rules";
      
      await digitalLegacy.createLegacy(avatarId, cid, rules);
      
      const legacyId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      await digitalLegacy.unlockLegacy(legacyId);
      
      await expect(digitalLegacy.unlockLegacy(legacyId))
        .to.be.revertedWith("already");
    });
  });
});
