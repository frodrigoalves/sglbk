const hre = require('hardhat');
const { parseEther } = hre.ethers;

async function distributeTokens() {
    console.log("🎁 Distributing SGL tokens for testing...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Connect to deployed MockToken
    const tokenAddress = "0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1";
    const token = await hre.ethers.getContractAt("MockToken", tokenAddress);

    // Check deployer balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("Deployer SGL balance:", hre.ethers.formatEther(deployerBalance));

    // Test addresses for distribution
    const testAddresses = [
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account 1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account 2
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",  // Hardhat account 3
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Hardhat account 4
    ];

    const amountPerAddress = parseEther("1000"); // 1000 SGL tokens each

    for (const address of testAddresses) {
        console.log(`Minting ${hre.ethers.formatEther(amountPerAddress)} SGL to ${address}...`);

        try {
            const tx = await token.mint(address, amountPerAddress);
            await tx.wait();
            console.log("✅ Minted successfully");

            // Check balance
            const balance = await token.balanceOf(address);
            console.log(`   New balance: ${hre.ethers.formatEther(balance)} SGL`);
        } catch (error) {
            console.log("❌ Error minting:", error.message);
        }
    }

    console.log("\n🎉 Token distribution complete!");
    console.log("Test addresses with SGL tokens:");
    testAddresses.forEach(addr => console.log(`  ${addr}`));
}

distributeTokens().catch(console.error);