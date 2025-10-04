const { ethers } = require("ethers");

// Test frontend token balance reading
async function testFrontendBalance() {
    console.log("🧪 Testing frontend token balance functionality...");

    // Sepolia RPC
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/0665699b0f4345759cffb80a5acdc45c");

    // Test account with tokens
    const testAccount = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    // SGL Token contract (same as frontend)
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
        }
    ];

    const tokenAddress = '0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1';
    console.log('📜 Using token contract:', tokenAddress);
    console.log('👤 Testing with account:', testAccount);

    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);

    try {
        const balance = await tokenContract.balanceOf(testAccount);
        const decimals = await tokenContract.decimals();
        const tokenBalance = Number(balance) / Math.pow(10, Number(decimals));

        console.log('✅ Token balance read successfully!');
        console.log(`   Raw balance: ${balance.toString()}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Formatted balance: ${tokenBalance.toFixed(2)} SGL`);

        // Simulate what frontend does
        console.log('\n🎭 Simulating frontend behavior:');
        const sglElement = { textContent: '' }; // Mock DOM element
        sglElement.textContent = tokenBalance.toFixed(2);
        console.log(`   UI would show: ${sglElement.textContent} SGL`);

    } catch (error) {
        console.error('❌ Error reading token balance:', error);
        console.log('   This is the same error the frontend would get');
    }
}

testFrontendBalance().catch(console.error);