import express from 'express';
import helmet from 'helmet';
import { cfg } from './config.js';
import { apiAuth } from './middleware/auth.js';
import { router as avatars } from './routes/avatars.js';
import { router as wallets } from './routes/wallets.js';
import { router as capsules } from './routes/capsules.js';
import { router as legacy } from './routes/legacy.js';
const app = express();
app.use(helmet()); app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', apiAuth);
app.use('/api/avatars', avatars);
app.use('/api/wallets', wallets);
app.use('/api/capsules', capsules);
app.use('/api/legacy', legacy);
app.post('/internal/cron/unlock-check', async (_req, res) => {
  const { default: run } = await import('./worker/unlock.js');
  try { await run(); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.listen(cfg.port, () => { console.log(`SingulAI API on ${cfg.port}`); });
