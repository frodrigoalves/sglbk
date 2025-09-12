import axios from 'axios';
import { cfg } from '../config.js';
export async function notify(title, body){
  if(!cfg.chatwoot.token) return;
  const headers = { api_access_token: cfg.chatwoot.token };
  const conv = await axios.post(`${cfg.chatwoot.base}/api/v1/accounts/1/conversations`, { source_id: `singulai-${Date.now()}`, inbox_id: Number(cfg.chatwoot.inboxId||1), contact: { name: 'SingulAI Bot', email: 'bot@singulai.local' }}, { headers });
  const id = conv.data.id || conv.data?.payload?.id;
  await axios.post(`${cfg.chatwoot.base}/api/v1/accounts/1/conversations/${id}/messages`, { content: `**${title}**\n${body}` }, { headers });
}
