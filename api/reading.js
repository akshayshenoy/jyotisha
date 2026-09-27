// api/reading.js — optional Claude AI reading (Vercel). Without ANTHROPIC_API_KEY the site uses the free offline engine.
const LANG_INSTR = {
  en: 'Write in warm, flowing English.',
  kn: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಬರೆಯಿರಿ. Write entirely in Kannada script only.',
  hi: 'केवल हिंदी में लिखें। Write entirely in Hindi only.',
};

function buildPrompt(tab, data, lang) {
  const Y = new Date().getFullYear();
  const { name, sunSign, moonSign, rising, nakshatra, planets, elBalance, age, lucky } = data;
  const li = LANG_INSTR[lang] || LANG_INSTR.en;

  const base = `
Seeker: ${name}, Age ${age}.
Sun Sign: ${sunSign} | Moon Sign: ${moonSign} | Rising (Lagna): ${rising}
Nakshatra: ${nakshatra}
Mercury in ${planets.Mercury} | Venus in ${planets.Venus} | Mars in ${planets.Mars}
Jupiter in ${planets.Jupiter} | Saturn in ${planets.Saturn}
Rahu in ${planets.Rahu} | Ketu in ${planets.Ketu}
Dominant Element: ${Object.entries(elBalance).sort((a,b)=>b[1]-a[1])[0][0]}
Lucky Gem: ${lucky.gem} | Lucky Color: ${lucky.color} | Lucky Day: ${lucky.day}`.trim();

  const asks = {
    past: `Write a PAST LIFE & KARMA reading for ${name}. ${base}
Cover: karmic debts carried forward (Rahu-Ketu axis), childhood patterns shaped by their chart, Saturn's early lessons, soul mission this lifetime. 4 deep warm paragraphs. Address as ${name}.`,

    present: `Write a PRESENT LIFE reading for ${name} in ${Y}-${Y+1}. ${base}
Cover: current planetary transits affecting them, dominant life theme right now, what Saturn is teaching, Jupiter's blessings, practical guidance for this moment. 4 personal paragraphs.`,

    future: `Write a FUTURE reading for ${name} for next 5 years (${Y}-${Y+4}). ${base}
Cover: major planetary dasha cycles ahead, Saturn return implications, Jupiter transits bringing expansion, Rahu-Ketu shifts, specific windows of opportunity, what they are building toward. 4 hopeful paragraphs.`,

    love: `Write a LOVE & MARRIAGE reading for ${name}. ${base}
Cover: how they love (Venus sign), what they need emotionally (Moon sign), marriage timing indicators, ideal partner qualities, past relationship karma, compatibility with which signs. 4 warm paragraphs.`,

    career: `Write a CAREER & FINANCE reading for ${name}. ${base}
Cover: natural career gifts (10th house, Saturn), wealth patterns (2nd/11th house), best fields for them, financial abundance timing, business vs service, practical steps for success. 4 insightful paragraphs.`,

    health: `Write a HEALTH & WELLNESS reading for ${name}. ${base}
Cover: body constitution (element balance), vulnerable areas indicated by their chart, Ayurvedic dosha, mental wellness, best wellness practices for their planetary makeup, healing crystals and practices. 4 caring paragraphs.`,

    daily: `Write TODAY'S HOROSCOPE for ${name} (${sunSign}). ${base}
Cover: energy of the day, what to focus on, what to avoid, relationship energy today, lucky moment today. Keep it concise — 2 vibrant paragraphs.`,

    weekly: `Write THIS WEEK'S HOROSCOPE for ${name} (${sunSign}). ${base}
Cover: weekly theme, career energy, relationship energy, financial energy, spiritual energy, best day of week. 3 flowing paragraphs.`,

    monthly: `Write THIS MONTH'S HOROSCOPE for ${name} (${sunSign}). ${base}
Cover: monthly theme, major shifts mid-month, love and relationships, career and money, health and wellness, key dates to watch. 4 detailed paragraphs.`,

    yearly: `Write ${Y}-${Y+1} YEARLY PREDICTION for ${name}. ${base}
Cover: overall theme of the year, major life areas transforming, career and financial outlook, love and relationships, spiritual growth, best months of the year, months to be cautious. 5 rich paragraphs.`,

    dosdonts: `Write DOS & DON'TS for ${name} based on their chart. ${base}
Format as flowing prose advice (no bullet lists). Cover: what actions strengthen their energy, what habits to cultivate, what to avoid, which relationships to nurture, lifestyle aligned with their chart. 3 practical paragraphs.`,

    compatibility: `Write a MARRIAGE COMPATIBILITY reading for ${name}. ${base}
Cover: most compatible signs and why, signs to be cautious with, what ${name} needs in a partner, ideal timing for marriage, Mangal dosha check, Navamsa insights. 4 detailed paragraphs.`,
  };

  const system = `You are Jyotisha — a gifted master astrologer blending Vedic and Western traditions with 30 years of wisdom. Your readings are warm, mystical, deeply personal, and grounded. Write only plain paragraphs — absolutely no markdown, no bullet points, no headers, no asterisks, no numbered lists. Pure flowing prose only. ${li}`;

  return { system, prompt: asks[tab] || asks.present };
}



export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI not configured (offline mode)' });
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
  const { tab, lang, chartData } = body || {};
  if (!tab || !chartData) return res.status(400).json({ error: 'Missing tab or chartData' });
  const { system, prompt } = buildPrompt(tab, chartData, lang || 'en');
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1200, system, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status === 529 ? 503 : r.status).json({ error: data?.error?.message || `AI error ${r.status}` });
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    if (!text) return res.status(500).json({ error: 'Empty response from AI' });
    return res.status(200).json({ text });
  } catch (e) { return res.status(500).json({ error: e.message || 'AI reading failed' }); }
}
