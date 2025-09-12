import axios from 'axios';
import { cfg } from '../config.js';
import crypto from 'crypto';
export async function pinBufferEncrypted(buffer, keyHex){
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(keyHex, 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, enc]);
  const res = await axios.post(`${cfg.ipfs.api}/api/v0/add`, payload, { headers: { 'Content-Type': 'application/octet-stream' }, maxBodyLength: Infinity });
  const txt = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  const m = txt.match(/"Hash"\s*:\s*"([^"]+)"/) || txt.match(/([A-Za-z0-9]+)\s*$/);
  const cid = m ? m[1] : null;
  if(!cid) throw new Error('CID not returned');
  return { cid, size: payload.length };
}
export function genKeyHex(){ return crypto.randomBytes(32).toString('hex'); }
