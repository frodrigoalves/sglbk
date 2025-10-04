const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting SingulAI DAO deployment...\n");

  // Deploy parameters
  const SGL_TOKEN_ADDRESS = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357"; // DAI Sepolia for testing
  const PROPOSAL_THRESHOLD = hre.ethers.parseEther("100"); // 100 tokens required to create proposal
  const MIN_VOTING_PERIOD = 86400; // 24 hours minimum voting period
  const QUORUM_PERCENTAGE = 10; // 10% of total supply required for quorum

  console.log("📋 Deployment Parameters:");
  console.log(`   Token Address: ${SGL_TOKEN_ADDRESS}`);
  console.log(`   Proposal Threshold: ${hre.ethers.formatEther(PROPOSAL_THRESHOLD)} tokens`);
  console.log(`   Min Voting Period: ${MIN_VOTING_PERIOD / 3600} hours`);
  console.log(`   Quorum: ${QUORUM_PERCENTAGE}%\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying from account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  try {
    // Deploy SingulAI DAO contract
    console.log("📦 Deploying SingulAI DAO contract...");
    const SingulAIDAO = await hre.ethers.getContractFactory("contracts/dao/SingulAIDAO.sol:SingulAIDAO");
    const dao = await SingulAIDAO.deploy(
      SGL_TOKEN_ADDRESS,
      PROPOSAL_THRESHOLD,
      MIN_VOTING_PERIOD,
      QUORUM_PERCENTAGE
    );

    await dao.waitForDeployment();
    const daoAddress = await dao.getAddress();

    console.log("✅ SingulAI DAO deployed successfully!");
    console.log("📍 Contract address:", daoAddress);

    // Deploy SingulAI Treasury contract
    console.log("\n📦 Deploying SingulAI Treasury contract...");
    const SingulAITreasury = await hre.ethers.getContractFactory("contracts/dao/SingulAITreasury.sol:SingulAITreasury");
    const treasury = await SingulAITreasury.deploy(daoAddress);

    await treasury.waitForDeployment();
    const treasuryAddress = await treasury.getAddress();

    console.log("✅ SingulAI Treasury deployed successfully!");
    console.log("📍 Contract address:", treasuryAddress);

    // Verify contract deployment
    console.log("\n🔍 Verifying deployment...");
    
    const proposalCount = await dao.proposalCount();
    const tokenAddress = await dao.sglToken();
    const threshold = await dao.proposalThreshold();
    
    console.log("✅ Verification successful:");
    console.log(`   Initial proposal count: ${proposalCount}`);
    console.log(`   Token address: ${tokenAddress}`);
    console.log(`   Proposal threshold: ${hre.ethers.formatEther(threshold)} tokens`);

    console.log("📄 Saving contract addresses...");
    saveAddresses(daoAddress, treasuryAddress, SGL_TOKEN_ADDRESS);
    
    console.log("\n🎉 SingulAI DAO setup complete!");
    console.log("=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY:");
    console.log(`   SGL Token: ${SGL_TOKEN_ADDRESS}`);
    console.log(`   DAO Contract: ${daoAddress}`);
    console.log(`   Treasury Contract: ${treasuryAddress}`);
    console.log("=".repeat(60));
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Verify contracts on Etherscan:");
    console.log(`   npx hardhat verify --network sepolia ${daoAddress} "${SGL_TOKEN_ADDRESS}" "${PROPOSAL_THRESHOLD}" ${MIN_VOTING_PERIOD} ${QUORUM_PERCENTAGE}`);
    console.log(`   npx hardhat verify --network sepolia ${treasuryAddress} "${daoAddress}"`);
    console.log("\n2. Open the DAO Dashboard:");
    console.log("   cd frontend && python -m http.server 8000");
    console.log("   http://localhost:8000/dao-dashboard.html");
    console.log("\n3. Test the DAO:");
    console.log("   - Create test proposals");
    console.log("   - Test voting functionality");
    console.log("   - Check dashboard metrics");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

function saveAddresses(daoAddress, treasuryAddress, tokenAddress) {
  const fs = require("fs");
  const path = require("path");
  
  try {
    // Save to contract-addresses.json
    const contractAddressesPath = path.join(__dirname, "../contract-addresses.json");
    let contractAddresses = {};
    
    if (fs.existsSync(contractAddressesPath)) {
      contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, "utf8"));
    }
    
    contractAddresses.SingulAIDAO = daoAddress;
    contractAddresses.SingulAITreasury = treasuryAddress;
    contractAddresses.SGLToken = tokenAddress;
    
    fs.writeFileSync(contractAddressesPath, JSON.stringify(contractAddresses, null, 2));
    console.log("✅ Contract addresses saved to contract-addresses.json");
    
    // Update frontend DAO dashboard
    const frontendConfigPath = path.join(__dirname, "../frontend/dao-dashboard.js");
    
    if (fs.existsSync(frontendConfigPath)) {
      let frontendConfig = fs.readFileSync(frontendConfigPath, "utf8");
      
      // Update DAO address
      frontendConfig = frontendConfig.replace(
        /DAO_ADDRESS: '0x\.\.\.'/,
        `DAO_ADDRESS: '${daoAddress}'`
      );
      
      fs.writeFileSync(frontendConfigPath, frontendConfig);
      console.log("✅ Frontend DAO dashboard configuration updated!");
    }

    // Save detailed deployment info
    const deploymentData = {
      network: hre.network.name,
      dao: { address: daoAddress },
      treasury: { address: treasuryAddress },
      token: { address: tokenAddress },
      timestamp: new Date().toISOString()
    };
    
    const deploymentPath = path.join(__dirname, "../dao-deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
    console.log("✅ Deployment info saved to dao-deployment.json");
    
  } catch (error) {
    console.error("❌ Error saving addresses:", error);
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });