const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TimeCapsule", function () {
  let TimeCapsule;
  let timeCapsule;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy TimeCapsule
    TimeCapsule = await ethers.getContractFactory("TimeCapsule");
    timeCapsule = await TimeCapsule.deploy();
    await timeCapsule.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(timeCapsule.target).to.be.properAddress;
    });
  });

  describe("Capsule Creation", function () {
    it("Should create a time capsule", async function () {
      const avatarId = 1;
      const unlockDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const cid = "QmTest123";
      
      await timeCapsule.createCapsule(avatarId, unlockDate, cid);
      
      const capsuleId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      const capsule = await timeCapsule.capsules(capsuleId);
      
      expect(capsule.avatarId).to.equal(avatarId);
      expect(capsule.unlockDate).to.equal(unlockDate);
      expect(capsule.cid).to.equal(cid);
      expect(capsule.unlocked).to.equal(false);
    });

    it("Should emit CapsuleCreated event", async function () {
      const avatarId = 1;
      const unlockDate = Math.floor(Date.now() / 1000) + 3600;
      const cid = "QmTest123";
      
      const capsuleId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      
      await expect(timeCapsule.createCapsule(avatarId, unlockDate, cid))
        .to.emit(timeCapsule, "CapsuleCreated")
        .withArgs(capsuleId, avatarId, unlockDate, cid);
    });
  });

  describe("Capsule Unlocking", function () {
    it("Should unlock capsule when time has passed", async function () {
      const avatarId = 1;
      const unlockDate = Math.floor(Date.now() / 1000) + 1; // 1 second from now
      const cid = "QmTest123";
      
      await timeCapsule.createCapsule(avatarId, unlockDate, cid);
      
      // Wait for unlock time
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      await timeCapsule.unlockIfReady(avatarId, cid);
      
      const capsuleId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      const capsule = await timeCapsule.capsules(capsuleId);
      expect(capsule.unlocked).to.equal(true);
    });

    it("Should revert when trying to unlock before time", async function () {
      const avatarId = 1;
      const unlockDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const cid = "QmTest123";
      
      await timeCapsule.createCapsule(avatarId, unlockDate, cid);
      
      await expect(timeCapsule.unlockIfReady(avatarId, cid))
        .to.be.revertedWith("locked");
    });

    it("Should revert when trying to unlock already unlocked capsule", async function () {
      const avatarId = 1;
      const unlockDate = Math.floor(Date.now() / 1000) + 1;
      const cid = "QmTest123";
      
      await timeCapsule.createCapsule(avatarId, unlockDate, cid);
      
      // Wait and unlock
      await new Promise(resolve => setTimeout(resolve, 1100));
      await timeCapsule.unlockIfReady(avatarId, cid);
      
      // Try to unlock again
      await expect(timeCapsule.unlockIfReady(avatarId, cid))
        .to.be.revertedWith("already");
    });

    it("Should emit CapsuleUnlocked event", async function () {
      const avatarId = 1;
      const unlockDate = Math.floor(Date.now() / 1000) + 1;
      const cid = "QmTest123";
      
      await timeCapsule.createCapsule(avatarId, unlockDate, cid);
      
      // Wait for unlock time
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const capsuleId = ethers.keccak256(ethers.solidityPacked(["uint256", "string"], [avatarId, cid]));
      
      await expect(timeCapsule.unlockIfReady(avatarId, cid))
        .to.emit(timeCapsule, "CapsuleUnlocked")
        .withArgs(capsuleId, avatarId, cid);
    });
  });
});
