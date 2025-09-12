import jwt from 'jsonwebtoken';
import { cfg } from '../config.js';
export function apiAuth(req, res, next){
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if(!token) return res.status(401).json({ error: 'no token' });
  try{ req.user = jwt.verify(token, cfg.apiJwtSecret); next(); } catch(e){ return res.status(401).json({ error: 'invalid token' }); }
}
