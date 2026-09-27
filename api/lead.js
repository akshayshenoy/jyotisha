// api/lead.js — saves Premium mobile number (with consent) → Upstash Redis (+ optional Google Sheet)
import { hasStore, redis } from '../lib/store.js';

async function toSheet(rec) {
  const url = process.env.SHEET_WEBHOOK_URL, secret = process.env.SHEET_SECRET;
  if (!url || !secret) return 'off';
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, ...rec }), redirect: 'follow', signal: AbortSignal.timeout(8000) });
    const j = await r.json().catch(() => ({}));
    return j.ok ? 'ok' : 'error';
  } catch { return 'error'; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Bad JSON' }); }

  const phone = String(body?.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: 'Invalid mobile number' });
  if (body?.consent !== true) return res.status(400).json({ error: 'Consent required' });

  const lang = ['en', 'kn', 'hi'].includes(body?.lang) ? body.lang : 'en';
  let city = '';
  try { city = decodeURIComponent(req.headers['x-vercel-ip-city'] || '').replace(/[^\p{L}\p{N} .\-]/gu, '').slice(0, 60); } catch {}
  const now = new Date().toISOString();
  console.log('LEAD', JSON.stringify({ phone, lang, city, at: now }));

  let db = 'off';
  if (hasStore()) {
    try {
      const [old] = await redis([['HGET', 'jy:leads', phone]]);
      const prev = old?.result ? JSON.parse(old.result) : null;
      const rec = { phone, lang, city: city || prev?.city || '', first: prev?.first || now, last: now, visits: (prev?.visits || 0) + 1 };
      await redis([['HSET', 'jy:leads', phone, JSON.stringify(rec)]]);
      db = 'saved';
    } catch (e) { console.error('redis failed', e.message); db = 'error'; }
  }
  const sheet = await toSheet({ phone, lang, city });
  return res.status(200).json({ ok: true, db, sheet });
}
