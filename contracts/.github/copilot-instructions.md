# SingulAI MVP - AI Coding Guidelines

## 🏗️ Architecture Overview

**SingulAI** is a blockchain platform with 4 core smart contracts:
- `AvatarBase.sol` - ERC721 NFT contract for digital avatars
- `AvatarWalletLink.sol` - Links avatars to Ethereum wallets
- `TimeCapsule.sol` - Time-locked content storage
- `DigitalLegacy.sol` - Digital inheritance system

**Frontend**: Vanilla JavaScript with Web3.js, served via `python -m http.server 8000`

## 🔧 Critical Workflows

### Contract Development
```bash
# Test all contracts
npm test

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify deployed contracts
npx hardhat verify <CONTRACT_ADDRESS> --network sepolia
```

### Frontend Development
```bash
# Serve frontend locally
cd frontend && python -m http.server 8000

# Update contract addresses in frontend after deployment
# Edit CONTRACTS object in singulai-mvp.js with new addresses
```

## 📋 Code Patterns

### Contract Structure
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ContractName {
    // State variables
    mapping(uint256 => data) public dataStore;
    
    // Events with indexed parameters
    event ActionPerformed(uint256 indexed id, address indexed user);
    
    // Functions
    function performAction() external {
        // Implementation
        emit ActionPerformed(id, msg.sender);
    }
}
```

### Test Structure
```javascript
describe("ContractName", function () {
  let contract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ContractName");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  it("Should perform action correctly", async function () {
    // Test implementation
  });
});
```

### Frontend Integration
```javascript
// Contract configuration pattern
const CONTRACTS = {
    CONTRACT_NAME: {
        address: '0x...',
        abi: [
            "function functionName(type param) external returns (type)"
        ]
    }
};

// Web3 interaction
async function interactWithContract() {
    const contract = new web3.eth.Contract(CONTRACTS.CONTRACT_NAME.abi, CONTRACTS.CONTRACT_NAME.address);
    const result = await contract.methods.functionName(param).send({ from: accounts[0] });
}
```

## 🎯 Project Conventions

### Contract Addresses
- **Always update** `frontend/singulai-mvp.js` CONTRACTS object after deployment
- **Never hardcode** addresses in production code
- Use environment variables for deployment scripts

### Events & Logging
- **Emit events** for all state-changing operations
- **Index critical parameters** (IDs, addresses) for efficient querying
- Follow naming: `ActionPerformed(uint256 indexed id, address indexed user)`

### Testing
- **16 tests** currently passing across 3 contracts
- Use `beforeEach` for contract deployment setup
- Test both success and failure scenarios
- Verify event emissions with `.to.emit()`

### UI/UX
- **Dark theme** with Inter font family
- **Responsive grid layout** (main content + 320px sidebar)
- **Portuguese language** throughout interface
- **MetaMask integration** required for all blockchain interactions

## 🚀 Deployment Process

1. **Configure environment**: Copy `.env.example` to `.env`
2. **Get test ETH**: Use Sepolia faucet for deployment gas
3. **Deploy contracts**: `npm run deploy:sepolia`
4. **Update frontend**: Edit contract addresses in `singulai-mvp.js`
5. **Verify contracts**: `npx hardhat verify <address> --network sepolia`
6. **Test integration**: Serve frontend and test MetaMask connection

## ⚠️ Common Pitfalls

- **Contract addresses**: Frontend must be updated after each deployment
- **Network configuration**: Always use Sepolia for testing, never mainnet
- **Gas estimation**: Test transactions thoroughly before production
- **MetaMask setup**: Ensure Sepolia network is added to wallet

## 🔗 Integration Points

- **MetaMask**: Wallet connection and transaction signing
- **Etherscan**: Contract verification and transaction monitoring
- **Infura**: RPC endpoint for Sepolia network
- **Web3.js**: Frontend blockchain interaction library

## 📚 Key Files

- `contracts/AvatarBase.sol` - Core NFT contract implementation
- `scripts/deploy.js` - Multi-contract deployment script
- `frontend/singulai-mvp.js` - Main frontend logic and contract integration
- `hardhat.config.js` - Network and compiler configuration
- `test/*.test.js` - Contract test suites