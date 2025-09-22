const hre = require('hardhat');

async function main() {
  console.log("Deploying contracts...");
  
  // Deploy AvatarBase
  const AvatarBase = await hre.ethers.getContractFactory('AvatarBase');
  const base = await AvatarBase.deploy();
  await base.waitForDeployment();
  console.log('AvatarBase deployed to:', base.target);
  
  // Deploy AvatarWalletLink
  const WalletLink = await hre.ethers.getContractFactory('AvatarWalletLink');
  const wl = await WalletLink.deploy();
  await wl.waitForDeployment();
  console.log('AvatarWalletLink deployed to:', wl.target);
  
  // Deploy TimeCapsule
  const TimeCapsule = await hre.ethers.getContractFactory('TimeCapsule');
  const tc = await TimeCapsule.deploy();
  await tc.waitForDeployment();
  console.log('TimeCapsule deployed to:', tc.target);
  
  // Deploy DigitalLegacy
  const DigitalLegacy = await hre.ethers.getContractFactory('DigitalLegacy');
  const dl = await DigitalLegacy.deploy();
  await dl.waitForDeployment();
  console.log('DigitalLegacy deployed to:', dl.target);
  
  console.log("\n=== Deployment Summary ===");
  console.log(`AvatarBase: ${base.target}`);
  console.log(`AvatarWalletLink: ${wl.target}`);
  console.log(`TimeCapsule: ${tc.target}`);
  console.log(`DigitalLegacy: ${dl.target}`);
  
  // Save addresses for later use
  const deploymentInfo = {
    AvatarBase: base.target,
    AvatarWalletLink: wl.target,
    TimeCapsule: tc.target,
    DigitalLegacy: dl.target,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };
  
  console.log("\n=== For .env file ===");
  console.log(`AVATAR_BASE_ADDRESS=${base.target}`);
  console.log(`AVATAR_WALLET_LINK_ADDRESS=${wl.target}`);
  console.log(`TIME_CAPSULE_ADDRESS=${tc.target}`);
  console.log(`DIGITAL_LEGACY_ADDRESS=${dl.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
