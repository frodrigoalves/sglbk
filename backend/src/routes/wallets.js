import express from 'express';
import { contracts } from '../lib/ethers.js';
import { update } from '../lib/supabase.js';
import { verifyAvatarOwner } from '../middleware/owner.js';
export const router = express.Router();
router.post('/link', verifyAvatarOwner, async (req, res) => {
  const { avatarId, wallet } = req.body;
  try { const wl = contracts.walletLink(); const tx = await wl.link(avatarId, wallet); await tx.wait(); await update('avatars', { id: avatarId }, { wallet }); return res.json({ ok: true, tx_hash: tx.hash }); } catch(e){ return res.status(500).json({ error: e.message }); }
});
