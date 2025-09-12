import { sb } from '../lib/supabase.js';
export async function verifyAvatarOwner(req, res, next){
  const avatarId = req.params.avatarId || req.body.avatarId;
  if(!avatarId) return res.status(400).json({ error: 'avatarId required' });
  const { data, error } = await sb.from('avatars').select('id,user_id').eq('id', avatarId).single();
  if(error || !data) return res.status(404).json({ error: 'avatar not found' });
  if(String(data.user_id) !== String(req.user.id)) return res.status(403).json({ error: 'forbidden' });
  next();
}
