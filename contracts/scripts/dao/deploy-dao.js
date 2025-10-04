const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// DAO parameters
const PROPOSAL_THRESHOLD = ethers.utils.parseEther("1000"); // 1,000 SGL tokens to create proposal
const MIN_VOTING_PERIOD = 60 * 60 * 24 * 3; // 3 days in seconds
const QUORUM_PERCENTAGE = 10; // 10% of total supply must vote

async function main() {
  console.log("Starting DAO deployment...");
  
  // Get token address from config or file
  let tokenAddress;
  
  // Try to get token address from contract-addresses.json
  try {
    const addressesPath = path.join(__dirname, "..", "..", "contract-addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    tokenAddress = addresses.mockToken || process.env.SGL_TOKEN_ADDRESS;
  } catch (error) {
    console.log("Could not read from contract-addresses.json. Using environment variable.");
    tokenAddress = process.env.SGL_TOKEN_ADDRESS;
  }
  
  if (!tokenAddress) {
    throw new Error("SGL token address not found. Please set it in contract-addresses.json or as an environment variable.");
  }
  
  console.log(`Using SGL token at address: ${tokenAddress}`);

  // Get the contract factory
  const SingulAIDAO = await hre.ethers.getContractFactory("SingulAIDAO");
  console.log("Deploying SingulAIDAO...");
  
  // Deploy the DAO contract with the specified parameters
  const dao = await SingulAIDAO.deploy(
    tokenAddress,
    PROPOSAL_THRESHOLD,
    MIN_VOTING_PERIOD,
    QUORUM_PERCENTAGE
  );
  
  await dao.deployed();
  console.log(`SingulAIDAO deployed to: ${dao.address}`);
  
  // Deploy the Treasury contract
  const SingulAITreasury = await hre.ethers.getContractFactory("SingulAITreasury");
  console.log("Deploying SingulAITreasury...");
  
  // The DAO will be the owner of the Treasury
  const treasury = await SingulAITreasury.deploy(dao.address);
  
  await treasury.deployed();
  console.log(`SingulAITreasury deployed to: ${treasury.address}`);
  
  // Update contract-addresses.json with the new addresses
  try {
    const addressesPath = path.join(__dirname, "..", "..", "contract-addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    
    addresses.singulaiDAO = dao.address;
    addresses.singulaiTreasury = treasury.address;
    
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("Updated contract-addresses.json with new contract addresses.");
  } catch (error) {
    console.error("Error updating contract-addresses.json:", error);
  }
  
  console.log("");
  console.log("=== DAO Deployment Complete ===");
  console.log(`SingulAIDAO: ${dao.address}`);
  console.log(`SingulAITreasury: ${treasury.address}`);
  console.log(`SGL Token: ${tokenAddress}`);
  console.log("");
  console.log("DAO Parameters:");
  console.log(`- Proposal Threshold: ${ethers.utils.formatEther(PROPOSAL_THRESHOLD)} SGL`);
  console.log(`- Min Voting Period: ${MIN_VOTING_PERIOD / (60 * 60 * 24)} days`);
  console.log(`- Quorum Percentage: ${QUORUM_PERCENTAGE}%`);
  console.log("");
  console.log("Next steps:");
  console.log("1. Verify contract on Etherscan");
  console.log("2. Update frontend to interact with the DAO");
  console.log("");
  
  // Prepare verification commands
  console.log("Run these commands to verify contracts on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${dao.address} ${tokenAddress} ${PROPOSAL_THRESHOLD} ${MIN_VOTING_PERIOD} ${QUORUM_PERCENTAGE}`);
  console.log(`npx hardhat verify --network sepolia ${treasury.address} ${dao.address}`);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });