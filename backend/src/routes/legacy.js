import express from 'express';
import { insert } from '../lib/supabase.js';
import { contracts } from '../lib/ethers.js';
import { verifyAvatarOwner } from '../middleware/owner.js';
export const router = express.Router();
router.post('/', verifyAvatarOwner, async (req, res) => {
  const { avatarId, messageCid, rules } = req.body;
  try {
    const dg = contracts.legacy();
    const tx = await dg.createLegacy(avatarId, messageCid, JSON.stringify(rules || {}));
    await tx.wait();
    const row = await insert('legacy', { avatar_id: avatarId, payload_cid: messageCid, rules, status: 'locked' });
    return res.json({ ok: true, tx_hash: tx.hash, legacy_id: row.id });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});
