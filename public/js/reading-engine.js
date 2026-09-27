/**
 * Jyotisha Offline Reading Engine
 * Generates all 12 readings in 3 languages (English, Kannada, Hindi) from the chart itself —
 * no API key, no cost, no rate limits. Uses real transits (Saturn, Jupiter,
 * Rahu, Moon, Sun) computed by AstroEngine for today's date.
 */
const ReadingEngine = (() => {
  const SIGNS = () => AstroEngine.SIGNS;
  const idxOf = n => SIGNS().findIndex(s => s.name === n);
  const sgn = i => SIGNS()[((i % 12) + 12) % 12];
  const house = (from, to) => ((to - from + 12) % 12) + 1;
  const LOCALE = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };

  // ── Seeded random (same person + same day → same reading) ──
  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  const sky = d => AstroEngine.compute({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: 12, minute: 0 });
  const fmt = (d, lang, opts) => { try { return new Intl.DateTimeFormat(LOCALE[lang] || 'en-IN', opts).format(d); } catch { return new Intl.DateTimeFormat('en-IN', opts).format(d); } };
  const ord = n => { const s = ['th','st','nd','rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ''));

  // ── Localised names ──
  const SIGN_NAME = (s, lang) => (lang === 'en' ? s.name : s[lang]) || s.name;
  const EL = { en:{Fire:'Fire',Earth:'Earth',Air:'Air',Water:'Water'}, kn:{Fire:'ಅಗ್ನಿ',Earth:'ಭೂಮಿ',Air:'ವಾಯು',Water:'ಜಲ'}, hi:{Fire:'अग्नि',Earth:'पृथ्वी',Air:'वायु',Water:'जल'} };
  const DOSHA = { en:{Fire:'Pitta',Earth:'Kapha',Air:'Vata',Water:'Kapha–Pitta'}, kn:{Fire:'ಪಿತ್ತ',Earth:'ಕಫ',Air:'ವಾತ',Water:'ಕಫ-ಪಿತ್ತ'}, hi:{Fire:'पित्त',Earth:'कफ',Air:'वात',Water:'कफ-पित्त'} };
  const PLANET = { en:{Sun:'Sun',Moon:'Moon',Mars:'Mars',Mercury:'Mercury',Jupiter:'Jupiter',Venus:'Venus',Saturn:'Saturn'}, kn:{Sun:'ಸೂರ್ಯ',Moon:'ಚಂದ್ರ',Mars:'ಕುಜ',Mercury:'ಬುಧ',Jupiter:'ಗುರು',Venus:'ಶುಕ್ರ',Saturn:'ಶನಿ'}, hi:{Sun:'सूर्य',Moon:'चंद्र',Mars:'मंगल',Mercury:'बुध',Jupiter:'गुरु',Venus:'शुक्र',Saturn:'शनि'} };
  const GEM = { kn:{'Red Coral':'ಹವಳ',Diamond:'ವಜ್ರ',Emerald:'ಪಚ್ಚೆ',Pearl:'ಮುತ್ತು',Ruby:'ಮಾಣಿಕ್ಯ','Yellow Sapphire':'ಪುಷ್ಯರಾಗ','Blue Sapphire':'ನೀಲಮಣಿ'}, hi:{'Red Coral':'मूंगा',Diamond:'हीरा',Emerald:'पन्ना',Pearl:'मोती',Ruby:'माणिक्य','Yellow Sapphire':'पुखराज','Blue Sapphire':'नीलम'} };
  const DAY_IDX = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
  const dayName = (en, lang) => { const d = new Date(2024, 0, 7 + (DAY_IDX[en] ?? 0)); return fmt(d, lang, { weekday: 'long' }); };

  // ── English sign bank ──
  const BANK = {
    Aries:{nature:"fiery courage and a pioneer's instinct",gift:'starting what others only dream of',shadow:'impatience and acting before thinking',love:'you love boldly and need a partner who can keep pace with your fire',career:'leadership, sports, defence, engineering, surgery or your own venture',body:'head, eyes and blood pressure'},
    Taurus:{nature:'steady patience and a deep love of beauty',gift:'building lasting value slowly and surely',shadow:'stubbornness and resistance to change',love:'you love loyally and sensually, and you need security, touch and steadiness',career:'banking, finance, food, agriculture, the arts, luxury goods or real estate',body:'throat, neck and thyroid'},
    Gemini:{nature:'a quick, curious mind and a gift for words',gift:'connecting people and ideas',shadow:'restlessness and scattered focus',love:'you love through conversation and need a partner who keeps your mind alive',career:'writing, media, teaching, sales, IT, communication or travel',body:'lungs, shoulders, arms and nerves'},
    Cancer:{nature:'deep feeling and protective care',gift:'nurturing others and making every place feel like home',shadow:'moodiness and holding on to the past',love:'you love devotedly and need emotional safety and a sense of family',career:'caregiving, hospitality, nursing, food, counselling or real estate',body:'chest, stomach and digestion'},
    Leo:{nature:'warm confidence and a generous heart',gift:'inspiring others and leading from the front',shadow:'pride and a hunger for recognition',love:'you love romantically and generously, and you need to feel truly appreciated',career:'government, management, performance, politics, medicine or creative direction',body:'heart, spine and back'},
    Virgo:{nature:'sharp analysis and a sincere wish to be useful',gift:'improving systems and serving with precision',shadow:'over-thinking and self-criticism',love:'you show love through care and small acts of service',career:'healthcare, accounting, analytics, editing, research or software',body:'intestines and nervous digestion'},
    Libra:{nature:'grace, fairness and a love of harmony',gift:'bringing balance and beauty to every space',shadow:'indecision and people-pleasing',love:'you love through partnership and need equality, beauty and romance',career:'law, design, diplomacy, fashion, HR or consulting',body:'kidneys, lower back and skin'},
    Scorpio:{nature:'intense depth and quiet determination',gift:'transforming crisis into power',shadow:'secrecy and holding grudges',love:'you love with total intensity and need complete trust',career:'research, investigation, surgery, psychology, finance or the occult sciences',body:'reproductive system and elimination'},
    Sagittarius:{nature:'optimism, faith and a thirst for wisdom',gift:'teaching and widening horizons',shadow:'bluntness and over-promising',love:'you love freely and need a partner who shares your vision and sense of adventure',career:'teaching, law, travel, publishing, spirituality or philosophy',body:'hips, thighs and liver'},
    Capricorn:{nature:'discipline, patience and long-term ambition',gift:'climbing steadily and building structures that last',shadow:'rigidity and overwork',love:'you are slow to open but, once committed, deeply dependable',career:'administration, engineering, government, construction or management',body:'bones, knees and joints'},
    Aquarius:{nature:'original thinking and humanitarian vision',gift:'innovating for the common good',shadow:'detachment and unpredictability',love:'you need friendship first and room to breathe within love',career:'technology, science, social work, aviation, networks or research',body:'calves, ankles and circulation'},
    Pisces:{nature:'compassion, imagination and spiritual sensitivity',gift:'healing and creating from intuition',shadow:'escapism and weak boundaries',love:'you love selflessly and long for a soulful, almost spiritual bond',career:'the arts, music, healing, spirituality, marine work or charity',body:'feet, lymph and immunity'},
  };
  const HOUSE_THEME = ['', 'self and personal direction', 'family and savings', 'courage and communication', 'home and inner peace', 'creativity, children and intelligence', 'health and overcoming obstacles', 'partnership and marriage', 'transformation and hidden matters', 'fortune, dharma and teachers', 'career and status', 'gains and friendships', 'spirituality, expenses and foreign lands'];
  const EN_EL = {
    body:{Fire:'You run warm, with strong digestion and drive, but you are prone to heat, acidity, inflammation and burnout when you push too hard.',Earth:'You have solid stamina, but can gather heaviness, a sluggish metabolism and congestion when routine turns into inertia.',Air:'You have a quick, light system, but are prone to anxiety, dryness, poor sleep and irregular digestion when life gets scattered.',Water:'You are sensitive and absorbent, prone to water retention, emotional eating and a strong mood–body link that needs care.'},
    practice:{Fire:'cooling pranayama like Sheetali, early-morning walks and going easy on spice',Earth:'brisk exercise, light warm meals and Surya Namaskar to keep energy moving',Air:'a fixed daily routine, warm oil massage (abhyanga) and regular sleep',Water:'gentle swimming, journaling and quiet meditation'},
    avoid:{Fire:'overheating your body and temper — excess spice, late nights and constant rushing',Earth:'sedentary habits, overeating and clinging too tightly to the familiar',Air:'irregular meals, too much screen time and overcommitting',Water:"absorbing other people's moods, emotional eating and isolating yourself"},
  };

  // ── Condition sentences & phrase pools, per language ──
  const C = {
    en: {
      sadeYes:'You are currently in Sade Sati, Saturn’s seven-and-a-half-year passage over your Moon — a season of effort and patience that ends by leaving you far stronger.',
      sadeNo:'You are not under Sade Sati at present, which gives you room to build without heavy Saturnine pressure.',
      mangalYes:'Mars in {mars} falls in the {marsHO} house from your ascendant, which traditionally indicates Mangal dosha; in practice it points to a strong, passionate temperament best matched with an equally spirited partner, and it is usually balanced through careful horoscope matching.',
      mangalNo:'Mars does not create Mangal dosha from your ascendant, which is traditionally considered favourable for harmony in marriage.',
      goodYears:"Jupiter's transits make {list} especially favourable years for growth, recognition and new beginnings.",
      goodYearsNone:"Jupiter's transits over this period ask for steady effort; rewards arrive in consolidated form rather than sudden leaps.",
      marriage:'Jupiter aspects your seventh house in {list}, making these strong windows for commitment or marriage.',
      marriageNone:'Jupiter does not directly aspect your seventh house in the next five years, so relationships grow best through patience and family guidance in this period.',
      srSoon:'Around {yr} you meet your Saturn return — a once-in-thirty-years review of your life’s structure. What is not truly yours may fall away, and what remains becomes rock-solid.',
      srFar:'Your first Saturn return, around {yr}, still lies ahead; the choices you make now are the foundation it will test.',
      srPast:'Having already passed your Saturn return, you now build from experience rather than theory, and the coming years reward that maturity.',
      bizYes:'Your chart leans toward independence: business, consulting or leadership roles suit you more than long stays in rigid hierarchies.',
      bizNo:'Your chart favours building expertise within a stable organisation first; independence comes later, from a position of strength.',
      dayGood:'This is a supportive Chandrabala day — energy flows easily and people respond warmly.',
      dayBad:'Chandrabala is weaker today, so move gently, double-check details and don’t force outcomes.',
      sunGood:'This is traditionally a strong solar transit for you — confidence and recognition come more easily.',
      sunBad:'The Sun’s position asks for humility and careful, steady effort this month.',
      yearCareerGood:"Jupiter's support makes this a year to expand — apply, invest in skills and ask for what you deserve.",
      yearCareerBad:'Growth this year comes through consolidation — strengthen what you have before chasing the new.',
      yearLoveYes:'Jupiter aspects your seventh house this year, opening a genuine window for commitment or marriage.',
      yearLoveNo:'Relationships deepen this year through honesty and shared routines; singles may meet someone through friends or family.',
      focus:['starting new work','time with family','financial planning','your health and exercise','learning something new','reconnecting with old friends'],
      avoid:['hasty decisions','unnecessary arguments','big purchases','being swayed by others’ opinions','cutting corners on sleep'],
      time:['morning','afternoon','evening'],
      rel:['a small kind gesture goes further than grand words','listen more than you speak','reach out to someone you have been missing','give your partner space and they will come closer','an honest conversation clears the air'],
      money:['review subscriptions and small leaks','it is a good week to save rather than spend','delay big purchases until you have compared options','follow up on money owed to you'],
      theme:['steady progress over speed','clearing old pending work','connection and collaboration','rest and recalibration','bold new beginnings'],
      work:['finish what you started before beginning something new','your ideas get noticed, so speak up in meetings','a mentor or senior may offer useful guidance','paperwork and deadlines need extra care'],
    },
    kn: {
      sadeYes:'ಈಗ ನಿಮಗೆ ಸಾಡೇ ಸಾತಿ ನಡೆಯುತ್ತಿದೆ — ಇದು ಶ್ರಮ ಮತ್ತು ತಾಳ್ಮೆಯ ಕಾಲ, ಆದರೆ ಕೊನೆಗೆ ಗಟ್ಟಿಯಾದ ಫಲ ನೀಡುತ್ತದೆ.',
      sadeNo:'ಈಗ ನಿಮಗೆ ಸಾಡೇ ಸಾತಿ ಇಲ್ಲ, ಇದು ಸಮಾಧಾನಕರ ಸಂಗತಿ.',
      mangalYes:'ಕುಜ ಲಗ್ನದಿಂದ {marsH}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ಕುಜ ದೋಷದ ಸೂಚನೆ ಇದೆ; ವಿವಾಹಕ್ಕೆ ಮುನ್ನ ಜಾತಕ ಹೊಂದಾಣಿಕೆ ಮಾಡಿಸುವುದು ಒಳ್ಳೆಯದು.',
      mangalNo:'ಲಗ್ನದಿಂದ ಕುಜ ದೋಷ ಇಲ್ಲ, ಇದು ವೈವಾಹಿಕ ಜೀವನಕ್ಕೆ ಶುಭ.',
      goodYears:'ಗುರುವಿನ ಸಂಚಾರದಿಂದ {list} ವರ್ಷಗಳು ನಿಮಗೆ ವಿಶೇಷ ಅನುಕೂಲಕರ.',
      goodYearsNone:'ಈ ಅವಧಿಯಲ್ಲಿ ನಿರಂತರ ಪರಿಶ್ರಮವೇ ನಿಮ್ಮ ಯಶಸ್ಸಿನ ಕೀಲಿ.',
      marriage:'ಗುರು ನಿಮ್ಮ ಏಳನೇ ಮನೆಯನ್ನು ನೋಡುವ {list} ವರ್ಷಗಳು ವಿವಾಹಕ್ಕೆ ಉತ್ತಮ ಸಮಯ.',
      marriageNone:'ಮುಂದಿನ ಐದು ವರ್ಷಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಮತ್ತು ಕುಟುಂಬದ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಸಂಬಂಧಗಳು ಬೆಳೆಯುತ್ತವೆ.',
      srSoon:'ಸುಮಾರು {yr} ರಲ್ಲಿ ಶನಿ ಪುನರಾಗಮನ ಬರುತ್ತದೆ — ಜೀವನದ ಅಡಿಪಾಯವನ್ನು ಪರೀಕ್ಷಿಸುವ ಮಹತ್ವದ ಕಾಲ.',
      srFar:'ನಿಮ್ಮ ಮೊದಲ ಶನಿ ಪುನರಾಗಮನ ಸುಮಾರು {yr} ರಲ್ಲಿ ಬರುತ್ತದೆ; ಈಗ ನೀವು ಮಾಡುವ ಆಯ್ಕೆಗಳೇ ಅದರ ಅಡಿಪಾಯ.',
      srPast:'ನೀವು ಈಗಾಗಲೇ ಶನಿ ಪುನರಾಗಮನ ದಾಟಿದ್ದೀರಿ; ಮುಂದಿನ ವರ್ಷಗಳು ನಿಮ್ಮ ಅನುಭವಕ್ಕೆ ಫಲ ನೀಡುತ್ತವೆ.',
      bizYes:'ನಿಮ್ಮ ಜಾತಕ ಸ್ವತಂತ್ರ ವ್ಯಾಪಾರ ಅಥವಾ ನಾಯಕತ್ವದ ಪಾತ್ರಗಳಿಗೆ ಒಲವು ತೋರುತ್ತದೆ.',
      bizNo:'ಮೊದಲು ಸ್ಥಿರ ಸಂಸ್ಥೆಯಲ್ಲಿ ಅನುಭವ ಗಳಿಸಿ, ನಂತರ ಸ್ವತಂತ್ರ ಉದ್ಯಮ ಆರಂಭಿಸುವುದು ನಿಮಗೆ ಉತ್ತಮ.',
      dayGood:'ಇಂದು ಚಂದ್ರಬಲ ಉತ್ತಮವಾಗಿದೆ — ಕೆಲಸಗಳು ಸುಗಮವಾಗಿ ನಡೆಯುತ್ತವೆ.',
      dayBad:'ಇಂದು ಚಂದ್ರಬಲ ಸ್ವಲ್ಪ ಕಡಿಮೆ — ನಿಧಾನವಾಗಿ, ಎಚ್ಚರಿಕೆಯಿಂದ ಮುಂದುವರಿಯಿರಿ.',
      sunGood:'ಇದು ಸೂರ್ಯನ ಶುಭ ಸಂಚಾರ — ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಗೌರವ ಸುಲಭವಾಗಿ ಸಿಗುತ್ತದೆ.',
      sunBad:'ಈ ತಿಂಗಳು ವಿನಯ ಮತ್ತು ಎಚ್ಚರಿಕೆಯ ಪರಿಶ್ರಮ ಅಗತ್ಯ.',
      yearCareerGood:'ಗುರುವಿನ ಬೆಂಬಲದಿಂದ ಈ ವರ್ಷ ವೃತ್ತಿ ಮತ್ತು ಹಣಕಾಸಿನಲ್ಲಿ ವಿಸ್ತರಣೆಗೆ ಉತ್ತಮ ಸಮಯ.',
      yearCareerBad:'ಈ ವರ್ಷ ಹೊಸದನ್ನು ಬೆನ್ನಟ್ಟುವ ಬದಲು ಇರುವುದನ್ನು ಬಲಪಡಿಸಿ.',
      yearLoveYes:'ಈ ವರ್ಷ ಗುರು ನಿಮ್ಮ ಏಳನೇ ಮನೆಯನ್ನು ನೋಡುತ್ತಾನೆ — ವಿವಾಹ ಅಥವಾ ಬದ್ಧತೆಗೆ ಶುಭ ಅವಕಾಶ.',
      yearLoveNo:'ಈ ವರ್ಷ ಪ್ರಾಮಾಣಿಕತೆಯಿಂದ ಸಂಬಂಧಗಳು ಆಳವಾಗುತ್ತವೆ.',
      body:{Fire:'ನಿಮ್ಮ ದೇಹದಲ್ಲಿ ಉಷ್ಣತೆ ಹೆಚ್ಚು; ಆಮ್ಲತೆ, ಉರಿಯೂತ ಮತ್ತು ಅತಿಯಾದ ಆಯಾಸದ ಬಗ್ಗೆ ಎಚ್ಚರ.',Earth:'ನಿಮಗೆ ಉತ್ತಮ ಸಹನಶಕ್ತಿ ಇದೆ, ಆದರೆ ತೂಕ ಹೆಚ್ಚಳ ಮತ್ತು ಜಡತ್ವದ ಬಗ್ಗೆ ಎಚ್ಚರ.',Air:'ನಿಮ್ಮ ಮನಸ್ಸು ಚುರುಕು, ಆದರೆ ಆತಂಕ, ನಿದ್ರಾಹೀನತೆ ಮತ್ತು ಅಜೀರ್ಣದ ಬಗ್ಗೆ ಎಚ್ಚರ.',Water:'ನೀವು ಸಂವೇದನಾಶೀಲರು; ಭಾವನೆಗಳು ದೇಹದ ಮೇಲೆ ಬೇಗ ಪರಿಣಾಮ ಬೀರುತ್ತವೆ, ನೀರು ಶೇಖರಣೆಯ ಬಗ್ಗೆ ಎಚ್ಚರ.'},
      practice:{Fire:'ಶೀತಲಿ ಪ್ರಾಣಾಯಾಮ, ಬೆಳಗಿನ ನಡಿಗೆ ಮತ್ತು ಕಡಿಮೆ ಖಾರದ ಆಹಾರ ನಿಮಗೆ ಒಳ್ಳೆಯದು.',Earth:'ಚುರುಕಾದ ವ್ಯಾಯಾಮ, ಹಗುರವಾದ ಬಿಸಿ ಆಹಾರ ಮತ್ತು ಸೂರ್ಯ ನಮಸ್ಕಾರ ನಿಮಗೆ ಒಳ್ಳೆಯದು.',Air:'ನಿಯಮಿತ ದಿನಚರಿ, ಎಣ್ಣೆ ಮಸಾಜ್ (ಅಭ್ಯಂಗ) ಮತ್ತು ಸರಿಯಾದ ನಿದ್ರೆ ನಿಮಗೆ ಒಳ್ಳೆಯದು.',Water:'ಈಜು, ದಿನಚರಿ ಬರೆಯುವುದು ಮತ್ತು ಧ್ಯಾನ ನಿಮಗೆ ಒಳ್ಳೆಯದು.'},
      fields:{Fire:'ನಾಯಕತ್ವ, ಸರ್ಕಾರಿ ಸೇವೆ, ಕ್ರೀಡೆ, ಎಂಜಿನಿಯರಿಂಗ್ ಮತ್ತು ಸ್ವಂತ ಉದ್ಯಮ',Earth:'ಬ್ಯಾಂಕಿಂಗ್, ಹಣಕಾಸು, ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಆಡಳಿತ ಮತ್ತು ಕೃಷಿ',Air:'ಐಟಿ, ಶಿಕ್ಷಣ, ಮಾಧ್ಯಮ, ಕಾನೂನು ಮತ್ತು ಸಲಹಾ ಸೇವೆ',Water:'ವೈದ್ಯಕೀಯ, ಆರೈಕೆ, ಮನೋವಿಜ್ಞಾನ, ಕಲೆ ಮತ್ತು ಸಂಶೋಧನೆ'},
      avoidEl:{Fire:'ಅತಿಯಾದ ಖಾರ, ತಡರಾತ್ರಿ ಮತ್ತು ಕೋಪವನ್ನು ತಪ್ಪಿಸಿ.',Earth:'ಕುಳಿತೇ ಇರುವ ಅಭ್ಯಾಸ ಮತ್ತು ಅತಿಯಾದ ಊಟವನ್ನು ತಪ್ಪಿಸಿ.',Air:'ಅನಿಯಮಿತ ಊಟ, ಅತಿಯಾದ ಸ್ಕ್ರೀನ್ ಸಮಯ ಮತ್ತು ಅತಿಯಾದ ಜವಾಬ್ದಾರಿಗಳನ್ನು ತಪ್ಪಿಸಿ.',Water:'ಇತರರ ಮನಸ್ಥಿತಿಯನ್ನು ಹೀರಿಕೊಳ್ಳುವುದು ಮತ್ತು ಒಂಟಿತನವನ್ನು ತಪ್ಪಿಸಿ.'},
      focus:['ಹೊಸ ಕೆಲಸದ ಆರಂಭ','ಕುಟುಂಬದೊಂದಿಗಿನ ಸಮಯ','ಹಣಕಾಸು ಯೋಜನೆ','ಆರೋಗ್ಯ ಮತ್ತು ವ್ಯಾಯಾಮ','ಹೊಸ ವಿಷಯದ ಕಲಿಕೆ','ಹಳೆಯ ಸ್ನೇಹಿತರ ಸಂಪರ್ಕ'],
      avoid:['ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು','ಅನಗತ್ಯ ವಾದಗಳನ್ನು','ದೊಡ್ಡ ಖರ್ಚುಗಳನ್ನು','ಇತರರ ಮಾತಿಗೆ ಅತಿಯಾಗಿ ಮಣಿಯುವುದನ್ನು','ನಿದ್ರೆ ಕಡಿಮೆ ಮಾಡುವುದನ್ನು'],
      time:['ಬೆಳಿಗ್ಗೆಯ','ಮಧ್ಯಾಹ್ನದ','ಸಂಜೆಯ'],
    },
    hi: {
      sadeYes:'इस समय आप पर साढ़े साती चल रही है — यह परिश्रम और धैर्य का समय है, पर अंत में ठोस फल देता है।',
      sadeNo:'इस समय आप पर साढ़े साती नहीं है, यह राहत की बात है।',
      mangalYes:'मंगल लग्न से {marsH}वें भाव में है, इसलिए मांगलिक दोष का संकेत है; विवाह से पहले कुंडली मिलान अवश्य कराएं।',
      mangalNo:'लग्न से मांगलिक दोष नहीं है, जो वैवाहिक जीवन के लिए शुभ है।',
      goodYears:'गुरु के गोचर से {list} वर्ष आपके लिए विशेष रूप से शुभ हैं।',
      goodYearsNone:'इस अवधि में निरंतर परिश्रम ही सफलता की कुंजी है।',
      marriage:'गुरु की दृष्टि {list} में आपके सप्तम भाव पर रहेगी — ये विवाह के लिए उत्तम समय हैं।',
      marriageNone:'अगले पाँच वर्षों में धैर्य और परिवार के मार्गदर्शन से संबंध आगे बढ़ेंगे।',
      srSoon:'लगभग {yr} में शनि की वापसी होगी — जीवन की नींव को परखने का महत्वपूर्ण समय।',
      srFar:'आपकी पहली शनि वापसी लगभग {yr} में आएगी; अभी के निर्णय ही उसकी नींव हैं।',
      srPast:'आप शनि वापसी पार कर चुके हैं; आने वाले वर्ष आपके अनुभव का फल देंगे।',
      bizYes:'आपकी कुंडली स्वतंत्र व्यापार या नेतृत्व की भूमिका की ओर झुकाव दिखाती है।',
      bizNo:'पहले किसी स्थिर संस्था में अनुभव लें, फिर अपना उद्यम शुरू करना आपके लिए बेहतर है।',
      dayGood:'आज चंद्रबल अच्छा है — काम सहजता से होंगे।',
      dayBad:'आज चंद्रबल थोड़ा कमज़ोर है — धीरे और सावधानी से आगे बढ़ें।',
      sunGood:'यह सूर्य का शुभ गोचर है — आत्मविश्वास और सम्मान आसानी से मिलेंगे।',
      sunBad:'इस माह विनम्रता और सावधानीपूर्वक परिश्रम आवश्यक है।',
      yearCareerGood:'गुरु के सहयोग से इस वर्ष करियर और धन में विस्तार का अच्छा समय है।',
      yearCareerBad:'इस वर्ष नए के पीछे भागने के बजाय जो है उसे मज़बूत करें।',
      yearLoveYes:'इस वर्ष गुरु आपके सप्तम भाव को देखता है — विवाह या प्रतिबद्धता का शुभ अवसर।',
      yearLoveNo:'इस वर्ष ईमानदारी से संबंध गहरे होंगे।',
      body:{Fire:'आपके शरीर में गर्मी अधिक है; एसिडिटी, सूजन और अत्यधिक थकान से सावधान रहें।',Earth:'आपकी सहनशक्ति अच्छी है, पर वज़न बढ़ने और आलस्य से सावधान रहें।',Air:'आपका मन तेज़ है, पर चिंता, अनिद्रा और अपच से सावधान रहें।',Water:'आप संवेदनशील हैं; भावनाएं शरीर पर जल्दी असर करती हैं, जल-संचय से सावधान रहें।'},
      practice:{Fire:'शीतली प्राणायाम, सुबह की सैर और कम मसालेदार भोजन आपके लिए अच्छे हैं।',Earth:'तेज़ व्यायाम, हल्का गर्म भोजन और सूर्य नमस्कार आपके लिए अच्छे हैं।',Air:'नियमित दिनचर्या, तेल मालिश (अभ्यंग) और पूरी नींद आपके लिए अच्छे हैं।',Water:'तैराकी, डायरी लिखना और ध्यान आपके लिए अच्छे हैं।'},
      fields:{Fire:'नेतृत्व, सरकारी सेवा, खेल, इंजीनियरिंग और अपना व्यवसाय',Earth:'बैंकिंग, वित्त, रियल एस्टेट, प्रशासन और कृषि',Air:'आईटी, शिक्षा, मीडिया, कानून और परामर्श',Water:'चिकित्सा, देखभाल सेवा, मनोविज्ञान, कला और शोध'},
      avoidEl:{Fire:'अधिक मसाला, देर रात और क्रोध से बचें।',Earth:'लगातार बैठे रहने और अधिक भोजन से बचें।',Air:'अनियमित भोजन, अधिक स्क्रीन समय और अत्यधिक ज़िम्मेदारियों से बचें।',Water:'दूसरों की भावनाओं को अपने ऊपर लेने और अकेलेपन से बचें।'},
      focus:['नए काम की शुरुआत','परिवार के साथ समय','आर्थिक योजना','स्वास्थ्य और व्यायाम','कुछ नया सीखने','पुराने मित्रों से संपर्क'],
      avoid:['जल्दबाज़ी के निर्णयों','बेवजह की बहस','बड़े खर्चों','दूसरों की बातों में आने','नींद कम करने'],
      time:['सुबह','दोपहर','शाम'],
    },
  };

  // ── Templates (Indic languages) ──
  const T = {
    kn: {
      past:'{name}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ರಾಹು {rahu} ರಾಶಿಯಲ್ಲಿ ಮತ್ತು ಕೇತು {ketu} ರಾಶಿಯಲ್ಲಿ ಇದ್ದಾರೆ. ಕೇತು ಹಿಂದಿನ ಜನ್ಮಗಳಲ್ಲಿ ನೀವು ಗಳಿಸಿದ ಜ್ಞಾನ ಮತ್ತು ಕೌಶಲ್ಯವನ್ನು ತೋರಿಸುತ್ತಾನೆ; ರಾಹು ಈ ಜನ್ಮದಲ್ಲಿ ನೀವು ಬೆಳೆಯಬೇಕಾದ ದಿಕ್ಕನ್ನು ತೋರಿಸುತ್ತಾನೆ.\n{nak} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನಿಸಿದ ನೀವು ಆಳವಾದ ಅಂತರ್ದೃಷ್ಟಿಯೊಂದಿಗೆ ಬಂದಿದ್ದೀರಿ. ಬಾಲ್ಯದಲ್ಲಿ {moon} ರಾಶಿಯ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಭಾವನೆಗಳು ಬಲವಾಗಿ ರೂಪುಗೊಂಡವು.\n{saturn} ರಾಶಿಯಲ್ಲಿರುವ ಶನಿ ನಿಮಗೆ ಚಿಕ್ಕ ವಯಸ್ಸಿನಲ್ಲೇ ತಾಳ್ಮೆ ಮತ್ತು ಜವಾಬ್ದಾರಿಯ ಪಾಠ ಕಲಿಸಿದನು. ಈ ಜನ್ಮದ ಆತ್ಮದ ಗುರಿ — ಹಳೆಯ ಅಭ್ಯಾಸಗಳನ್ನು ಬಿಟ್ಟು, ರಾಹು ತೋರಿಸುವ ಹೊಸ ದಾರಿಯಲ್ಲಿ ಧೈರ್ಯದಿಂದ ನಡೆಯುವುದು.',
      present:'{name}, ಈಗ ಶನಿ {trSat} ರಾಶಿಯಲ್ಲಿ (ನಿಮ್ಮ ಚಂದ್ರನಿಂದ {satH}ನೇ ಮನೆ) ಮತ್ತು ಗುರು {trJup} ರಾಶಿಯಲ್ಲಿ (ಚಂದ್ರನಿಂದ {jupH}ನೇ ಮನೆ) ಸಂಚರಿಸುತ್ತಿದ್ದಾರೆ. {sadesati}\n{sun} ಸೂರ್ಯ ಮತ್ತು {rise} ಲಗ್ನ ನಿಮ್ಮನ್ನು ಸ್ಪಷ್ಟ ಗುರಿಯ ಕಡೆ ಕರೆಯುತ್ತಿವೆ. {el} ತತ್ವ ಪ್ರಧಾನವಾಗಿರುವ ನೀವು ಇತರರ ವೇಗವನ್ನು ಅನುಕರಿಸದೆ ನಿಮ್ಮದೇ ಲಯದಲ್ಲಿ ಮುಂದೆ ಸಾಗಿದಾಗ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ.\n{yearCareer} ಪ್ರತಿ {day} ಸ್ವಲ್ಪ ಸಮಯ ಧ್ಯಾನ ಅಥವಾ ಪ್ರಾರ್ಥನೆಗೆ ಮೀಸಲಿಡಿ; {nak} ನಕ್ಷತ್ರ ನಿಮಗೆ ನಂಬಬಹುದಾದ ಅಂತರ್ದೃಷ್ಟಿ ನೀಡುತ್ತದೆ.',
      future:'{name}, {y1} ರಿಂದ {y5} ರವರೆಗಿನ ಐದು ವರ್ಷಗಳು ನಿಮ್ಮ ಜೀವನದ ಮಹತ್ವದ ಅಧ್ಯಾಯ. {goodYears}\n{satRet} ಈಗ ರಾಹು {trRahu} ರಾಶಿಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದಾನೆ; ರಾಹು-ಕೇತು ರಾಶಿ ಬದಲಿಸುವ ಸಮಯಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಹೊಸ ಅವಕಾಶಗಳು ಬರಬಹುದು.\nನಿಮ್ಮ ಹತ್ತನೇ ಮನೆ {h10} ರಾಶಿಯಲ್ಲಿರುವುದರಿಂದ, ನೀವು ಕಟ್ಟುತ್ತಿರುವುದು ದೀರ್ಘಕಾಲ ಉಳಿಯುವ ಹೆಸರು ಮತ್ತು ಗೌರವ. ತಾಳ್ಮೆಯಿಂದ ಮುಂದುವರಿದರೆ ಈ ಐದು ವರ್ಷಗಳು ನಿಮ್ಮ ಮುಂದಿನ ಜೀವನಕ್ಕೆ ಗಟ್ಟಿ ಅಡಿಪಾಯವಾಗುತ್ತವೆ.',
      love:'{name}, ನಿಮ್ಮ ಶುಕ್ರ {venus} ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ — ಇದು ನೀವು ಪ್ರೀತಿಸುವ ರೀತಿಯನ್ನು ತೋರಿಸುತ್ತದೆ. {moon} ರಾಶಿಯ ಚಂದ್ರ ನಿಮಗೆ ಭಾವನಾತ್ಮಕ ಭದ್ರತೆ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಸಂಗಾತಿಯ ಅಗತ್ಯವನ್ನು ಸೂಚಿಸುತ್ತಾನೆ.\nನಿಮ್ಮ ಏಳನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ) {h7} ರಾಶಿ. ಚಂದ್ರ ರಾಶಿಯ ಪ್ರಕಾರ {good} ರಾಶಿಯವರೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆ ಉತ್ತಮ; {caution} ರಾಶಿಯವರೊಂದಿಗೆ ಹೆಚ್ಚು ತಾಳ್ಮೆ ಬೇಕು.\n{mangal} {marriage}',
      career:'{name}, ನಿಮ್ಮ ಹತ್ತನೇ ಮನೆ (ಕರ್ಮ ಸ್ಥಾನ) {h10} ರಾಶಿ ಮತ್ತು ಶನಿ {saturn} ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ. ಇದು ಶಿಸ್ತು ಮತ್ತು ಪರಿಶ್ರಮದಿಂದ ಖಚಿತವಾಗಿ ಬೆಳೆಯುವ ವೃತ್ತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.\n{fields} ಕ್ಷೇತ್ರಗಳು ನಿಮ್ಮ ಸ್ವಭಾವಕ್ಕೆ ಹೊಂದುತ್ತವೆ. {biz}\nಗುರು {jupiter} ರಾಶಿಯಲ್ಲಿರುವುದರಿಂದ ಉಳಿತಾಯ ಮತ್ತು ದೀರ್ಘಕಾಲದ ಹೂಡಿಕೆ ನಿಮಗೆ ಲಾಭ ತರುತ್ತದೆ; ಜೂಜು ಅಥವಾ ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆ ಬೇಡ. ಮುಖ್ಯ ಕೆಲಸಗಳನ್ನು {day} ಆರಂಭಿಸಿ.',
      health:'{name}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ {el} ತತ್ವ ಪ್ರಧಾನ; ಆಯುರ್ವೇದದ ಪ್ರಕಾರ ನಿಮ್ಮದು {dosha} ಪ್ರಕೃತಿಯ ಒಲವು. {body}\n{practice} ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ಸೋಮವಾರ ಧ್ಯಾನ ಮಾಡಿ — ಅದು ಚಂದ್ರನ ದಿನ.\nಜ್ಯೋತಿಷ್ಯ ಪ್ರವೃತ್ತಿಗಳನ್ನು ಮಾತ್ರ ತೋರಿಸುತ್ತದೆ; ಯಾವುದೇ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗೆ ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.',
      daily:'{name}, ಇಂದು ({dateStr}) ಚಂದ್ರ {todayMoon} ರಾಶಿಯಲ್ಲಿ, ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರನಿಂದ {cb}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದಾನೆ. {dayMood} ಇಂದು {focus} ಕಡೆಗೆ ಗಮನ ಕೊಡಿ, {avoid} ತಪ್ಪಿಸಿ.\n{time} ಸಮಯ ನಿಮಗೆ ಅದೃಷ್ಟದ ಕ್ಷಣ. ಸಂಬಂಧಗಳಲ್ಲಿ ಸಣ್ಣ ಪ್ರೀತಿಯ ನಡೆ ದೊಡ್ಡ ಮಾತುಗಳಿಗಿಂತ ಹೆಚ್ಚು ಪರಿಣಾಮ ಬೀರುತ್ತದೆ. ಇಂದಿನ ಅದೃಷ್ಟ ಸಂಖ್ಯೆ {luckyNum}.',
      weekly:'{name}, ಈ ವಾರ ಗುರು ನಿಮ್ಮ ಚಂದ್ರನಿಂದ {jupH}ನೇ ಮನೆಯಲ್ಲಿ ಮತ್ತು ಶನಿ {satH}ನೇ ಮನೆಯಲ್ಲಿ ಇರುವುದರಿಂದ ಸ್ಥಿರ ಪ್ರಗತಿ ಮುಖ್ಯ ವಿಷಯ. ವೇಗಕ್ಕಿಂತ ನಿರಂತರತೆಗೆ ಆದ್ಯತೆ ಕೊಡಿ.\nಈ ವಾರದ ಅತ್ಯುತ್ತಮ ದಿನ {bestDay} — ಆ ದಿನ ಚಂದ್ರ ನಿಮಗೆ ಅನುಕೂಲ ಸ್ಥಾನದಲ್ಲಿರುತ್ತಾನೆ. ವೃತ್ತಿ ಮತ್ತು ಹಣಕಾಸಿನ ಮುಖ್ಯ ನಿರ್ಧಾರಗಳನ್ನು ಅಂದೇ ತೆಗೆದುಕೊಳ್ಳಿ. {focus} ಕಡೆಗೆ ಗಮನ ಕೊಡಿ.\nಆಧ್ಯಾತ್ಮಿಕವಾಗಿ, ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಕೆಲವು ನಿಮಿಷ ಮೌನವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ. {day} ದೀಪ ಹಚ್ಚಿ ಕೃತಜ್ಞತೆ ಸಲ್ಲಿಸಿ.',
      monthly:'{name}, {monthName} ತಿಂಗಳಲ್ಲಿ ಸೂರ್ಯ {sunTr} ರಾಶಿಯಲ್ಲಿ, ನಿಮ್ಮ ಚಂದ್ರನಿಂದ {sunH}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಾನೆ. {sunMood} ತಿಂಗಳ ಮಧ್ಯದಲ್ಲಿ ಸೂರ್ಯ {sunNext} ರಾಶಿಗೆ ಪ್ರವೇಶಿಸುತ್ತಾನೆ.\nಪ್ರೀತಿ ಮತ್ತು ಕುಟುಂಬದಲ್ಲಿ ಪ್ರಾಮಾಣಿಕ ಮಾತುಕತೆ ಸಂಬಂಧಗಳನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ. ವೃತ್ತಿಯಲ್ಲಿ, ಹೊಸದನ್ನು ಆರಂಭಿಸುವ ಮೊದಲು ಬಾಕಿ ಕೆಲಸಗಳನ್ನು ಮುಗಿಸಿ. {practice}\nಗಮನಿಸಬೇಕಾದ ಶುಭ ದಿನಾಂಕಗಳು: {keyDates}.',
      yearly:'{name}, {year} ಅವಧಿಯಲ್ಲಿ ಗುರು {trJup} ರಾಶಿಯಲ್ಲಿ (ಚಂದ್ರನಿಂದ {jupH}ನೇ ಮನೆ) ಮತ್ತು ಶನಿ {trSat} ರಾಶಿಯಲ್ಲಿ (ಚಂದ್ರನಿಂದ {satH}ನೇ ಮನೆ) ಇದ್ದು ವರ್ಷದ ದಿಕ್ಕನ್ನು ನಿರ್ಧರಿಸುತ್ತಾರೆ. {sadesati}\n{yearCareer}\n{yearLove}\nನಿಮ್ಮ {nak} ನಕ್ಷತ್ರ ಮತ್ತು {ketu} ರಾಶಿಯ ಕೇತು ಆತ್ಮಚಿಂತನೆಯ ಕಡೆ ಸೆಳೆಯುತ್ತಾರೆ; ಈ ವರ್ಷ ನಿಯಮಿತ ಸಾಧನೆ ಶಾಂತವಾಗಿ ಫಲ ನೀಡುತ್ತದೆ.\nಉತ್ತಮ ತಿಂಗಳುಗಳು: {bestMonths}. ಎಚ್ಚರಿಕೆಯ ತಿಂಗಳುಗಳು: {cautionMonths}.',
      dosdonts:'{name}, ನಿಮ್ಮ ರಾಶ್ಯಾಧಿಪತಿ {ruler} — ಶಿಸ್ತು ಮತ್ತು ಕೃತಜ್ಞತೆಯಿಂದ ಅವನನ್ನು ಗೌರವಿಸಿ. ಮುಖ್ಯ ಕೆಲಸಗಳನ್ನು {day} ಆರಂಭಿಸಿ; {gem} ರತ್ನವನ್ನು ಜ್ಯೋತಿಷಿಯ ಸಲಹೆಯೊಂದಿಗೆ ಧರಿಸಬಹುದು.\n{practice} {avoidEl}\n{good} ರಾಶಿಯವರೊಂದಿಗಿನ ಸಂಬಂಧಗಳನ್ನು ಪೋಷಿಸಿ; ಅವರು ನಿಮ್ಮ ಬೆಳವಣಿಗೆಗೆ ಬೆಂಬಲ ನೀಡುತ್ತಾರೆ.',
      compatibility:'{name}, ನಿಮ್ಮ {moon} ಚಂದ್ರ ರಾಶಿಯಿಂದ ವಿವಾಹಕ್ಕೆ ಹೆಚ್ಚು ಹೊಂದುವ ರಾಶಿಗಳು: {good}. ಚಂದ್ರನಿಂದ 5, 9ನೇ ರಾಶಿಗಳು ತ್ರಿಕೋಣ ಸಾಮರಸ್ಯ ನೀಡುತ್ತವೆ, 7ನೇ ರಾಶಿ ಸಹಜ ಸಂಗಾತಿ, 11ನೇ ರಾಶಿ ಸ್ನೇಹ ಮತ್ತು ಲಾಭ ತರುತ್ತದೆ.\n{caution} ರಾಶಿಗಳು ಚಂದ್ರನಿಂದ 6 ಮತ್ತು 8ನೇ ಸ್ಥಾನದಲ್ಲಿವೆ (ಷಡಷ್ಟಕ); ಇಂತಹ ಹೊಂದಾಣಿಕೆಗೆ ಇತರ ಗುಣಗಳ ಬಲವಾದ ಮಿಲನ ಅಗತ್ಯ. {mangal}\n{marriage} ಸಂಪೂರ್ಣ ನವಾಂಶ ಮತ್ತು ಅಷ್ಟಕೂಟ ಗುಣ ಮಿಲನಕ್ಕೆ ನಿಖರ ಜನ್ಮ ಸಮಯ ಮತ್ತು ಸಂಗಾತಿಯ ಜಾತಕ ಅಗತ್ಯ.',
    },
    hi: {
      past:'{name}, आपकी कुंडली में राहु {rahu} राशि में और केतु {ketu} राशि में हैं। केतु पिछले जन्मों में अर्जित ज्ञान और कौशल को दर्शाता है, और राहु वह दिशा दिखाता है जिसमें इस जन्म में आपको आगे बढ़ना है।\n{nak} नक्षत्र में जन्मे आप गहरी अंतर्दृष्टि के साथ आए हैं। बचपन में {moon} राशि के चंद्रमा के प्रभाव से आपकी भावनाएं बहुत गहराई से बनीं।\n{saturn} राशि में स्थित शनि ने आपको कम उम्र में ही धैर्य और ज़िम्मेदारी का पाठ सिखाया। इस जन्म में आत्मा का लक्ष्य है — पुरानी आदतों को छोड़कर राहु द्वारा दिखाए नए मार्ग पर साहस से चलना।',
      present:'{name}, इस समय शनि {trSat} राशि में (आपके चंद्रमा से {satH}वें भाव में) और गुरु {trJup} राशि में (चंद्रमा से {jupH}वें भाव में) गोचर कर रहे हैं। {sadesati}\n{sun} राशि का सूर्य और {rise} लग्न आपको स्पष्ट लक्ष्य की ओर बुला रहे हैं। {el} तत्व प्रधान होने के कारण, दूसरों की गति की नकल किए बिना अपनी लय में चलने पर ही सफलता मिलेगी।\n{yearCareer} हर {day} को कुछ समय ध्यान या प्रार्थना में बिताएं; {nak} नक्षत्र आपको भरोसेमंद अंतर्ज्ञान देता है।',
      future:'{name}, {y1} से {y5} तक के पाँच वर्ष आपके जीवन का महत्वपूर्ण अध्याय हैं। {goodYears}\n{satRet} इस समय राहु {trRahu} राशि में गोचर कर रहा है; राहु-केतु के राशि बदलने के समय अप्रत्याशित मोड़ और नए अवसर आ सकते हैं।\nआपका दशम भाव {h10} राशि में है, इसलिए आप जो बना रहे हैं वह लंबे समय तक टिकने वाला नाम और सम्मान है। धैर्य से आगे बढ़ें तो ये पाँच वर्ष आगे के जीवन की मज़बूत नींव बनेंगे।',
      love:'{name}, आपका शुक्र {venus} राशि में है — यह आपके प्रेम करने के तरीके को दर्शाता है। {moon} राशि का चंद्रमा बताता है कि आपको भावनात्मक सुरक्षा और समझने वाले साथी की ज़रूरत है।\nआपका सप्तम भाव (विवाह भाव) {h7} राशि में है। चंद्र राशि के अनुसार {good} राशि वालों से अच्छा मेल है, जबकि {caution} राशि वालों के साथ अधिक धैर्य चाहिए।\n{mangal} {marriage}',
      career:'{name}, आपका दशम भाव (कर्म भाव) {h10} राशि में है और शनि {saturn} राशि में है। यह अनुशासन और परिश्रम से निश्चित रूप से बढ़ने वाले करियर का संकेत है।\n{fields} जैसे क्षेत्र आपके स्वभाव के अनुकूल हैं। {biz}\nगुरु {jupiter} राशि में होने से बचत और दीर्घकालिक निवेश आपको लाभ देंगे; सट्टा या जोखिम भरे निवेश से बचें। महत्वपूर्ण कार्य {day} को शुरू करें।',
      health:'{name}, आपकी कुंडली में {el} तत्व प्रधान है; आयुर्वेद के अनुसार आपकी प्रकृति {dosha} की ओर झुकी है। {body}\n{practice} मानसिक शांति के लिए सोमवार को ध्यान करें — यह चंद्रमा का दिन है।\nज्योतिष केवल प्रवृत्तियां दिखाता है; किसी भी स्वास्थ्य समस्या के लिए डॉक्टर की सलाह अवश्य लें।',
      daily:'{name}, आज ({dateStr}) चंद्रमा {todayMoon} राशि में, आपकी जन्म राशि से {cb}वें भाव में गोचर कर रहा है। {dayMood} आज {focus} पर ध्यान दें और {avoid} से बचें।\n{time} का समय आपके लिए भाग्यशाली क्षण है। संबंधों में एक छोटा सा स्नेह भरा कदम बड़े शब्दों से अधिक असर करेगा। आज का शुभ अंक {luckyNum} है।',
      weekly:'{name}, इस सप्ताह गुरु आपके चंद्रमा से {jupH}वें और शनि {satH}वें भाव में हैं, इसलिए स्थिर प्रगति मुख्य विषय है। गति से अधिक निरंतरता को महत्व दें।\nइस सप्ताह का सबसे अच्छा दिन {bestDay} है — उस दिन चंद्रमा आपके लिए अनुकूल स्थिति में रहेगा। करियर और धन के महत्वपूर्ण निर्णय उसी दिन लें। {focus} पर ध्यान दें।\nआध्यात्मिक रूप से, हर सुबह कुछ मिनट मौन बैठें। {day} को दीपक जलाकर कृतज्ञता व्यक्त करें।',
      monthly:'{name}, {monthName} में सूर्य {sunTr} राशि में, आपके चंद्रमा से {sunH}वें भाव में गोचर करेगा। {sunMood} माह के मध्य में सूर्य {sunNext} राशि में प्रवेश करेगा।\nप्रेम और परिवार में ईमानदार बातचीत संबंधों को मज़बूत करेगी। करियर में, नया शुरू करने से पहले अधूरे काम पूरे करें। {practice}\nध्यान देने योग्य शुभ तिथियां: {keyDates}।',
      yearly:'{name}, {year} में गुरु {trJup} राशि में (चंद्रमा से {jupH}वां भाव) और शनि {trSat} राशि में (चंद्रमा से {satH}वां भाव) रहकर वर्ष की दिशा तय करेंगे। {sadesati}\n{yearCareer}\n{yearLove}\nआपका {nak} नक्षत्र और {ketu} राशि का केतु आपको आत्मचिंतन की ओर खींचते हैं; इस वर्ष नियमित साधना चुपचाप फल देगी।\nश्रेष्ठ महीने: {bestMonths}। सावधानी के महीने: {cautionMonths}।',
      dosdonts:'{name}, आपकी राशि के स्वामी {ruler} हैं — अनुशासन और कृतज्ञता से उनका सम्मान करें। महत्वपूर्ण कार्य {day} को शुरू करें; {gem} रत्न ज्योतिषी की सलाह से धारण कर सकते हैं।\n{practice} {avoidEl}\n{good} राशि वालों के साथ संबंधों को पोषित करें; वे आपकी प्रगति में सहायक होंगे।',
      compatibility:'{name}, आपकी {moon} चंद्र राशि से विवाह के लिए सबसे अनुकूल राशियां हैं: {good}। चंद्रमा से 5वीं और 9वीं राशि त्रिकोण सामंजस्य देती हैं, 7वीं स्वाभाविक जीवनसाथी है, और 11वीं मित्रता व लाभ लाती है।\n{caution} राशियां चंद्रमा से 6ठे और 8वें स्थान पर हैं (षडाष्टक); ऐसे मेल में अन्य गुणों का मज़बूत मिलान ज़रूरी है। {mangal}\n{marriage} पूर्ण नवांश और अष्टकूट गुण मिलान के लिए सटीक जन्म समय और साथी की कुंडली आवश्यक है।',
    },
  };

  // ── English templates (richer — uses sign bank) ──
  const T_EN = {
    past:'{name}, your Rahu–Ketu axis runs from {ketu} to {rahu}. Ketu in {ketu} shows a soul that has already walked through lifetimes of {ketuNature}; these gifts feel natural to you, almost remembered rather than learned. Rahu in {rahu} points to the unfamiliar ground this life asks you to claim: {rahuGift}.\nBorn under {nak} nakshatra with the Moon in {moon}, you arrived with {moonNature}. Childhood likely made you aware of your own pull toward {moonShadow}, and much of your early emotional life was about learning to hold that pattern gently rather than be ruled by it.\nSaturn in {saturn} was your first strict teacher. It asked you early to confront {saturnShadow}, and to earn through patience the gift of {saturnGift}. Many of the delays you felt were not punishments but the slow tempering of character.\nYour soul mission this lifetime is to carry the wisdom of {ketu} into the courage of {rahu}. With a {sun} Sun and {rise} rising, you are meant to shine through {sunGift}. When you stop repeating old comforts and step into what feels new, karma begins to turn into grace.',
    present:'{name}, as of {monthYear}, Saturn is moving through {trSat} — the {satHO} house from your {moon} Moon — and Jupiter through {trJup}, your {jupHO} house from the Moon. {sadesati} {jupNow}\nThe dominant theme right now comes from your {sun} Sun and {rise} rising: {sunNature} meeting {riseNature}. Your {el}-dominant chart moves best when it honours its own rhythm rather than copying anyone else’s pace.\nSaturn’s lesson now centres on {satTheme}. What you build here with honest, unglamorous effort stays with you for years, so resist shortcuts and trust slow progress.\nPractically, begin important things on {day}s, keep {color} close to you, and trust the intuition your {nak} nakshatra gives you. {yearCareer}',
    future:'{name}, the years {y1}–{y5} form a significant chapter in your life. {goodYears}\n{satRet}\nRahu and Ketu change signs roughly every eighteen months, and each shift redraws your priorities. Transiting Rahu is currently in {trRahu}, your {rahuHO} house from the Moon, stirring hunger and sudden openings around {rahuTheme}.\nYou are building toward a life of real standing. With {h10} on your tenth house, your lasting legacy comes through {h10Gift}, and fields like {h10Career} carry your name furthest. Stay steady, and this five-year stretch becomes the foundation for everything after.',
    love:'With Venus in {venus}, {venusLove}. This is the natural language of your heart, {name}, and the more you honour it, the more easily love finds you.\nYour Moon in {moon} shows what you need emotionally: {moonNature} that is met with understanding. Your seventh house of marriage falls in {h7}, so a partner who carries {h7Nature} tends to complete you.\nBy Vedic compatibility from your Moon, {good} natures harmonise well with yours, while {caution} call for extra patience and communication. {mangal}\n{marriage} Past relationship karma, shown by Ketu in {ketu}, asks you to release old patterns of {ketuShadow} so that love can be received freely.',
    career:'{name}, your tenth house of career falls in {h10}, and Saturn — the planet of work — sits in {saturn}. Together they point to {h10Nature} as your professional signature, and to a career that rewards {saturnGift}.\nFields that suit you naturally include {h10Career}, as well as areas linked to your {sun} Sun such as {sunCareer}.\nFor wealth, your second house falls in {h2} and your eleventh house of gains in {h11}. With Jupiter in {jupiter}, money grows best through {jupGift} and patient saving rather than risky speculation.\n{biz} Your lucky day, {day}, is ideal for important meetings, applications and new ventures.',
    health:'{name}, your chart is {el}-dominant, which in Ayurveda leans toward a {dosha} constitution. {body}\nYour {sun} Sun traditionally rules the {sunBody}, and your {rise} ascendant links to the {riseBody}; these are areas to look after with regular checkups and sensible habits.\nYour best practices are {practice}. {gem} is traditionally associated with your chart, and quiet time on {day}s strengthens your vitality.\nMentally, your {moon} Moon benefits from regular meditation, especially on Mondays, the Moon’s day. Astrology can point to tendencies, but please take any real symptom to a qualified doctor.',
    daily:'{name}, today ({dateStr}) the Moon travels through {todayMoon}, your {cbO} house from your natal Moon. {dayMood} Focus on {focus}, and avoid {avoid}.\nIn relationships, {rel}. Your luckiest moment falls in the {time}; your number for today is {luckyNum}, and {color} is your colour.',
    weekly:'{name}, this week’s theme for you is {theme}. Jupiter in your {jupHO} house from the Moon highlights {jupTheme}, while Saturn in your {satHO} house asks for discipline around {satTheme}.\nCareer energy peaks on {bestDay}, the week’s strongest day for you, when the Moon is favourably placed from your natal Moon. With money, {money}. In relationships, {rel}.\nSpiritually, spend a few minutes each morning in silence, and on {day}, your lucky day, light a lamp or simply offer gratitude. {gem} remains your supporting stone.',
    monthly:'{name}, in {monthName} the Sun moves through {sunTr}, your {sunHO} house from the Moon. {sunMood} The month’s theme is {sunTheme}.\nAround mid-month the Sun moves into {sunNext}, shifting your focus toward {nextTheme}.\nIn love and family, {rel}. At work, {work}. For health, keep up {practice}.\nKey dates to watch: {keyDates}, when the Moon is favourably placed from your natal Moon — good days for important conversations and decisions.',
    yearly:'{name}, across {year}, Jupiter in {trJup} (your {jupHO} house from the Moon) and Saturn in {trSat} (your {satHO}) set the tone. The central theme is {jupTheme}, tested and strengthened by {satTheme}.\n{sadesati} {yearCareer}\n{yearLove}\nSpiritually, your {nak} nakshatra and Ketu in {ketu} pull you toward reflection; a regular practice this year pays off quietly but deeply.\nBest months: {bestMonths}. Months to move carefully: {cautionMonths}.',
    dosdonts:'Do lean into {sunGift}, {name} — this is where your energy multiplies. Do keep {color} around you, begin important work on {day}s, and honour your ruling planet {ruler} through simple discipline and gratitude.\nDon’t let {sunShadow} run the show, and watch the {moonShadow} your {moon} Moon can bring under stress. Avoid {avoidEl}.\nNurture relationships with {good} natures; they tend to support your growth. Build your lifestyle around {practice}, and your chart’s best qualities will come forward naturally.',
    compatibility:'{name}, from your {moon} Moon, the most harmonious signs for marriage are {good}. The 5th and 9th signs from your Moon share trine harmony, the 7th is your natural complement, and the 11th brings friendship and shared gains.\nSigns to approach with care are {caution}, which fall 6th and 8th from your Moon (shadashtaka); such matches need strong agreement on other factors before marriage.\nWith Venus in {venus} and your seventh house in {h7}, you need a partner who brings {h7Nature}. {mangal}\n{marriage} For full Navamsa (D9) analysis and Ashtakoota guna matching, an exact birth time and your partner’s chart are needed, so treat this as a first guide rather than a final verdict.',
  };

  const list = (arr, lang) => !arr.length ? '—' : (lang === 'en' && arr.length > 1 ? arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1] : arr.join(', '));

  function generate(tab, cd, lang = 'en') {
    if (!T[lang] && lang !== 'en') lang = 'en';
    const c = C[lang];
    const now = new Date();
    const Y = now.getFullYear();
    const r = rng(hash(cd.name + cd.sunSign + cd.moonSign + now.toDateString() + tab));

    const moonI = idxOf(cd.moonSign), riseI = idxOf(cd.rising), sunI = idxOf(cd.sunSign);
    const P = {}; for (const k in cd.planets) P[k] = idxOf(cd.planets[k]);
    const N = i => SIGN_NAME(sgn(i), lang);
    const domEl = Object.entries(cd.elBalance).sort((a, b) => b[1] - a[1])[0][0];

    // Transits today
    const today = sky(now);
    const trSat = today.planets.Saturn.sign.id, trJup = today.planets.Jupiter.sign.id, trRahu = today.planets.Rahu.sign.id;
    const satH = house(moonI, trSat), jupH = house(moonI, trJup), rahuH = house(moonI, trRahu);
    const cb = house(moonI, today.moonSign.id);
    const CB_GOOD = [1, 3, 6, 7, 10, 11];

    // Next 7 days — best Chandrabala day
    const week = [];
    for (let i = 0; i < 7; i++) { const d = new Date(now); d.setDate(now.getDate() + i); const h = house(moonI, sky(d).moonSign.id); week.push({ d, s: CB_GOOD.includes(h) ? ([6, 11, 3].includes(h) ? 2 : 1) : 0, rnd: r() }); }
    const best = week.slice().sort((a, b) => b.s - a.s || b.rnd - a.rnd)[0];

    // Key dates this month
    const keyDates = [];
    const dim = new Date(Y, now.getMonth() + 1, 0).getDate();
    for (let dd = now.getDate(); dd <= dim && keyDates.length < 3; dd += 2) { const d = new Date(Y, now.getMonth(), dd); if ([3, 6, 11].includes(house(moonI, sky(d).moonSign.id))) keyDates.push(fmt(d, lang, { day: 'numeric', month: 'short' })); }
    if (!keyDates.length) keyDates.push(fmt(best.d, lang, { day: 'numeric', month: 'short' }));

    // Sun this month
    const sunNow = today.sunSign.id, sunH = house(moonI, sunNow);
    const sunNext = (sunNow + 1) % 12;

    // Next 12 months — best & caution
    const bestM = [], cautM = [];
    for (let m = 0; m < 12; m++) { const d = new Date(Y, now.getMonth() + m, 15); const h = house(moonI, sky(d).sunSign.id); const nm = fmt(d, lang, { month: 'short' }); if ([3, 6, 10, 11].includes(h)) bestM.push(nm); else if ([8, 12].includes(h)) cautM.push(nm); }

    // 5-year Jupiter windows
    const years = [];
    for (let y = Y; y < Y + 5; y++) { const j = sky(new Date(y, 6, 1)).planets.Jupiter.sign.id; years.push({ y, jm: house(moonI, j), jl: house(riseI, j) }); }
    const goodYears = years.filter(x => [2, 5, 7, 9, 11].includes(x.jm)).map(x => x.y);
    const marYears = years.filter(x => [1, 3, 7, 11].includes(x.jl)).map(x => x.y);

    // Saturn return
    const birthYear = Y - cd.age;
    const nextSR = birthYear + 29 >= Y - 1 ? birthYear + 29 : birthYear + 59;
    const satRet = nextSR <= Y + 5 ? fill(c.srSoon, { yr: nextSR }) : (cd.age < 29 ? fill(c.srFar, { yr: nextSR }) : c.srPast);

    // Mangal dosha & business tilt
    const marsH = house(riseI, P.Mars);
    const mangalYes = [1, 2, 4, 7, 8, 12].includes(marsH);
    const bizYes = sgn(riseI).quality === 'Cardinal' || sgn(sunI).quality === 'Cardinal' || [1, 10].includes(marsH);

    const good = [5, 9, 7, 11].map(h => N(moonI + h - 1));
    const caution = [6, 8].map(h => N(moonI + h - 1));

    const sunSign = sgn(sunI), luckyDayEn = cd.lucky.day;
    const v = {
      name: cd.name, sun: N(sunI), moon: N(moonI), rise: N(riseI), nak: cd.nakshatra,
      venus: N(P.Venus), mars: N(P.Mars), jupiter: N(P.Jupiter), saturn: N(P.Saturn), rahu: N(P.Rahu), ketu: N(P.Ketu),
      el: EL[lang][domEl], dosha: DOSHA[lang][domEl],
      gem: lang === 'en' ? cd.lucky.gem : (GEM[lang][cd.lucky.gem] || cd.lucky.gem),
      color: cd.lucky.color, day: dayName(luckyDayEn, lang), num: cd.lucky.num,
      ruler: PLANET[lang][sunSign.ruler] || sunSign.ruler,
      h7: N(riseI + 6), h10: N(riseI + 9), good: list(good, lang), caution: list(caution, lang),
      trSat: N(trSat), trJup: N(trJup), trRahu: N(trRahu), satH, jupH, marsH, cb, sunH,
      sadesati: [12, 1, 2].includes(satH) ? c.sadeYes : c.sadeNo,
      mangal: fill(mangalYes ? c.mangalYes : c.mangalNo, { marsH, mars: N(P.Mars), marsHO: ord(marsH) }),
      goodYears: goodYears.length ? fill(c.goodYears, { list: list(goodYears, lang) }) : c.goodYearsNone,
      marriage: marYears.length ? fill(c.marriage, { list: list(marYears, lang) }) : c.marriageNone,
      satRet, biz: bizYes ? c.bizYes : c.bizNo,
      y1: Y, y5: Y + 4, year: `${Y}–${Y + 1}`,
      dateStr: fmt(now, lang, { weekday: 'long', day: 'numeric', month: 'long' }),
      monthName: fmt(now, lang, { month: 'long' }), monthYear: fmt(now, lang, { month: 'long', year: 'numeric' }),
      todayMoon: N(today.moonSign.id), dayMood: CB_GOOD.includes(cb) ? c.dayGood : c.dayBad,
      focus: pick(r, c.focus), avoid: pick(r, c.avoid), time: pick(r, c.time), luckyNum: 1 + Math.floor(r() * 9),
      bestDay: fmt(best.d, lang, { weekday: 'long', day: 'numeric', month: 'short' }),
      keyDates: keyDates.join(', '), sunTr: N(sunNow), sunNext: N(sunNext),
      sunMood: [3, 6, 10, 11].includes(sunH) ? c.sunGood : c.sunBad,
      bestMonths: list(bestM, lang), cautionMonths: list(cautM, lang),
      yearCareer: [2, 5, 7, 9, 11].includes(jupH) ? c.yearCareerGood : c.yearCareerBad,
      yearLove: marYears.includes(Y) ? c.yearLoveYes : c.yearLoveNo,
    };

    if (lang === 'en') {
      const B = n => BANK[sgn(n).name];
      Object.assign(v, {
        body: EN_EL.body[domEl], practice: EN_EL.practice[domEl], avoidEl: EN_EL.avoid[domEl],
        ketuNature: B(P.Ketu).nature, ketuShadow: B(P.Ketu).shadow, rahuGift: B(P.Rahu).gift,
        moonNature: B(moonI).nature, moonShadow: B(moonI).shadow,
        saturnShadow: B(P.Saturn).shadow, saturnGift: B(P.Saturn).gift,
        sunGift: B(sunI).gift, sunNature: B(sunI).nature, sunShadow: B(sunI).shadow, sunCareer: B(sunI).career, sunBody: B(sunI).body,
        riseNature: B(riseI).nature, riseBody: B(riseI).body,
        venusLove: B(P.Venus).love, h7Nature: B(riseI + 6).nature,
        h10Nature: B(riseI + 9).nature, h10Gift: B(riseI + 9).gift, h10Career: B(riseI + 9).career,
        h2: N(riseI + 1), h11: N(riseI + 10), jupGift: B(P.Jupiter).gift,
        satHO: ord(satH), jupHO: ord(jupH), rahuHO: ord(rahuH), cbO: ord(cb), sunHO: ord(sunH),
        satTheme: HOUSE_THEME[satH], jupTheme: HOUSE_THEME[jupH], rahuTheme: HOUSE_THEME[rahuH],
        sunTheme: HOUSE_THEME[sunH], nextTheme: HOUSE_THEME[house(moonI, sunNext)],
        jupNow: [2, 5, 7, 9, 11].includes(jupH) ? `Jupiter’s position is supportive, opening doors in ${HOUSE_THEME[jupH]}.` : 'Jupiter’s current position asks for patience; its blessings arrive through learning and inner growth rather than sudden luck.',
        rel: pick(r, c.rel), money: pick(r, c.money), theme: pick(r, c.theme), work: pick(r, c.work),
      });
      return fill(T_EN[tab] || T_EN.present, v);
    }
    Object.assign(v, { body: c.body[domEl], practice: c.practice[domEl], fields: c.fields[domEl], avoidEl: c.avoidEl[domEl] });
    return fill(T[lang][tab] || T[lang].present, v);
  }

  return { generate };
})();

if (typeof window !== 'undefined') window.ReadingEngine = ReadingEngine;
if (typeof module !== 'undefined') module.exports = ReadingEngine;
