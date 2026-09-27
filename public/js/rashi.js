/**
 * Jyotisha — Free Daily Rashi Phala (Moon-sign based Gochara)
 * Uses today's real Moon / Saturn / Jupiter transits. Languages: en, kn, hi
 */
const RashiDaily = (() => {
  const A = AstroEngine;
  const norm = x => ((x % 360) + 360) % 360;
  const moonRas = jd => Math.floor(norm(A.moonLongitude(jd) - A.ayanamsa(jd)) / 30);
  const house = (from, to) => ((to - from + 12) % 12) + 1;
  const STARS = { 1:4, 2:3, 3:5, 4:3, 5:2, 6:5, 7:4, 8:2, 9:3, 10:5, 11:5, 12:2 };

  const MOON = {
    en: ['', 'The Moon in your own sign brings emotional strength and good health — a fine day to begin things.', 'The Moon in your 2nd house calls for care with money and words; avoid unnecessary spending.', 'The Moon in your 3rd house boosts courage and effort — short trips and new attempts succeed.', 'The Moon in your 4th house turns attention to home and mother; guard against restlessness.', 'The Moon in your 5th house can bring some mental worry; think twice before big decisions.', 'The Moon in your 6th house helps you overcome obstacles and rivals — health and work improve.', 'The Moon in your 7th house favours partnership, marriage talks and pleasant company.', 'The Moon in your 8th house asks for caution — avoid risks, travel carefully and rest well.', 'The Moon in your 9th house supports prayer and the blessings of elders, though effort is still needed.', 'The Moon in your 10th house brings success at work and recognition for your efforts.', 'The Moon in your 11th house brings gains, good news and help from friends.', 'The Moon in your 12th house may raise expenses and tiredness — a good day for rest and devotion.'],
    kn: ['', 'ಚಂದ್ರ ನಿಮ್ಮ ರಾಶಿಯಲ್ಲೇ ಇರುವುದರಿಂದ ಮನಸ್ಸಿಗೆ ಬಲ ಮತ್ತು ಉತ್ತಮ ಆರೋಗ್ಯ — ಹೊಸ ಕೆಲಸ ಆರಂಭಿಸಲು ಒಳ್ಳೆಯ ದಿನ.', 'ಚಂದ್ರ 2ನೇ ಮನೆಯಲ್ಲಿ — ಹಣ ಮತ್ತು ಮಾತಿನಲ್ಲಿ ಎಚ್ಚರ ಇರಲಿ; ಅನಗತ್ಯ ಖರ್ಚು ಬೇಡ.', 'ಚಂದ್ರ 3ನೇ ಮನೆಯಲ್ಲಿ — ಧೈರ್ಯ ಮತ್ತು ಪ್ರಯತ್ನಕ್ಕೆ ಫಲ; ಸಣ್ಣ ಪ್ರಯಾಣ ಮತ್ತು ಹೊಸ ಪ್ರಯತ್ನಗಳು ಯಶಸ್ವಿ.', 'ಚಂದ್ರ 4ನೇ ಮನೆಯಲ್ಲಿ — ಮನೆ ಮತ್ತು ತಾಯಿಯ ಕಡೆ ಗಮನ; ಮನಸ್ಸಿನ ಚಂಚಲತೆಯ ಬಗ್ಗೆ ಎಚ್ಚರ.', 'ಚಂದ್ರ 5ನೇ ಮನೆಯಲ್ಲಿ — ಸ್ವಲ್ಪ ಮಾನಸಿಕ ಚಿಂತೆ ಇರಬಹುದು; ದೊಡ್ಡ ನಿರ್ಧಾರಗಳ ಮೊದಲು ಯೋಚಿಸಿ.', 'ಚಂದ್ರ 6ನೇ ಮನೆಯಲ್ಲಿ — ಅಡೆತಡೆ ಮತ್ತು ಶತ್ರುಗಳ ಮೇಲೆ ಜಯ; ಆರೋಗ್ಯ ಮತ್ತು ಕೆಲಸದಲ್ಲಿ ಸುಧಾರಣೆ.', 'ಚಂದ್ರ 7ನೇ ಮನೆಯಲ್ಲಿ — ಪಾಲುದಾರಿಕೆ, ವಿವಾಹ ಮಾತುಕತೆ ಮತ್ತು ಸಂತೋಷದ ಸಹವಾಸಕ್ಕೆ ಅನುಕೂಲ.', 'ಚಂದ್ರ 8ನೇ ಮನೆಯಲ್ಲಿ — ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ; ಅಪಾಯ ತಪ್ಪಿಸಿ, ಪ್ರಯಾಣದಲ್ಲಿ ಜಾಗ್ರತೆ, ಸರಿಯಾದ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.', 'ಚಂದ್ರ 9ನೇ ಮನೆಯಲ್ಲಿ — ಪ್ರಾರ್ಥನೆ ಮತ್ತು ಹಿರಿಯರ ಆಶೀರ್ವಾದಕ್ಕೆ ಒಳ್ಳೆಯ ದಿನ, ಆದರೆ ಪ್ರಯತ್ನ ಅಗತ್ಯ.', 'ಚಂದ್ರ 10ನೇ ಮನೆಯಲ್ಲಿ — ಕೆಲಸದಲ್ಲಿ ಯಶಸ್ಸು ಮತ್ತು ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ಮನ್ನಣೆ.', 'ಚಂದ್ರ 11ನೇ ಮನೆಯಲ್ಲಿ — ಲಾಭ, ಶುಭ ಸುದ್ದಿ ಮತ್ತು ಸ್ನೇಹಿತರಿಂದ ಸಹಾಯ.', 'ಚಂದ್ರ 12ನೇ ಮನೆಯಲ್ಲಿ — ಖರ್ಚು ಮತ್ತು ಆಯಾಸ ಹೆಚ್ಚಾಗಬಹುದು; ವಿಶ್ರಾಂತಿ ಮತ್ತು ಭಕ್ತಿಗೆ ಉತ್ತಮ ದಿನ.'],
    hi: ['', 'चंद्रमा आपकी ही राशि में है — मन को बल और अच्छा स्वास्थ्य; नया काम शुरू करने के लिए अच्छा दिन।', 'चंद्रमा दूसरे भाव में — धन और वाणी में सावधानी रखें; अनावश्यक खर्च से बचें।', 'चंद्रमा तीसरे भाव में — साहस और प्रयास का फल मिलेगा; छोटी यात्राएं और नए प्रयास सफल।', 'चंद्रमा चौथे भाव में — घर और माता की ओर ध्यान; मन की बेचैनी से सावधान।', 'चंद्रमा पाँचवें भाव में — थोड़ी मानसिक चिंता हो सकती है; बड़े निर्णय से पहले सोचें।', 'चंद्रमा छठे भाव में — बाधाओं और विरोधियों पर विजय; स्वास्थ्य और काम में सुधार।', 'चंद्रमा सातवें भाव में — साझेदारी, विवाह की बातचीत और सुखद संगति के लिए अनुकूल।', 'चंद्रमा आठवें भाव में — सावधानी ज़रूरी; जोखिम से बचें, यात्रा में सतर्क रहें और आराम करें।', 'चंद्रमा नौवें भाव में — प्रार्थना और बड़ों के आशीर्वाद के लिए अच्छा दिन, पर प्रयास ज़रूरी।', 'चंद्रमा दसवें भाव में — काम में सफलता और आपके परिश्रम को मान्यता।', 'चंद्रमा ग्यारहवें भाव में — लाभ, शुभ समाचार और मित्रों से सहायता।', 'चंद्रमा बारहवें भाव में — खर्च और थकान बढ़ सकती है; आराम और भक्ति के लिए अच्छा दिन।'],
  };
  // Weekday: [colour, deity]
  const DAY = {
    en: [['Orange','Surya'],['White','Lord Shiva'],['Red','Hanuman / Subramanya'],['Green','Ganesha'],['Yellow','Guru · Sri Raghavendra'],['Pink','Goddess Lakshmi'],['Blue','Lord Venkateshwara / Shani']],
    kn: [['ಕೇಸರಿ','ಸೂರ್ಯ ದೇವ'],['ಬಿಳಿ','ಶಿವ'],['ಕೆಂಪು','ಹನುಮಂತ / ಸುಬ್ರಹ್ಮಣ್ಯ'],['ಹಸಿರು','ಗಣೇಶ'],['ಹಳದಿ','ಗುರು · ಶ್ರೀ ರಾಘವೇಂದ್ರ'],['ಗುಲಾಬಿ','ಲಕ್ಷ್ಮೀ ದೇವಿ'],['ನೀಲಿ','ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ / ಶನಿ']],
    hi: [['केसरिया','सूर्य देव'],['सफ़ेद','भगवान शिव'],['लाल','हनुमान'],['हरा','गणेश'],['पीला','गुरु · बृहस्पति'],['गुलाबी','माँ लक्ष्मी'],['नीला','शनि देव / हनुमान']],
  };
  const POOL = {
    en: { focus: ['starting new work','time with family','financial planning','health and exercise','learning something new','reconnecting with friends'], avoid: ['hasty decisions','unnecessary arguments','big purchases','lending money','cutting corners on sleep'], time: ['Morning','Afternoon','Evening'] },
    kn: { focus: ['ಹೊಸ ಕೆಲಸದ ಆರಂಭ','ಕುಟುಂಬದೊಂದಿಗಿನ ಸಮಯ','ಹಣಕಾಸು ಯೋಜನೆ','ಆರೋಗ್ಯ ಮತ್ತು ವ್ಯಾಯಾಮ','ಹೊಸ ವಿಷಯದ ಕಲಿಕೆ','ಸ್ನೇಹಿತರ ಸಂಪರ್ಕ'], avoid: ['ಆತುರದ ನಿರ್ಧಾರ','ಅನಗತ್ಯ ವಾದ','ದೊಡ್ಡ ಖರ್ಚು','ಹಣ ಸಾಲ ಕೊಡುವುದು','ನಿದ್ರೆ ಕಡಿಮೆ ಮಾಡುವುದು'], time: ['ಬೆಳಿಗ್ಗೆ','ಮಧ್ಯಾಹ್ನ','ಸಂಜೆ'] },
    hi: { focus: ['नए काम की शुरुआत','परिवार के साथ समय','आर्थिक योजना','स्वास्थ्य और व्यायाम','कुछ नया सीखना','मित्रों से संपर्क'], avoid: ['जल्दबाज़ी के निर्णय','बेवजह की बहस','बड़े खर्च','उधार देना','नींद कम करना'], time: ['सुबह','दोपहर','शाम'] },
  };
  const L10N = {
    en: { focus: 'Focus on', avoid: 'Avoid', color: 'Lucky colour', num: 'Lucky number', time: 'Lucky time', pray: 'Pray to', sade: '🪐 Sade Sati is running for your rashi — stay patient, disciplined and keep Saturday prayers.', jupG: '✨ Jupiter is supporting you this year — good for growth and new opportunities.', jupB: '🌱 Jupiter asks for steady effort this year; progress comes step by step.', moves: (s, t) => `Moon moves into ${s} at ${t}` },
    kn: { focus: 'ಗಮನ ಕೊಡಿ', avoid: 'ತಪ್ಪಿಸಿ', color: 'ಅದೃಷ್ಟ ಬಣ್ಣ', num: 'ಅದೃಷ್ಟ ಸಂಖ್ಯೆ', time: 'ಶುಭ ಸಮಯ', pray: 'ಪ್ರಾರ್ಥಿಸಿ', sade: '🪐 ನಿಮ್ಮ ರಾಶಿಗೆ ಸಾಡೇ ಸಾತಿ ನಡೆಯುತ್ತಿದೆ — ತಾಳ್ಮೆ, ಶಿಸ್ತು ಇರಲಿ; ಶನಿವಾರ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.', jupG: '✨ ಈ ವರ್ಷ ಗುರು ನಿಮಗೆ ಬೆಂಬಲ ನೀಡುತ್ತಾನೆ — ಬೆಳವಣಿಗೆ ಮತ್ತು ಹೊಸ ಅವಕಾಶಗಳಿಗೆ ಒಳ್ಳೆಯದು.', jupB: '🌱 ಈ ವರ್ಷ ಗುರು ನಿರಂತರ ಪ್ರಯತ್ನ ಕೇಳುತ್ತಾನೆ; ಪ್ರಗತಿ ಹಂತ ಹಂತವಾಗಿ ಬರುತ್ತದೆ.', moves: (s, t) => `${t} ಕ್ಕೆ ಚಂದ್ರ ${s} ರಾಶಿಗೆ ಪ್ರವೇಶ` },
    hi: { focus: 'ध्यान दें', avoid: 'बचें', color: 'शुभ रंग', num: 'शुभ अंक', time: 'शुभ समय', pray: 'पूजा करें', sade: '🪐 आपकी राशि पर साढ़े साती चल रही है — धैर्य और अनुशासन रखें; शनिवार को पूजा करें।', jupG: '✨ इस वर्ष गुरु आपका साथ दे रहे हैं — विकास और नए अवसरों के लिए अच्छा।', jupB: '🌱 इस वर्ष गुरु निरंतर प्रयास चाहते हैं; प्रगति धीरे-धीरे आएगी।', moves: (s, t) => `${t} पर चंद्रमा ${s} राशि में` },
  };

  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  // y,m,d = date; rise = sunrise JD (from Panchanga); returns data for all 12 rashis
  function forDate(rashi, y, m, d, rise, nextRise, lang = 'en') {
    const L = MOON[lang] ? lang : 'en';
    const mr = moonRas(rise);
    const h = house(rashi, mr);
    const sky = A.compute({ year: y, month: m, day: d, hour: 12, minute: 0 });
    const satH = house(rashi, sky.planets.Saturn.sign.id), jupH = house(rashi, sky.planets.Jupiter.sign.id);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const seed = hash(`${y}-${m}-${d}-${rashi}`);
    const P = POOL[L];
    // moon sign change during the day?
    let change = null;
    for (let t = rise + 1 / 24; t < nextRise; t += 1 / 24) if (moonRas(t) !== mr) {
      let a = t - 1 / 24, b = t;
      for (let k = 0; k < 16; k++) { const c = (a + b) / 2; if (moonRas(c) === mr) a = c; else b = c; }
      change = { jd: b, sign: (mr + 1) % 12 }; break;
    }
    return {
      rashi, moonSign: mr, house: h, stars: STARS[h],
      text: MOON[L][h],
      focus: P.focus[seed % P.focus.length], avoid: P.avoid[(seed >> 4) % P.avoid.length],
      time: P.time[(seed >> 8) % 3], num: 1 + ((seed >> 12) % 9),
      color: DAY[L][wd][0], deity: DAY[L][wd][1],
      sadeSati: [12, 1, 2].includes(satH), jupGood: [2, 5, 7, 9, 11].includes(jupH),
      change, t: L10N[L],
    };
  }
  return { forDate };
})();

if (typeof window !== 'undefined') window.RashiDaily = RashiDaily;
if (typeof module !== 'undefined') module.exports = RashiDaily;
