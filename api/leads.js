// api/leads.js — OWNER ONLY (used by /admin)
//   JSON: GET /api/leads   (header Authorization: Bearer ADMIN_KEY)
//   CSV : GET /api/leads?format=csv&key=ADMIN_KEY   (Google Sheets =IMPORTDATA)
import { hasStore, redis } from '../lib/store.js';
const LANG = { en: 'English', kn: 'Kannada', hi: 'Hindi' };
const ist = iso => { if (!iso) return ''; const d = new Date(new Date(iso).getTime() + 5.5 * 3600e3); return d.toISOString().slice(0, 16).replace('T', ' '); };
const csvCell = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const given = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '') || String(req.query.key || '');
  const KEY = (process.env.ADMIN_KEY || '').trim();
  if (!KEY || given.trim() !== KEY) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasStore()) return res.status(500).json({ error: 'Database not connected. Vercel → Storage → Upstash for Redis → Connect.' });

  const [all] = await redis([['HGETALL', 'jy:leads']]);
  const flat = all?.result || [];
  const rows = [];
  for (let i = 0; i < flat.length; i += 2) {
    const r = JSON.parse(flat[i + 1]);
    rows.push({ phone: r.phone, language: LANG[r.lang] || r.lang, city: r.city || '', first_visit_ist: ist(r.first), last_visit_ist: ist(r.last), visits: r.visits || 1, _last: r.last || '' });
  }
  rows.sort((a, b) => b._last.localeCompare(a._last));
  rows.forEach(r => delete r._last);

  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    if (req.query.download) res.setHeader('Content-Disposition', 'attachment; filename="jyotisha-users.csv"');
    const head = ['Phone', 'Language', 'City', 'First visit (IST)', 'Last visit (IST)', 'Visits'];
    return res.status(200).send([head.join(','), ...rows.map(r => [r.phone, r.language, r.city, r.first_visit_ist, r.last_visit_ist, r.visits].map(csvCell).join(','))].join('\n'));
  }
  const today = ist(new Date().toISOString()).slice(0, 10);
  return res.status(200).json({
    uniqueUsers: rows.length,
    totalVisits: rows.reduce((a, r) => a + r.visits, 0),
    newToday: rows.filter(r => r.first_visit_ist.startsWith(today)).length,
    users: rows,
  });
}
