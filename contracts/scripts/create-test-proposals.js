const hre = require("hardhat");

async function main() {
    console.log("🗳️ Creating test proposals for SingulAI DAO...\n");

    // Contract addresses from deployment
    const DAO_ADDRESS = "0x67Ef5FFf1fb79e7479aF27163Adef1b42a3aFf16";
    const TREASURY_ADDRESS = "0x8599Fc17B7F8eA439D79692645B65D512E7aC626";

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Creating proposals from account:", deployer.address);

    // Connect to deployed DAO contract
    const dao = await hre.ethers.getContractAt(
        "contracts/dao/SingulAIDAO.sol:SingulAIDAO", 
        DAO_ADDRESS
    );

    try {
        // Proposal 1: Update proposal threshold
        console.log("📝 Creating Proposal #1: Reduzir limite para criação de propostas...");
        const proposal1 = await dao.createProposal(
            "Proposta para reduzir o limite mínimo de tokens necessários para criar propostas de 100 SGL para 50 SGL, facilitando a participação de mais membros da comunidade na governança.",
            172800, // 48 hours voting period
            DAO_ADDRESS, // Target is the DAO itself
            dao.interface.encodeFunctionData("updateProposalThreshold", [hre.ethers.parseEther("50")])
        );
        await proposal1.wait();
        console.log("✅ Proposal #1 created successfully!");

        // Proposal 2: Update voting period
        console.log("\n📝 Creating Proposal #2: Aumentar período de votação...");
        const proposal2 = await dao.createProposal(
            "Proposta para aumentar o período mínimo de votação de 24 horas para 72 horas, garantindo mais tempo para a comunidade analisar e votar nas propostas.",
            259200, // 72 hours voting period
            DAO_ADDRESS,
            dao.interface.encodeFunctionData("updateMinVotingPeriod", [259200]) // 72 hours
        );
        await proposal2.wait();
        console.log("✅ Proposal #2 created successfully!");

        // Proposal 3: Update quorum
        console.log("\n📝 Creating Proposal #3: Ajustar quorum para aprovação...");
        const proposal3 = await dao.createProposal(
            "Proposta para reduzir o quorum necessário para aprovação de propostas de 10% para 5% do total de tokens, facilitando a aprovação de propostas importantes.",
            345600, // 96 hours voting period
            DAO_ADDRESS,
            dao.interface.encodeFunctionData("updateQuorumPercentage", [5])
        );
        await proposal3.wait();
        console.log("✅ Proposal #3 created successfully!");

        // Check current proposal count
        const proposalCount = await dao.proposalCount();
        console.log(`\n📊 Total proposals created: ${proposalCount}`);

        // Display proposal details
        console.log("\n📋 PROPOSAL DETAILS:");
        console.log("=".repeat(80));
        
        for (let i = 0; i < proposalCount; i++) {
            const proposal = await dao.proposals(i);
            const status = await dao.getProposalStatus(i);
            
            console.log(`\n🗳️  PROPOSAL #${i}`);
            console.log(`   Proposer: ${proposal.proposer}`);
            console.log(`   Description: ${proposal.description.substring(0, 100)}...`);
            console.log(`   Start Time: ${new Date(parseInt(proposal.startTime) * 1000).toLocaleString()}`);
            console.log(`   End Time: ${new Date(parseInt(proposal.endTime) * 1000).toLocaleString()}`);
            console.log(`   Status: ${getStatusName(status)}`);
            console.log(`   For Votes: ${hre.ethers.formatEther(proposal.forVotes)} SGL`);
            console.log(`   Against Votes: ${hre.ethers.formatEther(proposal.againstVotes)} SGL`);
        }

        console.log("\n" + "=".repeat(80));
        console.log("🎉 Test proposals created successfully!");
        console.log("\n📋 NEXT STEPS:");
        console.log("1. Open DAO Dashboard: http://localhost:8000/dao-dashboard.html");
        console.log("2. Connect MetaMask to Sepolia network");
        console.log("3. Get DAI tokens for testing: https://faucet.paradigm.xyz/");
        console.log("4. Vote on proposals using the dashboard");
        console.log("5. Monitor real-time statistics and charts");
        
    } catch (error) {
        console.error("❌ Error creating proposals:", error.message);
        
        // Check if the error is due to insufficient tokens
        if (error.message.includes("Insufficient tokens")) {
            console.log("\n💡 TIP: You need DAI tokens to create proposals!");
            console.log("   Get DAI from: https://faucet.paradigm.xyz/");
            console.log("   Add DAI to MetaMask:");
            console.log("   Address: 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357");
            console.log("   Symbol: DAI");
            console.log("   Decimals: 18");
        }
        
        process.exit(1);
    }
}

function getStatusName(statusCode) {
    const statuses = {
        0: 'Pending',
        1: 'Active',
        2: 'Canceled', 
        3: 'Defeated',
        4: 'Succeeded',
        5: 'Executed'
    };
    return statuses[statusCode] || 'Unknown';
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script error:", error);
        process.exit(1);
    });