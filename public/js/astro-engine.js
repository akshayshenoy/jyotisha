/**
 * Jyotisha Astrology Engine v2
 * Vedic + Western blend — accurate calculations
 */

const AstroEngine = (() => {

  // ── Signs ──────────────────────────────────────────────────
  const SIGNS = [
    { id:0,  name:'Aries',       kn:'ಮೇಷ',      hi:'मेष',      te:'మేషం',     ta:'மேஷம்',    glyph:'♈', el:'Fire',  quality:'Cardinal', ruler:'Mars',    lucky:{color:'Red',gem:'Red Coral',rudraksha:'3 Mukhi',day:'Tuesday',num:9} },
    { id:1,  name:'Taurus',      kn:'ವೃಷಭ',     hi:'वृषभ',     te:'వృషభం',    ta:'ரிஷபம்',   glyph:'♉', el:'Earth', quality:'Fixed',    ruler:'Venus',   lucky:{color:'Green',gem:'Diamond',rudraksha:'6 Mukhi',day:'Friday',num:6} },
    { id:2,  name:'Gemini',      kn:'ಮಿಥುನ',   hi:'मिथुन',    te:'మిథునం',   ta:'மிதுனம்',  glyph:'♊', el:'Air',   quality:'Mutable',  ruler:'Mercury', lucky:{color:'Yellow',gem:'Emerald',rudraksha:'4 Mukhi',day:'Wednesday',num:5} },
    { id:3,  name:'Cancer',      kn:'ಕರ್ಕ',     hi:'कर्क',     te:'కర్కాటకం', ta:'கடகம்',    glyph:'♋', el:'Water', quality:'Cardinal', ruler:'Moon',    lucky:{color:'Silver',gem:'Pearl',rudraksha:'2 Mukhi',day:'Monday',num:2} },
    { id:4,  name:'Leo',         kn:'ಸಿಂಹ',    hi:'सिंह',     te:'సింహం',    ta:'சிம்மம்',  glyph:'♌', el:'Fire',  quality:'Fixed',    ruler:'Sun',     lucky:{color:'Gold',gem:'Ruby',rudraksha:'1 Mukhi',day:'Sunday',num:1} },
    { id:5,  name:'Virgo',       kn:'ಕನ್ಯಾ',   hi:'कन्या',    te:'కన్యా',    ta:'கன்னி',    glyph:'♍', el:'Earth', quality:'Mutable',  ruler:'Mercury', lucky:{color:'Navy Blue',gem:'Emerald',rudraksha:'4 Mukhi',day:'Wednesday',num:5} },
    { id:6,  name:'Libra',       kn:'ತುಲಾ',    hi:'तुला',     te:'తుల',      ta:'துலாம்',   glyph:'♎', el:'Air',   quality:'Cardinal', ruler:'Venus',   lucky:{color:'Pink',gem:'Diamond',rudraksha:'6 Mukhi',day:'Friday',num:6} },
    { id:7,  name:'Scorpio',     kn:'ವೃಶ್ಚಿಕ', hi:'वृश्चिक',  te:'వృశ్చికం', ta:'விருச்சிகம்',glyph:'♏', el:'Water', quality:'Fixed',    ruler:'Mars',    lucky:{color:'Dark Red',gem:'Red Coral',rudraksha:'3 Mukhi',day:'Tuesday',num:9} },
    { id:8,  name:'Sagittarius', kn:'ಧನು',     hi:'धनु',      te:'ధనుస్సు',  ta:'தனுசு',    glyph:'♐', el:'Fire',  quality:'Mutable',  ruler:'Jupiter', lucky:{color:'Purple',gem:'Yellow Sapphire',rudraksha:'5 Mukhi',day:'Thursday',num:3} },
    { id:9,  name:'Capricorn',   kn:'ಮಕರ',     hi:'मकर',      te:'మకరం',     ta:'மகரம்',    glyph:'♑', el:'Earth', quality:'Cardinal', ruler:'Saturn',  lucky:{color:'Black',gem:'Blue Sapphire',rudraksha:'7 Mukhi',day:'Saturday',num:8} },
    { id:10, name:'Aquarius',    kn:'ಕುಂಭ',    hi:'कुंभ',     te:'కుంభం',    ta:'கும்பம்',  glyph:'♒', el:'Air',   quality:'Fixed',    ruler:'Saturn',  lucky:{color:'Electric Blue',gem:'Blue Sapphire',rudraksha:'7 Mukhi',day:'Saturday',num:8} },
    { id:11, name:'Pisces',      kn:'ಮೀನ',     hi:'मीन',      te:'మీనం',     ta:'மீனம்',    glyph:'♓', el:'Water', quality:'Mutable',  ruler:'Jupiter', lucky:{color:'Sea Green',gem:'Yellow Sapphire',rudraksha:'5 Mukhi',day:'Thursday',num:3} },
  ];

  // ── Nakshatras (27 lunar mansions) ─────────────────────────
  const NAKSHATRAS = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
    'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
    'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
    'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
    'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
  ];

  // ── Julian Day ──────────────────────────────────────────────
  function toJD(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }

  // ── Sun longitude (ecliptic, accurate to ~1°) ───────────────
  function sunLongitude(jd) {
    // Meeus low-precision (~0.01°), apparent longitude
    const T = (jd - 2451545.0) / 36525, R = Math.PI / 180;
    const L0 = 280.46646 + 36000.76983 * T;
    const M  = (357.52911 + 35999.05029 * T) * R;
    const C  = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    const om = (125.04 - 1934.136 * T) * R;
    const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(om);
    return ((lambda % 360) + 360) % 360;
  }

  // ── Moon longitude (Meeus main terms, ~0.05°) ──────────────
  const MOON_TERMS = [ // [D, M, M', F, coef]
    [0,0,1,0,6.288774],[2,0,-1,0,1.274027],[2,0,0,0,0.658314],[0,0,2,0,0.213618],
    [0,1,0,0,-0.185116],[0,0,0,2,-0.114332],[2,0,-2,0,0.058793],[2,-1,-1,0,0.057066],
    [2,0,1,0,0.053322],[2,-1,0,0,0.045758],[0,1,-1,0,-0.040923],[1,0,0,0,-0.034720],
    [0,1,1,0,-0.030383],[2,0,0,-2,0.015327],[0,0,1,2,-0.012528],[0,0,1,-2,0.010980],
    [4,0,-1,0,0.010675],[0,0,3,0,0.010034],[4,0,-2,0,0.008548],[2,1,-1,0,-0.007888],
    [2,1,0,0,-0.006766],[1,0,-1,0,-0.005163],[1,1,0,0,0.004987],[2,-1,1,0,0.004036],
    [2,0,2,0,0.003994],[4,0,0,0,0.003861],[2,0,-3,0,0.003665],[0,1,-2,0,-0.002689],
  ];
  function moonLongitude(jd) {
    const T = (jd - 2451545.0) / 36525, R = Math.PI / 180;
    const Lp = 218.3164477 + 481267.88123421 * T;
    const D  = 297.8501921 + 445267.1114034 * T;
    const M  = 357.5291092 + 35999.0502909 * T;
    const Mp = 134.9633964 + 477198.8675055 * T;
    const F  = 93.2720950 + 483202.0175233 * T;
    const E  = 1 - 0.002516 * T;
    let sum = 0;
    for (const [d, m, mp, f, c] of MOON_TERMS) {
      const e = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
      sum += c * e * Math.sin((d * D + m * M + mp * Mp + f * F) * R);
    }
    const om = (125.04 - 1934.136 * T) * R;
    const lambda = Lp + sum - 0.00478 * Math.sin(om); // nutation (approx)
    return ((lambda % 360) + 360) % 360;
  }

  // ── Ascendant (rising sign, needs lat/lon + time) ──────────
  function ascendant(jd, lat, lon) {
    const n   = jd - 2451545.0;
    const lst = ((280.46061837 + 360.98564736629 * n + lon) % 360 + 360) % 360;
    const eps = (23.439 - 0.0000004 * n) * Math.PI / 180;
    const lstR = lst * Math.PI / 180;
    const latR = lat * Math.PI / 180;
    // FIX: GMST constant was 100.46 (wrong epoch) and atan2 args gave the Descendant
    const y = Math.cos(lstR);
    const x = -(Math.sin(lstR) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps));
    let asc = Math.atan2(y, x) * 180 / Math.PI;
    if (asc < 0) asc += 360;
    return asc;
  }

  // ── Planet geocentric longitudes (Keplerian approx, ~1-3°) ──
  // FIX: old version returned heliocentric mean longitudes (Mercury/Venus/Mars badly wrong)
  const ORB = {
    Earth:   { L0:100.464, L1:0.9856091, a:1.000, e:0.0167, peri:102.94 },
    Mercury: { L0:252.251, L1:4.0923344, a:0.387, e:0.2056, peri: 77.46 },
    Venus:   { L0:181.980, L1:1.6021302, a:0.723, e:0.0068, peri:131.56 },
    Mars:    { L0:355.433, L1:0.5240208, a:1.524, e:0.0934, peri:336.06 },
    Jupiter: { L0: 34.351, L1:0.0830853, a:5.203, e:0.0484, peri: 14.33 },
    Saturn:  { L0: 50.077, L1:0.0334442, a:9.537, e:0.0542, peri: 93.06 },
  };
  function helio(p, n) {
    const R = Math.PI / 180;
    const L = p.L0 + p.L1 * n;
    const M = (L - p.peri) * R;
    const v = L + (2 * p.e * Math.sin(M) + 1.25 * p.e * p.e * Math.sin(2 * M)) / R;
    const r = p.a * (1 - p.e * p.e) / (1 + p.e * Math.cos((v - p.peri) * R));
    return { x: r * Math.cos(v * R), y: r * Math.sin(v * R) };
  }
  function planetLongitudes(jd) {
    const n = jd - 2451545.0;
    const E = helio(ORB.Earth, n);
    const result = {};
    for (const name of ['Mercury','Venus','Mars','Jupiter','Saturn']) {
      const P = helio(ORB[name], n);
      const lon = Math.atan2(P.y - E.y, P.x - E.x) * 180 / Math.PI;
      result[name] = (lon + 360) % 360;
    }
    result.Rahu = ((125.045 - 0.0529538 * n) % 360 + 360) % 360; // mean node
    result.Ketu = (result.Rahu + 180) % 360;
    return result;
  }

  // ── Vedic correction (Ayanamsa — Lahiri) ───────────────────
  function ayanamsa(jd) {
    const T = (jd - 2451545.0) / 36525;
    return 23.85306 + 1.396971 * T + 0.000308 * T * T; // Lahiri (Chitrapaksha)
  }

  // ── Degrees → sign index ────────────────────────────────────
  function degToSign(deg) { return Math.floor(((deg % 360) + 360) % 360 / 30); }

  // ── Nakshatra from moon longitude ──────────────────────────
  function getNakshatra(moonLon) {
    const idx = Math.floor(moonLon / (360 / 27));
    return NAKSHATRAS[idx % 27];
  }

  // ── Traits per sign ────────────────────────────────────────
  const TRAITS = {
    Aries:['Bold','Passionate','Leader','Impulsive'],
    Taurus:['Reliable','Sensual','Patient','Stubborn'],
    Gemini:['Curious','Witty','Adaptable','Restless'],
    Cancer:['Nurturing','Intuitive','Protective','Moody'],
    Leo:['Generous','Confident','Loyal','Dramatic'],
    Virgo:['Analytical','Meticulous','Helpful','Modest'],
    Libra:['Diplomatic','Charming','Fair','Indecisive'],
    Scorpio:['Intense','Magnetic','Determined','Secretive'],
    Sagittarius:['Adventurous','Optimistic','Free','Blunt'],
    Capricorn:['Ambitious','Disciplined','Practical','Reserved'],
    Aquarius:['Independent','Visionary','Humanitarian','Eccentric'],
    Pisces:['Empathetic','Dreamy','Compassionate','Intuitive'],
  };

  // ── Main compute ────────────────────────────────────────────
  function compute({ year, month, day, hour, minute, lat = 12.97, lon = 77.59, tz = 5.5 }) {
    // FIX: birth time is local (IST) → convert to UT before Julian Day
    const jd  = toJD(year, month, day) + (hour + minute / 60 - tz) / 24;
    const aya = ayanamsa(jd);

    const sunLon  = sunLongitude(jd);
    const moonLon = moonLongitude(jd);
    const ascLon  = ascendant(jd, lat, lon);
    const pLons   = planetLongitudes(jd);

    // Vedic (sidereal) — subtract ayanamsa
    const sunV  = ((sunLon  - aya + 360) % 360);
    const moonV = ((moonLon - aya + 360) % 360);
    const ascV  = ((ascLon  - aya + 360) % 360);

    const sunSign  = SIGNS[degToSign(sunV)];
    const moonSign = SIGNS[degToSign(moonV)];
    const rising   = SIGNS[degToSign(ascV)];
    const nakshatra = getNakshatra(moonV);

    const planets = {};
    const planetNames = ['Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu'];
    for (const p of planetNames) {
      const vLon = ((pLons[p] - aya + 360) % 360);
      planets[p] = { sign: SIGNS[degToSign(vLon)], lon: vLon.toFixed(1) };
    }

    // Element balance
    const elBalance = { Fire:0, Earth:0, Water:0, Air:0 };
    [sunSign, moonSign, rising].forEach(s => elBalance[s.el]++);

    // Lucky info from sun sign
    const lucky = {
      ...sunSign.lucky,
      nakshatra,
      luckyNum: sunSign.lucky.num,
    };

    return { sunSign, moonSign, rising, nakshatra, planets, elBalance, lucky, jd };
  }

  // ── Public ──────────────────────────────────────────────────
  return { compute, SIGNS, NAKSHATRAS, TRAITS, toJD, sunLongitude, moonLongitude, ayanamsa };
})();

if (typeof window !== 'undefined') window.AstroEngine = AstroEngine;
