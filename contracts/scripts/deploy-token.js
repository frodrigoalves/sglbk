const hre = require('hardhat');

async function main() {
  console.log('Deploying MockToken...');
  
  const MockToken = await hre.ethers.getContractFactory('MockToken');
  const token = await MockToken.deploy('1000000000000000000000000'); // 1 million tokens with 18 decimals
  
  await token.waitForDeployment();
  
  console.log('MockToken deployed to:', token.target);
  console.log('Add this to your .env:');
  console.log('MOCK_TOKEN_ADDRESS=' + token.target);
  
  // Save to contract-addresses.json
  const fs = require('fs');
  try {
    // Read existing file if it exists
    let addresses = {};
    if (fs.existsSync('./contract-addresses.json')) {
      const content = fs.readFileSync('./contract-addresses.json', 'utf8');
      addresses = JSON.parse(content);
    }
    
    // Update with new token address
    addresses.mockToken = token.target;
    
    // Write back to file
    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(addresses, null, 2)
    );
    console.log('Updated contract-addresses.json');
  } catch (error) {
    console.error('Error updating contract-addresses.json:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
