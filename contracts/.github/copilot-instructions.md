# SingulAI MVP – AI Coding Agent Guidelines

## 🏗️ Architecture Overview

**SingulAI** is a full-stack blockchain-based digital legacy platform with three main layers:

**Smart Contracts (Blockchain Layer):**
- `contracts/AvatarBase.sol`: ERC721 NFT for digital avatars
- `contracts/AvatarWalletLink.sol`: Links avatars to Ethereum wallets
- `contracts/TimeCapsule.sol`: Time-locked content storage
- `contracts/DigitalLegacy.sol`: Digital inheritance logic

**Backend API (Node.js + Express):**
- User authentication & management (JWT-based)
- PostgreSQL database integration
- Wallet generation and management
- Email verification system
- Contract address configuration

**Frontend (Pure JavaScript):**
- Vanilla JS with Web3.js for blockchain interaction
- Multi-page application: login, register, dashboard
- Dark theme UI with Portuguese language
- Served via `python -m http.server 8000` from `frontend/`

## 🔧 Critical Developer Workflows

**Full Stack Startup (Windows):**
- Quick start: Run `start-services.bat` (starts backend + frontend)
- Manual: `cd backend && npm run dev` then `cd frontend && python -m http.server 8000`

**Contract Development:**
- Test all contracts: `npm test`
- Deploy to Sepolia: `npm run deploy:sepolia`
- Verify contract: `npx hardhat verify <CONTRACT_ADDRESS> --network sepolia`
- **Critical**: Update contract addresses in both `backend/.env` and `frontend/singulai-mvp.js`

**Backend Development:**
- Development server: `cd backend && npm run dev` (port 3000)
- Database setup: `npm run db:setup` (requires PostgreSQL running)
- Health check: `http://localhost:3000/api/health`

**Frontend Development:**
- Serve locally: `cd frontend && python -m http.server 8000`
- Entry point: `http://localhost:8000/login.html`
- **After every contract deployment, update** the `CONTRACTS` object in `frontend/singulai-mvp.js`

**Docker Deployment:**
- Local: `docker-compose up -d` (PostgreSQL + Backend)
- Production: Uses nginx proxy and SSL certificates

## 📋 Project-Specific Patterns & Conventions

**Solidity Contracts:**
- Use OpenZeppelin base contracts
- All state-changing functions must emit events with indexed parameters (IDs, addresses)
- Example event: `event ActionPerformed(uint256 indexed id, address indexed user);`

**Testing:**
- Use Hardhat and ethers.js
- Always deploy fresh contracts in `beforeEach`
- Test both success and failure cases; verify event emission

**Backend API:**
- JWT authentication with email verification
- PostgreSQL database with `users` table for authentication and wallet storage
- Environment variables for contract addresses (must sync with frontend)
- RESTful endpoints for user management and blockchain integration

**Frontend:**
- All contract addresses are centralized in the `CONTRACTS` object in `singulai-mvp.js`
- Never hardcode addresses elsewhere; always update after deployment
- MetaMask is required for all blockchain actions
- UI is dark-themed, Inter font, Portuguese language

**Database Schema:**
- `users`: Authentication, wallet addresses, email verification
- Auto-generated wallets with mnemonic storage
- PostgreSQL with UUID extension enabled

**Integration Points:**
- MetaMask: wallet connection, transaction signing
- Etherscan: contract verification
- Infura: Sepolia RPC endpoint
- Web3.js: all blockchain calls
- PostgreSQL: user data persistence
- JWT: session management

## 🚀 Deployment & Integration

1. Copy `.env.example` to `.env` and configure
2. Get Sepolia test ETH
3. Deploy contracts: `npm run deploy:sepolia`
4. Update frontend contract addresses
5. Verify contracts on Etherscan
6. Serve frontend and test MetaMask connection

## ⚠️ Common Pitfalls

- **Frontend contract addresses must be updated after every deployment**
- **Backend .env must also be updated with new contract addresses**
- Always use Sepolia for testing (never mainnet)
- MetaMask must be on Sepolia network
- PostgreSQL must be running before starting backend
- Test gas estimation before production

## 📚 Key Files & Directories

- `contracts/` – Solidity smart contracts
- `backend/server.js` – Node.js API server with authentication
- `database/init.sql` – PostgreSQL schema and table creation
- `frontend/singulai-mvp.js` – Main frontend logic and contract integration
- `scripts/` – Deployment and utility scripts
- `test/` – Contract test suites
- `hardhat.config.js` – Hardhat config
- `docker-compose.yml` – Full stack deployment configuration
- `start-services.bat` – Windows quick start script

---
For more details, see `README.md` and in-code comments. If any section is unclear or incomplete, please request clarification or provide feedback for improvement.