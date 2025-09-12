import express from 'express';
import { insert } from '../lib/supabase.js';
import { contracts } from '../lib/ethers.js';
export const router = express.Router();
router.post('/', async (req, res) => {
  const { user_id, attributes, wallet_address } = req.body;
  if (!user_id || !wallet_address) return res.status(400).json({ error: 'user_id and wallet_address required' });
  try {
    const base = contracts.avatarBase();
    const tx = await base.mint(wallet_address, JSON.stringify(attributes || {}));
    const rc = await tx.wait();
    const avatarId = rc && rc.logs && rc.logs[0] ? rc.logs[0].args?.tokenId?.toString?.() : null;
    const row = await insert('avatars', { id: avatarId || '0', user_id, wallet: wallet_address, tx_hash: tx.hash });
    return res.json({ ok: true, avatar_id: row.id, tx_hash: tx.hash });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});
