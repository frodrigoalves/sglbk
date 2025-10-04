const { ethers } = require("ethers");

// Test script to check SGL token contract
async function testTokenContract() {
    console.log("🔍 Testing SGL Token Contract...");

    // Sepolia RPC
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/0665699b0f4345759cffb80a5acdc45c");

    // Token addresses to test
    const mockTokenAddress = "0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1";
    const sglTokenAddress = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";

    // ERC-20 ABI
    const tokenABI = [
        {
            "inputs": [{"name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [{"name": "", "type": "uint8"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [{"name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{"name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    // Test addresses
    const addresses = [
        { name: "MockToken", address: mockTokenAddress },
        { name: "SGLToken", address: sglTokenAddress }
    ];

    for (const token of addresses) {
        try {
            console.log(`\n📋 Testing ${token.name} at ${token.address}`);

            const contract = new ethers.Contract(token.address, tokenABI, provider);

            // Check if contract exists
            const code = await provider.getCode(token.address);
            if (code === "0x") {
                console.log(`❌ Contract does not exist at ${token.address}`);
                continue;
            }

            // Get token info
            const name = await contract.name();
            const symbol = await contract.symbol();
            const decimals = await contract.decimals();

            console.log(`✅ Contract exists:`);
            console.log(`   Name: ${name}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Decimals: ${decimals}`);

            // Test balance for a known address (deployer)
            const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Hardhat default
            const balance = await contract.balanceOf(testAddress);
            const formattedBalance = ethers.formatUnits(balance, decimals);

            console.log(`   Deployer balance: ${formattedBalance} ${symbol}`);

        } catch (error) {
            console.log(`❌ Error testing ${token.name}:`, error.message);
        }
    }
}

testTokenContract().catch(console.error);