const hre = require('hardhat');
const fs = require('fs');

async function main() {
  console.log("Deploying contracts...");
  
  // Deploy AvatarBase
  const AvatarBase = await hre.ethers.getContractFactory('AvatarBase');
  const base = await AvatarBase.deploy();
  await base.waitForDeployment();
  console.log('AvatarBase deployed to:', base.target);
  
  // Deploy AvatarWalletLink
  const WalletLink = await hre.ethers.getContractFactory('AvatarWalletLink');
  const wl = await WalletLink.deploy(base.target);
  await wl.waitForDeployment();
  console.log('AvatarWalletLink deployed to:', wl.target);
  
  // Deploy TimeCapsule
  const TimeCapsule = await hre.ethers.getContractFactory('TimeCapsule');
  const tc = await TimeCapsule.deploy(base.target);
  await tc.waitForDeployment();
  console.log('TimeCapsule deployed to:', tc.target);
  
  // Deploy DigitalLegacy
  const DigitalLegacy = await hre.ethers.getContractFactory('DigitalLegacy');
  const dl = await DigitalLegacy.deploy(base.target);
  await dl.waitForDeployment();
  console.log('DigitalLegacy deployed to:', dl.target);
  
  // Get MockToken address from contract-addresses.json if it exists
  let mockTokenAddress = "";
  try {
    if (fs.existsSync('./contract-addresses.json')) {
      const addresses = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
      if (addresses.mockToken) {
        mockTokenAddress = addresses.mockToken;
        console.log(`Found existing MockToken at: ${mockTokenAddress}`);
      }
    }
  } catch (error) {
    console.warn('Could not read MockToken address:', error);
  }
  
  console.log("\n=== Deployment Summary ===");
  console.log(`AvatarBase: ${base.target}`);
  console.log(`AvatarWalletLink: ${wl.target}`);
  console.log(`TimeCapsule: ${tc.target}`);
  console.log(`DigitalLegacy: ${dl.target}`);
  if (mockTokenAddress) {
    console.log(`MockToken: ${mockTokenAddress}`);
  }
  
  // Save addresses for later use
  const deploymentInfo = {
    AvatarBase: base.target,
    AvatarWalletLink: wl.target,
    TimeCapsule: tc.target,
    DigitalLegacy: dl.target,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };
  
  // Update contract-addresses.json
  try {
    let addresses = {};
    if (fs.existsSync('./contract-addresses.json')) {
      addresses = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
    }
    
    addresses.avatarBase = base.target;
    addresses.avatarWalletLink = wl.target;
    addresses.timeCapsule = tc.target;
    addresses.digitalLegacy = dl.target;
    
    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(addresses, null, 2)
    );
    console.log('Updated contract-addresses.json');
  } catch (error) {
    console.error('Error updating contract-addresses.json:', error);
  }
  
  console.log("\n=== For .env file ===");
  console.log(`AVATAR_BASE_ADDRESS=${base.target}`);
  console.log(`AVATAR_WALLET_LINK_ADDRESS=${wl.target}`);
  console.log(`TIME_CAPSULE_ADDRESS=${tc.target}`);
  console.log(`DIGITAL_LEGACY_ADDRESS=${dl.target}`);
  if (mockTokenAddress) {
    console.log(`MOCK_TOKEN_ADDRESS=${mockTokenAddress}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
