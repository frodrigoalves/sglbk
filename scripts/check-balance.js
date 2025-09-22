const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Checking account:", deployer.address);
  console.log("Network:", hre.network.name);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Check if balance is sufficient for deployment
  const estimatedGas = hre.ethers.parseEther("0.01"); // Estimate 0.01 ETH needed
  if (balance < estimatedGas) {
    console.log("\n❌ Insufficient funds for deployment!");
    console.log("You need at least 0.01 ETH for gas fees.");
    console.log("Please get test ETH from Sepolia faucet:");
    console.log("- https://sepoliafaucet.com/");
    console.log("- https://www.alchemy.com/faucets/ethereum-sepolia");
  } else {
    console.log("✅ Sufficient funds for deployment");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
