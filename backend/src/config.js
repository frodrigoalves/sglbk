import * as dotenv from 'dotenv';
dotenv.config();
export const cfg = {
  port: parseInt(process.env.PORT || '8080', 10),
  apiJwtSecret: process.env.API_JWT_SECRET || 'dev',
  rpcUrl: process.env.RPC_URL,
  chainId: Number(process.env.CHAIN_ID || 0),
  pk: process.env.SIGNER_PRIVATE_KEY,
  contracts: {
    avatarBase: process.env.AVATAR_BASE_ADDRESS,
    walletLink: process.env.AVATAR_WALLET_LINK_ADDRESS,
    timeCapsule: process.env.TIME_CAPSULE_ADDRESS,
    legacy: process.env.DIGITAL_LEGACY_ADDRESS
  },
  supabase: { url: process.env.SUPABASE_URL, anon: process.env.SUPABASE_ANON_KEY, service: process.env.SUPABASE_SERVICE_KEY },
  ipfs: { api: process.env.IPFS_API_URL || 'http://ipfs:5001', gateway: process.env.IPFS_GATEWAY || 'http://ipfs:8080' },
  chatwoot: { base: process.env.CHATWOOT_BASE_URL, token: process.env.CHATWOOT_API_TOKEN, inboxId: process.env.CHATWOOT_INBOX_ID }
};
