import { sb } from '../lib/supabase.js';
import { contracts } from '../lib/ethers.js';
import { notify } from '../lib/chatwoot.js';
export default async function run(){
  const now = new Date().toISOString();
  const { data, error } = await sb.from('capsules').select('id, avatar_id, cid, unlock_at, status').lte('unlock_at', now).eq('status','blocked');
  if (error) throw error;
  for (const c of data) {
    try {
      const tc = contracts.timeCapsule();
      const tx = await tc.unlockIfReady(c.avatar_id, c.cid);
      await tx.wait();
      await sb.from('capsules').update({ status: 'unlocked', unlocked_at: new Date().toISOString() }).eq('id', c.id);
      await notify('Cápsula desbloqueada', `avatar ${c.avatar_id} cid ${c.cid}`);
    } catch (e) {
      await notify('Falha ao desbloquear cápsula', `capsule ${c.id} erro ${e.message}`);
    }
  }
}
