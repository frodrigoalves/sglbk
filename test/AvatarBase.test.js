const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AvatarBase", function () {
  let AvatarBase;
  let avatarBase;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AvatarBase = await ethers.getContractFactory("AvatarBase");
    avatarBase = await AvatarBase.deploy();
    await avatarBase.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await avatarBase.name()).to.equal("SingulAI Avatar");
      expect(await avatarBase.symbol()).to.equal("SAVT");
    });

    it("Should initialize nextId to 0", async function () {
      expect(await avatarBase.nextId()).to.equal(0);
    });
  });

  describe("Avatar Creation", function () {
    it("Should mint a new avatar", async function () {
      const tx = await avatarBase.mint(owner.address, "test attributes");
      await tx.wait();
      
      const nextId = await avatarBase.nextId();
      expect(nextId).to.equal(1);
      
      const attributes = await avatarBase.attributes(1);
      expect(attributes).to.equal("test attributes");
      
      const ownerOfToken = await avatarBase.ownerOf(1);
      expect(ownerOfToken).to.equal(owner.address);
    });

    it("Should emit AvatarMinted event", async function () {
      await expect(avatarBase.mint(owner.address, "test attributes"))
        .to.emit(avatarBase, "AvatarMinted")
        .withArgs(1, owner.address, "test attributes");
    });

    it("Should mint multiple avatars with incremental IDs", async function () {
      await avatarBase.mint(owner.address, "avatar1");
      await avatarBase.mint(addr1.address, "avatar2");
      
      expect(await avatarBase.nextId()).to.equal(2);
      expect(await avatarBase.attributes(1)).to.equal("avatar1");
      expect(await avatarBase.attributes(2)).to.equal("avatar2");
      expect(await avatarBase.ownerOf(1)).to.equal(owner.address);
      expect(await avatarBase.ownerOf(2)).to.equal(addr1.address);
    });
  });
});
