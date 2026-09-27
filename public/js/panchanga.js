/**
 * Jyotisha Panchanga Engine
 * Amanta (Karnataka) system · Lahiri ayanamsa · values at local sunrise
 * Languages: en, kn, hi
 */
const Panchanga = (() => {
  const A = AstroEngine;
  const norm = x => ((x % 360) + 360) % 360;
  const sid  = (lon, jd) => norm(lon - A.ayanamsa(jd));
  const elong   = jd => norm(A.moonLongitude(jd) - A.sunLongitude(jd));
  const tithiF  = jd => elong(jd) / 12;
  const karanaF = jd => elong(jd) / 6;
  const nakF    = jd => sid(A.moonLongitude(jd), jd) / (360 / 27);
  const yogaF   = jd => norm(sid(A.sunLongitude(jd), jd) + sid(A.moonLongitude(jd), jd)) / (360 / 27);
  const sunRasF = jd => sid(A.sunLongitude(jd), jd) / 30;
  const moonRasF= jd => sid(A.moonLongitude(jd), jd) / 30;

  // ── Names ─────────────────────────────────────────────────
  const N = {
    tithi: {
      en:['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Amavasya'],
      kn:['ಪಾಡ್ಯ','ಬಿದಿಗೆ','ತದಿಗೆ','ಚೌತಿ','ಪಂಚಮಿ','ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ','ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಹುಣ್ಣಿಮೆ','ಅಮಾವಾಸ್ಯೆ'],
      hi:['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा','अमावस्या'],
    },
    paksha: { en:['Shukla','Krishna'], kn:['ಶುಕ್ಲ','ಕೃಷ್ಣ'], hi:['शुक्ल','कृष्ण'] },
    nak: {
      en:['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'],
      kn:['ಅಶ್ವಿನಿ','ಭರಣಿ','ಕೃತ್ತಿಕಾ','ರೋಹಿಣಿ','ಮೃಗಶಿರ','ಆರ್ದ್ರಾ','ಪುನರ್ವಸು','ಪುಷ್ಯ','ಆಶ್ಲೇಷ','ಮಘ','ಪೂರ್ವಾ ಫಲ್ಗುಣಿ','ಉತ್ತರಾ ಫಲ್ಗುಣಿ','ಹಸ್ತ','ಚಿತ್ರಾ','ಸ್ವಾತಿ','ವಿಶಾಖ','ಅನುರಾಧ','ಜ್ಯೇಷ್ಠ','ಮೂಲ','ಪೂರ್ವಾಷಾಢ','ಉತ್ತರಾಷಾಢ','ಶ್ರವಣ','ಧನಿಷ್ಠ','ಶತಭಿಷ','ಪೂರ್ವಾಭಾದ್ರ','ಉತ್ತರಾಭಾದ್ರ','ರೇವತಿ'],
      hi:['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्वा फाल्गुनी','उत्तरा फाल्गुनी','हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढ़ा','उत्तराषाढ़ा','श्रवण','धनिष्ठा','शतभिषा','पूर्वा भाद्रपद','उत्तरा भाद्रपद','रेवती'],
    },
    yoga: {
      en:['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'],
      kn:['ವಿಷ್ಕಂಭ','ಪ್ರೀತಿ','ಆಯುಷ್ಮಾನ್','ಸೌಭಾಗ್ಯ','ಶೋಭನ','ಅತಿಗಂಡ','ಸುಕರ್ಮ','ಧೃತಿ','ಶೂಲ','ಗಂಡ','ವೃದ್ಧಿ','ಧ್ರುವ','ವ್ಯಾಘಾತ','ಹರ್ಷಣ','ವಜ್ರ','ಸಿದ್ಧಿ','ವ್ಯತೀಪಾತ','ವರೀಯಾನ್','ಪರಿಘ','ಶಿವ','ಸಿದ್ಧ','ಸಾಧ್ಯ','ಶುಭ','ಶುಕ್ಲ','ಬ್ರಹ್ಮ','ಐಂದ್ರ','ವೈಧೃತಿ'],
      hi:['विष्कुम्भ','प्रीति','आयुष्मान','सौभाग्य','शोभन','अतिगण्ड','सुकर्मा','धृति','शूल','गण्ड','वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धि','व्यतीपात','वरीयान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म','इन्द्र','वैधृति'],
    },
    karana: {
      en:['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti (Bhadra)','Shakuni','Chatushpada','Naga','Kimstughna'],
      kn:['ಬವ','ಬಾಲವ','ಕೌಲವ','ತೈತಿಲ','ಗರಜ','ವಣಿಜ','ವಿಷ್ಟಿ (ಭದ್ರಾ)','ಶಕುನಿ','ಚತುಷ್ಪಾದ','ನಾಗ','ಕಿಂಸ್ತುಘ್ನ'],
      hi:['बव','बालव','कौलव','तैतिल','गर','वणिज','विष्टि (भद्रा)','शकुनि','चतुष्पद','नाग','किंस्तुघ्न'],
    },
    masa: {
      en:['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashwayuja','Kartika','Margashira','Pushya','Magha','Phalguna'],
      kn:['ಚೈತ್ರ','ವೈಶಾಖ','ಜ್ಯೇಷ್ಠ','ಆಷಾಢ','ಶ್ರಾವಣ','ಭಾದ್ರಪದ','ಆಶ್ವಯುಜ','ಕಾರ್ತಿಕ','ಮಾರ್ಗಶಿರ','ಪುಷ್ಯ','ಮಾಘ','ಫಾಲ್ಗುಣ'],
      hi:['चैत्र','वैशाख','ज्येष्ठ','आषाढ़','श्रावण','भाद्रपद','आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'],
    },
    adhika: { en:'Adhika ', kn:'ಅಧಿಕ ', hi:'अधिक ' },
    samv: {
      en:['Prabhava','Vibhava','Shukla','Pramoda','Prajapati','Angirasa','Shrimukha','Bhava','Yuva','Dhatu','Ishvara','Bahudhanya','Pramathi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadhari','Virodhi','Vikriti','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari','Sharvari','Plava','Shubhakrit','Shobhakrit','Krodhi','Vishvavasu','Parabhava','Plavanga','Kilaka','Saumya','Sadharana','Virodhikrit','Paridhavi','Pramadi','Ananda','Rakshasa','Nala','Pingala','Kalayukti','Siddharthi','Raudri','Durmati','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya'],
      kn:['ಪ್ರಭವ','ವಿಭವ','ಶುಕ್ಲ','ಪ್ರಮೋದೂತ','ಪ್ರಜೋತ್ಪತ್ತಿ','ಆಂಗೀರಸ','ಶ್ರೀಮುಖ','ಭಾವ','ಯುವ','ಧಾತು','ಈಶ್ವರ','ಬಹುಧಾನ್ಯ','ಪ್ರಮಾಥಿ','ವಿಕ್ರಮ','ವೃಷ','ಚಿತ್ರಭಾನು','ಸ್ವಭಾನು','ತಾರಣ','ಪಾರ್ಥಿವ','ವ್ಯಯ','ಸರ್ವಜಿತ್','ಸರ್ವಧಾರಿ','ವಿರೋಧಿ','ವಿಕೃತಿ','ಖರ','ನಂದನ','ವಿಜಯ','ಜಯ','ಮನ್ಮಥ','ದುರ್ಮುಖಿ','ಹೇವಿಳಂಬಿ','ವಿಳಂಬಿ','ವಿಕಾರಿ','ಶಾರ್ವರಿ','ಪ್ಲವ','ಶುಭಕೃತ್','ಶೋಭಕೃತ್','ಕ್ರೋಧಿ','ವಿಶ್ವಾವಸು','ಪರಾಭವ','ಪ್ಲವಂಗ','ಕೀಲಕ','ಸೌಮ್ಯ','ಸಾಧಾರಣ','ವಿರೋಧಿಕೃತ್','ಪರಿಧಾವಿ','ಪ್ರಮಾದೀಚ','ಆನಂದ','ರಾಕ್ಷಸ','ನಳ','ಪಿಂಗಳ','ಕಾಳಯುಕ್ತಿ','ಸಿದ್ಧಾರ್ಥಿ','ರೌದ್ರಿ','ದುರ್ಮತಿ','ದುಂದುಭಿ','ರುಧಿರೋದ್ಗಾರಿ','ರಕ್ತಾಕ್ಷಿ','ಕ್ರೋಧನ','ಅಕ್ಷಯ'],
      hi:['प्रभव','विभव','शुक्ल','प्रमोद','प्रजापति','अंगिरा','श्रीमुख','भाव','युवा','धाता','ईश्वर','बहुधान्य','प्रमाथी','विक्रम','वृष','चित्रभानु','सुभानु','तारण','पार्थिव','व्यय','सर्वजित','सर्वधारी','विरोधी','विकृति','खर','नंदन','विजय','जय','मन्मथ','दुर्मुख','हेमलंबी','विलंबी','विकारी','शार्वरी','प्लव','शुभकृत','शोभकृत','क्रोधी','विश्वावसु','पराभव','प्लवंग','कीलक','सौम्य','साधारण','विरोधकृत','परिधावी','प्रमादी','आनंद','राक्षस','नल','पिंगल','कालयुक्त','सिद्धार्थी','रौद्र','दुर्मति','दुंदुभि','रुधिरोद्गारी','रक्ताक्षी','क्रोधन','अक्षय'],
    },
    ritu: { en:['Vasanta','Grishma','Varsha','Sharad','Hemanta','Shishira'], kn:['ವಸಂತ','ಗ್ರೀಷ್ಮ','ವರ್ಷ','ಶರದ್','ಹೇಮಂತ','ಶಿಶಿರ'], hi:['वसंत','ग्रीष्म','वर्षा','शरद','हेमंत','शिशिर'] },
    ayana: { en:['Uttarayana','Dakshinayana'], kn:['ಉತ್ತರಾಯಣ','ದಕ್ಷಿಣಾಯನ'], hi:['उत्तरायण','दक्षिणायन'] },
  };

  // Festivals: key = masaIdx-paksha(0 S /1 K)-tithiNum(1..15; 15 = Purnima/Amavasya)
  const FEST = {
    '0-0-1':  { en:'Ugadi (New Year)', kn:'ಯುಗಾದಿ (ಹೊಸ ವರ್ಷ)', hi:'उगादि / गुड़ी पड़वा' },
    '0-0-9':  { k:'madhyahna', en:'Sri Rama Navami', kn:'ಶ್ರೀ ರಾಮ ನವಮಿ', hi:'श्री राम नवमी' },
    '1-0-3':  { en:'Akshaya Tritiya', kn:'ಅಕ್ಷಯ ತೃತೀಯ', hi:'अक्षय तृतीया' },
    '3-0-15': { en:'Guru Purnima', kn:'ಗುರು ಪೂರ್ಣಿಮೆ', hi:'गुरु पूर्णिमा' },
    '4-0-5':  { en:'Naga Panchami', kn:'ನಾಗರ ಪಂಚಮಿ', hi:'नाग पंचमी' },
    '4-0-15': { en:'Raksha Bandhan', kn:'ರಕ್ಷಾ ಬಂಧನ', hi:'रक्षा बंधन' },
    '4-1-8':  { k:'nishita', en:'Sri Krishna Janmashtami', kn:'ಶ್ರೀ ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ', hi:'श्री कृष्ण जन्माष्टमी' },
    '5-0-3':  { en:'Swarna Gowri Vrata', kn:'ಸ್ವರ್ಣ ಗೌರಿ ವ್ರತ', hi:'हरतालिका तीज' },
    '5-0-4':  { k:'madhyahna', en:'Ganesha Chaturthi', kn:'ಗಣೇಶ ಚತುರ್ಥಿ', hi:'गणेश चतुर्थी' },
    '5-0-14': { en:'Ananta Chaturdashi', kn:'ಅನಂತ ಚತುರ್ದಶಿ', hi:'अनंत चतुर्दशी' },
    '5-1-15': { k:'aparahna', en:'Mahalaya Amavasya', kn:'ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ', hi:'महालय अमावस्या' },
    '6-0-1':  { en:'Navaratri begins', kn:'ನವರಾತ್ರಿ ಆರಂಭ', hi:'नवरात्रि आरंभ' },
    '6-0-9':  { en:'Maha Navami · Ayudha Puja', kn:'ಮಹಾನವಮಿ · ಆಯುಧ ಪೂಜೆ', hi:'महानवमी' },
    '6-0-10': { k:'aparahna', en:'Vijayadashami (Dasara)', kn:'ವಿಜಯದಶಮಿ (ದಸರಾ)', hi:'विजयादशमी (दशहरा)' },
    '6-1-14': { en:'Naraka Chaturdashi', kn:'ನರಕ ಚತುರ್ದಶಿ', hi:'नरक चतुर्दशी' },
    '6-1-15': { k:'pradosha', en:'Deepavali · Lakshmi Puja', kn:'ದೀಪಾವಳಿ · ಲಕ್ಷ್ಮೀ ಪೂಜೆ', hi:'दीपावली · लक्ष्मी पूजा' },
    '7-0-1':  { en:'Bali Padyami', kn:'ಬಲಿ ಪಾಡ್ಯಮಿ', hi:'गोवर्धन पूजा' },
    '7-0-15': { en:'Kartika Purnima', kn:'ಕಾರ್ತಿಕ ಹುಣ್ಣಿಮೆ', hi:'कार्तिक पूर्णिमा' },
    '8-0-6':  { en:'Subramanya Shashthi', kn:'ಸುಬ್ರಹ್ಮಣ್ಯ ಷಷ್ಠಿ', hi:'स्कंद षष्ठी' },
    '8-0-11': { en:'Gita Jayanti', kn:'ಗೀತಾ ಜಯಂತಿ', hi:'गीता जयंती' },
    '10-0-5': { en:'Vasanta Panchami', kn:'ವಸಂತ ಪಂಚಮಿ', hi:'वसंत पंचमी' },
    '10-0-7': { en:'Ratha Saptami', kn:'ರಥ ಸಪ್ತಮಿ', hi:'रथ सप्तमी' },
    '10-1-14':{ k:'nishita', en:'Maha Shivaratri', kn:'ಮಹಾ ಶಿವರಾತ್ರಿ', hi:'महाशिवरात्रि' },
    '11-0-15':{ k:'pradosha', en:'Holi', kn:'ಹೋಳಿ ಹುಣ್ಣಿಮೆ', hi:'होली (होलिका दहन)' },
  };
  const VRATA = {
    ekadashi:  { en:'Ekadashi Vrata', kn:'ಏಕಾದಶಿ ವ್ರತ', hi:'एकादशी व्रत' },
    pradosha:  { en:'Pradosha', kn:'ಪ್ರದೋಷ', hi:'प्रदोष व्रत' },
    sankashti: { en:'Sankashti Chaturthi', kn:'ಸಂಕಷ್ಟ ಚತುರ್ಥಿ', hi:'संकष्टी चतुर्थी' },
    shivaratri:{ en:'Masa Shivaratri', kn:'ಮಾಸ ಶಿವರಾತ್ರಿ', hi:'मासिक शिवरात्रि' },
    purnima:   { en:'Purnima', kn:'ಹುಣ್ಣಿಮೆ', hi:'पूर्णिमा' },
    amavasya:  { en:'Amavasya', kn:'ಅಮಾವಾಸ್ಯೆ', hi:'अमावस्या' },
    sankranti: { en:'Sankranti', kn:'ಸಂಕ್ರಾಂತಿ', hi:'संक्रांति' },
    makara:    { en:'Makara Sankranti', kn:'ಮಕರ ಸಂಕ್ರಾಂತಿ', hi:'मकर संक्रांति' },
  };

  // ── Helpers ───────────────────────────────────────────────
  function sunRiseSet(y, m, d, lat, lon) {
    const R = Math.PI / 180;
    const n = Math.round(A.toJD(y, m, d) + 0.5 - 2451545.0);
    const Js = n - lon / 360;
    const M = norm(357.5291 + 0.98560028 * Js);
    const C = 1.9148 * Math.sin(M * R) + 0.02 * Math.sin(2 * M * R) + 0.0003 * Math.sin(3 * M * R);
    const L = norm(M + C + 180 + 102.9372);
    const Jt = 2451545.0 + Js + 0.0053 * Math.sin(M * R) - 0.0069 * Math.sin(2 * L * R);
    const sinD = Math.sin(L * R) * Math.sin(23.4397 * R);
    const cosD = Math.cos(Math.asin(sinD));
    const cosW = (Math.sin(-0.833 * R) - Math.sin(lat * R) * sinD) / (Math.cos(lat * R) * cosD);
    const w = Math.acos(Math.max(-1, Math.min(1, cosW))) / R;
    return { rise: Jt - w / 360, set: Jt + w / 360, noon: Jt };
  }
  function nextChange(fn, jd0) {
    const i0 = Math.floor(fn(jd0));
    let a = jd0, b = jd0 + 1 / 24;
    for (let k = 0; k < 40 && Math.floor(fn(b)) === i0; k++) { a = b; b += 1 / 24; }
    for (let k = 0; k < 18; k++) { const m = (a + b) / 2; if (Math.floor(fn(m)) === i0) a = m; else b = m; }
    return b;
  }
  function newMoonNear(jd) {
    for (let i = 0; i < 8; i++) { let e = elong(jd); if (e > 180) e -= 360; jd -= e / 12.1907; }
    return jd;
  }
  function masaAt(jd) {
    const prev = newMoonNear(jd - elong(jd) / 12.1907);
    const next = newMoonNear(prev + 29.53);
    const s1 = Math.floor(sunRasF(prev)), s2 = Math.floor(sunRasF(next));
    return { idx: (s1 + 1) % 12, adhika: s1 === s2 };
  }
  const tithiInfo = t => ({ paksha: t < 15 ? 0 : 1, num: (t % 15) + 1 }); // num 1..15
  const tithiName = (t, L) => { const { paksha, num } = tithiInfo(t); return num === 15 ? N.tithi[L][paksha === 0 ? 14 : 15] : N.tithi[L][num - 1]; };
  const karanaIdx = k => k === 0 ? 10 : k <= 56 ? (k - 1) % 7 : 7 + (k - 57);
  const weekday = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  // Each observance is checked at its traditional time (kala) of the day
  function kalaTimes(rise, set, nextRise) {
    const day = set - rise, night = nextRise - set;
    return { sunrise: rise, madhyahna: rise + day * 0.5, aparahna: rise + day * 0.7,
             pradosha: set + night / 15, moonrise: set + night * 0.25, nishita: set + night * 0.5, nishitaStart: set + night * 0.5 - 24 / 1440 };
  }
  function festivals(rise, set, nextRise, sankrantiTo) {
    const K = kalaTimes(rise, set, nextRise), memo = {};
    const at = k => memo[k] || (memo[k] = (() => { const t = Math.floor(tithiF(K[k])); return { t, ...tithiInfo(t), masa: masaAt(K[k]) }; })());
    // sunrise rule + kshaya: tithi that starts after sunrise and ends before next sunrise also belongs to today
    const tr = at('sunrise'), tEnd = nextChange(tithiF, rise);
    const kshaya = tEnd < nextRise && nextChange(tithiF, tEnd + 1 / 1440) < nextRise ? (tr.t + 1) % 30 : null;
    const has = (k, paksha, num, masaIdx) => {
      const chk = x => x.paksha === paksha && x.num === num && (masaIdx == null || (x.masa.idx === masaIdx && !x.masa.adhika));
      if (chk(at(k))) return true;
      if (k === 'nishita' && chk(at('nishitaStart'))) return true; // 48-min Nishita window
      if (k === 'sunrise' && kshaya !== null) { const x = { ...tithiInfo(kshaya), masa: masaAt(tEnd + 1 / 1440) }; return chk(x); }
      return false;
    };
    const out = [];
    for (const [key, f] of Object.entries(FEST)) {
      const [mi, pk, nm] = key.split('-').map(Number);
      if (has(f.k || 'sunrise', pk, nm, mi)) out.push({ ...f, major: true });
    }
    const any = (k, pk, nm) => has(k, pk, nm, null);
    if (any('sunrise', 0, 11) || any('sunrise', 1, 11)) out.push(VRATA.ekadashi);
    if (any('pradosha', 0, 13) || any('pradosha', 1, 13)) out.push(VRATA.pradosha);
    if (any('moonrise', 1, 4)) out.push(VRATA.sankashti);
    if (any('nishita', 1, 14) && !out.some(o => o.en === 'Maha Shivaratri')) out.push(VRATA.shivaratri);
    if (!out.some(o => o.major)) { if (any('sunrise', 0, 15)) out.push(VRATA.purnima); else if (any('sunrise', 1, 15)) out.push(VRATA.amavasya); }
    if (sankrantiTo !== null) out.push(sankrantiTo === 9 ? { ...VRATA.makara, major: true } : { ...VRATA.sankranti, sign: sankrantiTo });
    return out;
  }

  // A tithi can cover the same kala on two days — observe on the first day only
  function prevDayFest(y, m, d, lat, lon) {
    const pd = new Date(Date.UTC(y, m - 1, d - 1));
    const a = sunRiseSet(pd.getUTCFullYear(), pd.getUTCMonth() + 1, pd.getUTCDate(), lat, lon);
    const b = sunRiseSet(y, m, d, lat, lon);
    return festivals(a.rise, a.set, b.rise, null);
  }
  const dedupe = (list, prev) => list.filter(f => !(f.major && f.k && prev.some(p => p.en === f.en)));

  // ── Main ──────────────────────────────────────────────────
  function compute(y, m, d, lat = 12.97, lon = 77.59) {
    const st = sunRiseSet(y, m, d, lat, lon);
    const nd = new Date(Date.UTC(y, m - 1, d + 1));
    const stN = sunRiseSet(nd.getUTCFullYear(), nd.getUTCMonth() + 1, nd.getUTCDate(), lat, lon);
    const rise = st.rise, set = st.set, day = set - rise;

    const t = Math.floor(tithiF(rise)), tEnd = nextChange(tithiF, rise);
    const nk = Math.floor(nakF(rise)), nkEnd = nextChange(nakF, rise);
    const pada = Math.floor((nakF(rise) % 1) * 4) + 1;
    const yg = Math.floor(yogaF(rise)), ygEnd = nextChange(yogaF, rise);
    const kr = Math.floor(karanaF(rise)), krEnd = nextChange(karanaF, rise);
    const masa = masaAt(rise);
    const shaka = (m <= 4 && masa.idx >= 8) ? y - 79 : y - 78;
    const sunRas = Math.floor(sunRasF(rise)), sunRasNext = Math.floor(sunRasF(stN.rise));
    const moonRas = Math.floor(moonRasF(rise)), moonRasEnd = nextChange(moonRasF, rise);
    const wd = weekday(y, m, d);

    const seg = k => [rise + (k - 1) * day / 8, rise + k * day / 8];
    const RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], GULI = [7, 6, 5, 4, 3, 2, 1];
    const muhurta = day / 15, noon = (rise + set) / 2, MIN = 1 / 1440;

    return {
      date: { y, m, d, wd },
      sunrise: rise, sunset: set, nextSunrise: stN.rise,
      samvatsara: (shaka + 11) % 60, shaka, vikram: shaka + 135,
      ayana: [9, 10, 11, 0, 1, 2].includes(sunRas) ? 0 : 1,
      ritu: Math.floor(masa.idx / 2), masa,
      tithi: { idx: t, end: tEnd, next: (t + 1) % 30, ...tithiInfo(t) },
      nakshatra: { idx: nk, end: nkEnd, next: (nk + 1) % 27, pada },
      yoga: { idx: yg, end: ygEnd, next: (yg + 1) % 27 },
      karana: { idx: karanaIdx(kr), end: krEnd, next: karanaIdx((kr + 1) % 60) },
      sunRasi: sunRas, moonRasi: { idx: moonRas, end: moonRasEnd, next: (moonRas + 1) % 12 },
      rahu: seg(RAHU[wd]), yama: seg(YAMA[wd]), gulika: seg(GULI[wd]),
      brahma: [rise - 96 * MIN, rise - 48 * MIN],
      abhijit: [noon - muhurta / 2, noon + muhurta / 2],
      abhijitWed: wd === 3, // Wednesday: overlaps Durmuhurta (8th muhurta)
      godhuli: [set - 12 * MIN, set + 12 * MIN],
      pradosha: tithiInfo(t).num === 13 ? [set, set + 3 * (stN.rise - set) / 15] : null, // 3 night muhurtas
      festivals: dedupe(festivals(rise, set, stN.rise, sunRasNext !== sunRas ? sunRasNext : null), prevDayFest(y, m, d, lat, lon)),
    };
  }

  // Lightweight scan for upcoming festivals / vratas
  function upcoming(y, m, d, lat, lon, days = 60, limit = 14) {
    const out = []; let prevRaw = prevDayFest(y, m, d + 1, lat, lon); // = selected day
    for (let i = 1; i <= days && out.length < limit; i++) {
      const dt = new Date(Date.UTC(y, m - 1, d + i));
      const Y = dt.getUTCFullYear(), M = dt.getUTCMonth() + 1, D = dt.getUTCDate();
      const st = sunRiseSet(Y, M, D, lat, lon), stN = sunRiseSet(Y, M, D + 1, lat, lon);
      const s1 = Math.floor(sunRasF(st.rise)), s2 = Math.floor(sunRasF(stN.rise));
      const raw = festivals(st.rise, st.set, stN.rise, s1 !== s2 ? s2 : null);
      const f = dedupe(raw, prevRaw); prevRaw = raw;
      if (f.length) out.push({ y: Y, m: M, d: D, list: f });
    }
    return out;
  }

  return { compute, upcoming, N };
})();

if (typeof window !== 'undefined') window.Panchanga = Panchanga;
if (typeof module !== 'undefined') module.exports = Panchanga;
