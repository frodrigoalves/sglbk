# SingulAI MVP – AI Coding Agent Guidelines

## 🏗️ Architecture Overview

**SingulAI** is a full-stack blockchain-based digital legacy platform with **four main layers**:

**Smart Contracts (Blockchain Layer):**
- `contracts/AvatarBase.sol`: ERC721 NFT for digital avatars
- `contracts/AvatarWalletLink.sol`: Links avatars to Ethereum wallets  
- `contracts/TimeCapsule.sol`: Time-locked content storage
- `contracts/DigitalLegacy.sol`: Digital inheritance logic

**Backend API (Node.js + Express):**
- Modern ES modules (`"type": "module"` in package.json)
- Supabase integration for database persistence
- JWT authentication with `API_JWT_SECRET`
- IPFS integration for decentralized storage
- Contract interaction via ethers.js v6

**Database (Supabase/PostgreSQL):**
- `avatars`, `capsules`, `legacy` tables with RLS policies
- Apply schema: `sql/supabase_schema.sql`
- Row-level security based on `auth.uid()`

**Automation Layer (n8n):**
- `n8n/capsule-unlock-check.json`: Time capsule unlock workflow
- `n8n/weekly-summary-ollama.json`: AI-powered summaries

## 🔧 Critical Developer Workflows

**Environment Setup:**
1. Copy `.env.example` to `.env` and configure all values
2. Apply `sql/supabase_schema.sql` to Supabase instance
3. Start services: `docker compose -f docker-compose.addons.yml up -d --build`
4. Import n8n workflows from `n8n/*.json`
5. Test with JWT token: `GET /health`

**Backend Development:**
- Dev server: `cd backend && npm run dev` (auto-restart via `--watch`)
- Production: `npm start`
- Worker: `npm run worker` (for time capsule unlocking)
- API runs on port 8080 (not 3000 like the old version)

**Smart Contract Development:**
- Test: `npm test` (runs all contract tests)
- Deploy to Sepolia: `npm run deploy:sepolia`
- Check deployer balance: `npm run check-balance:sepolia`
- Verify: `npx hardhat verify <CONTRACT_ADDRESS> --network sepolia`

**Docker Deployment:**
- Local development: `docker compose -f docker-compose.addons.yml up -d`
- Includes: API backend, IPFS node, Supabase stack
- API exposed on port 8080, IPFS on 5001/8080

**VPS Production Deployment:**
- Windows: `.\deploy.ps1 -VpsHost your.server.com [-VpsUser root] [-VpsPath /srv/singulai]`
- Builds Docker image with git commit tag
- Exports image as tar, transfers via SCP
- Auto-generates `compose.singulai.yml` on server
- Includes health check after deployment

**Testing & Verification:**
- Generate test JWT with your `API_JWT_SECRET`
- Test endpoints: `POST /api/avatars`, `POST /api/wallets/link`, `POST /api/capsules/:avatarId`, `POST /api/legacy`
- Internal cron: `POST /internal/cron/unlock-check`

## 📋 Project-Specific Patterns & Conventions

**Backend Architecture:**
- **ES Modules**: All imports use `import/export` syntax
- **Compact routing**: Each route file exports a single `router`
- **Configuration**: Centralized in `src/config.js` with dotenv
- **Error handling**: Try-catch with JSON error responses
- **Database**: Supabase client with row-level security
- **Blockchain**: ethers.js v6 contracts loaded from ABI files

**API Patterns:**
```javascript
// Standard route structure
export const router = express.Router();
router.post('/', async (req, res) => {
  try {
    // Business logic with contract interaction
    const tx = await contracts.avatarBase().mint(address, data);
    const row = await insert('table', { id, tx_hash: tx.hash });
    return res.json({ ok: true, result });
  } catch (e) { 
    return res.status(500).json({ error: e.message }); 
  }
});
```

**Contract Integration:**
- Contract addresses loaded from environment variables
- **Critical**: Update both `.env` and database after deployment
- All state changes return transaction hash for tracking
- Event emission for all major operations

**Database Schema:**
- Tables: `avatars`, `capsules`, `legacy`
- UUID primary keys with `gen_random_uuid()`
- Foreign keys with cascade deletion
- RLS policies restrict access to `auth.uid()` owned records

**IPFS Integration:**
- API endpoint: `IPFS_API_URL` (default: `http://ipfs:5001`)
- Gateway: `IPFS_GATEWAY` (default: `http://ipfs:8080`)
- Content addressed by CID (Content Identifier)

## 🚀 Integration Points & Dependencies

**External Services:**
- **Supabase**: Database, auth, and RLS policies
- **IPFS**: Decentralized content storage
- **Ethereum/Sepolia**: Smart contract deployment
- **n8n**: Workflow automation
- **Infura**: RPC endpoint for blockchain interaction

**Critical Environment Variables:**
```env
# Core API
PORT=8080
API_JWT_SECRET=your_jwt_secret

# Blockchain
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
CHAIN_ID=11155111
SIGNER_PRIVATE_KEY=your_deployer_private_key

# Contract addresses (updated after deployment)
AVATAR_BASE_ADDRESS=0x...
AVATAR_WALLET_LINK_ADDRESS=0x...
TIME_CAPSULE_ADDRESS=0x...
DIGITAL_LEGACY_ADDRESS=0x...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# IPFS
IPFS_API_URL=http://ipfs:5001
IPFS_GATEWAY=http://ipfs:8080
```

## ⚠️ Common Pitfalls & Gotchas

- **Port confusion**: Backend runs on 8080, not 3000
- **ES modules**: Must use `import/export`, not `require()`
- **PowerShell variables**: Use `${var}` syntax for complex variable expansion (fixed in deploy.ps1)
- **Contract addresses**: Update BOTH environment and database after deployment
- **Supabase RLS**: Ensure proper auth.uid() context for database operations
- **IPFS networking**: Use service names in Docker (`ipfs:5001` not `localhost:5001`)
- **JWT auth**: All `/api/*` routes require valid JWT token
- **Database migrations**: Apply schema changes to Supabase before starting backend
- **VPS deployment**: Ensure SSH key authentication is set up before using deploy.ps1

## 📚 Key Files & Entry Points

- `backend/src/index.js` – Main API server with route mounting
- `backend/src/config.js` – Environment configuration hub
- `backend/src/routes/` – API endpoint implementations
- `sql/supabase_schema.sql` – Database schema and RLS policies
- `scripts/deploy.js` – Smart contract deployment script
- `deploy.ps1` – VPS deployment script (Windows PowerShell)
- `n8n/*.json` – Automation workflows for import
- `docker-compose.addons.yml` – Full stack deployment configuration
- `hardhat.config.js` – Ethereum development configuration

---
*This project combines traditional web APIs with blockchain and decentralized storage. Always ensure environment parity between development and production, especially for contract addresses and service endpoints.*