/**
 * Jyotisha → Google Sheet hook
 * Paste this in: Sheet → Extensions → Apps Script → Code.gs
 * Then: Deploy → New deployment → Web app → Execute as: Me · Who has access: Anyone
 */
const SECRET   = 'CHANGE_THIS_SECRET';            // same value as SHEET_SECRET in Vercel
const SHEET_ID = '1nhgTwc1EG37_O1rRFAb8mbM8eMsnzD93oIc0YkO7sro';
const HEAD     = ['Phone', 'Language', 'City', 'First visit (IST)', 'Last visit (IST)', 'Visits'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);                           // avoid duplicate rows if 2 people submit together
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.secret !== SECRET) return out_({ ok: false, error: 'unauthorized' });

    const phone = String(d.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phone)) return out_({ ok: false, error: 'bad phone' });

    const sh   = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEAD);
      sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#f3e9c6');
      sh.setFrozenRows(1);
    }
    const now  = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm');
    const lang = { en: 'English', kn: 'Kannada', hi: 'Hindi' }[d.lang] || 'English';
    const city = String(d.city || '').slice(0, 60);

    // Existing number → update last visit + count
    const last = sh.getLastRow();
    if (last > 1) {
      const hit = sh.getRange(2, 1, last - 1, 1).createTextFinder(phone).matchEntireCell(true).findNext();
      if (hit) {
        const r = hit.getRow();
        sh.getRange(r, 2).setValue(lang);
        if (city) sh.getRange(r, 3).setValue(city);
        sh.getRange(r, 5).setValue(now);
        sh.getRange(r, 6).setValue((Number(sh.getRange(r, 6).getValue()) || 0) + 1);
        return out_({ ok: true, updated: true });
      }
    }
    // New number → new row (leading ' keeps it as text, no 9.8E+09)
    sh.appendRow(["'" + phone, lang, city, now, now, 1]);
    return out_({ ok: true, added: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Open the web-app URL in a browser to check it is live
function doGet() { return out_({ ok: true, msg: 'Jyotisha sheet hook is live' }); }

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
