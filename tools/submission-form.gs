/**
 * CEA conference submission form backend (Google Apps Script).
 *
 * What it does for each submission:
 *  1. Saves the attached file to a Google Drive folder.
 *  2. Logs the submission as a row in a Google Sheet.
 *  3. Emails the committee with the abstract and the file attached.
 *  4. Emails the author a confirmation.
 *
 * It also keeps the visitor count shown in the site footer (see doGet).
 *
 * Setup: see tools/SUBMISSION-FORM-SETUP.md in this repository.
 */

var COMMITTEE = ['vaselbehagh@usf.edu', 'dting@uwindsor.ca', 'TELab@uwindsor.ca'];
var CONFERENCE = 'CEA 2027';
var FOLDER_NAME = 'CEA 2027 Submissions';
var MAX_BYTES = 10 * 1024 * 1024;

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var required = ['type', 'title', 'name', 'email', 'affiliation', 'abstract'];
    for (var i = 0; i < required.length; i++) {
      if (!d[required[i]] || String(d[required[i]]).trim() === '') throw new Error('Missing ' + required[i]);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw new Error('Bad email');

    var id = 'CEA27-' + Utilities.formatDate(new Date(), 'America/Toronto', 'MMdd-HHmmss');
    var folder = getFolder_();
    var blob = null, fileUrl = '';
    if (d.fileData) {
      var bytes = Utilities.base64Decode(d.fileData);
      if (bytes.length > MAX_BYTES) throw new Error('File too large');
      if (!/\.(pdf|docx?)$/i.test(d.fileName || '')) throw new Error('Bad file type');
      blob = Utilities.newBlob(bytes, d.fileType || 'application/octet-stream', id + ' - ' + d.fileName);
      var file = folder.createFile(blob);
      fileUrl = file.getUrl();
    }

    getSheet_(folder).appendRow([new Date(), id, d.type, d.title, d.name, d.email, d.affiliation,
      d.theme || '', d.coauthors || '', d.manuscriptId || '', d.student ? 'Yes' : 'No', d.abstract, fileUrl]);

    var rows = [
      ['Submission ID', id], ['Type', d.type], ['Title', d.title], ['Presenting author', d.name],
      ['Email', d.email], ['Affiliation', d.affiliation], ['Theme', d.theme || ''],
      ['Co-authors', d.coauthors || ''], ['Manuscript ID', d.manuscriptId || ''],
      ['Student award', d.student ? 'Yes' : 'No'], ['File', fileUrl ? fileUrl : 'None']
    ];
    var table = rows.map(function (r) {
      return '<tr><td style="padding:4px 12px 4px 0;color:#555"><b>' + esc_(r[0]) + '</b></td><td>' + esc_(r[1]) + '</td></tr>';
    }).join('');
    var html = '<table>' + table + '</table><h3>Abstract</h3><p style="white-space:pre-wrap">' + esc_(d.abstract) + '</p>';

    var opts = { htmlBody: html, replyTo: d.email, name: CONFERENCE + ' Submissions' };
    if (blob) opts.attachments = [blob];
    MailApp.sendEmail(COMMITTEE.join(','), '[' + CONFERENCE + '] ' + d.type + ': ' + d.title, 'New submission ' + id, opts);

    MailApp.sendEmail(d.email, CONFERENCE + ': we received your submission (' + id + ')', '', {
      name: CONFERENCE,
      replyTo: 'TELab@uwindsor.ca',
      htmlBody: '<p>Dear ' + esc_(d.name) + ',</p><p>Thank you for your submission to the Cleaner Earth &amp; Atmosphere Conference. ' +
        'Here is a copy for your records. Please quote your submission ID in any correspondence.</p>' + html +
        '<p>Best regards,<br>CEA Organizing Committee<br>TELab@uwindsor.ca</p>'
    });

    return json_({ ok: true, id: id });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/**
 * Visitor counter. The website calls ?counter=visitors once per new visitor
 * (with &hit=1) and without hit to just read the total.
 */
var COUNTER_START = 0;

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.counter === 'visitors') {
    var props = PropertiesService.getScriptProperties();
    var n;
    if (p.hit === '1') {
      var lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        n = Number(props.getProperty('visitors') || COUNTER_START) + 1;
        props.setProperty('visitors', String(n));
      } finally {
        lock.releaseLock();
      }
    } else {
      n = Number(props.getProperty('visitors') || COUNTER_START);
    }
    return json_({ ok: true, visitors: n });
  }
  return json_({ ok: true, service: CONFERENCE + ' submissions' });
}

function getFolder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function getSheet_(folder) {
  var name = FOLDER_NAME + ' log';
  var files = folder.getFilesByName(name);
  if (files.hasNext()) return SpreadsheetApp.open(files.next()).getSheets()[0];
  var ss = SpreadsheetApp.create(name);
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  var sh = ss.getSheets()[0];
  sh.appendRow(['Received', 'ID', 'Type', 'Title', 'Presenting author', 'Email', 'Affiliation', 'Theme',
    'Co-authors', 'Manuscript ID', 'Student award', 'Abstract', 'File']);
  sh.setFrozenRows(1);
  return sh;
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to grant Drive, Sheets and Gmail permissions. */
function authorize() {
  getSheet_(getFolder_());
  MailApp.getRemainingDailyQuota();
}
