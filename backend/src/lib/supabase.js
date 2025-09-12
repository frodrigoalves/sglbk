import { createClient } from '@supabase/supabase-js';
import { cfg } from '../config.js';
export const sb = createClient(cfg.supabase.url, cfg.supabase.service);
export async function insert(table, values){ const { data, error } = await sb.from(table).insert(values).select().single(); if(error) throw error; return data; }
export async function update(table, match, values){ const { data, error } = await sb.from(table).update(values).match(match).select(); if(error) throw error; return data; }
export async function select(table, query){ const { data, error } = await sb.from(table).select('*').match(query); if(error) throw error; return data; }
