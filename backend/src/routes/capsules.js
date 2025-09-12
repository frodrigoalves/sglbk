import express from 'express';
import multer from 'multer';
import { genKeyHex, pinBufferEncrypted } from '../lib/ipfs.js';
import { insert } from '../lib/supabase.js';
import { contracts } from '../lib/ethers.js';
import { verifyAvatarOwner } from '../middleware/owner.js';
const upload = multer();
export const router = express.Router();
router.post('/:avatarId', verifyAvatarOwner, upload.single('file'), async (req, res) => {
  const { avatarId } = req.params;
  const { unlockAt } = req.body;
  const buf = req.file?.buffer;
  if (!buf) return res.status(400).json({ error: 'file required' });
  try {
    const keyHex = genKeyHex();
    const { cid } = await pinBufferEncrypted(buf, keyHex);
    const tc = contracts.timeCapsule();
    const tx = await tc.createCapsule(avatarId, Math.floor(new Date(unlockAt).getTime()/1000), cid);
    await tx.wait();
    const row = await insert('capsules', { avatar_id: avatarId, cid, unlock_at: unlockAt, status: 'blocked', key_hex: keyHex });
    return res.json({ ok: true, cid, tx_hash: tx.hash, capsule_id: row.id });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});
