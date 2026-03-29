/**
 * Shared helper: write lead to lead_pipeline table in Supabase
 * + send Telegram dashboard notification
 * Used by all 3 lead endpoints (lead.js, trade-lead.js, buying-power-lead.js)
 */
const https = require('https');

function httpPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const isForm = typeof body === 'string';
    const data = isForm ? body : JSON.stringify(body);
    const opts = { hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } };
    const req = https.request(opts, (res) => {
      let buf = ''; res.on('data', c => buf += c); res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpGet(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method: 'GET', headers };
    const req = https.request(opts, (res) => {
      let buf = ''; res.on('data', c => buf += c); res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Insert lead into lead_pipeline table
 */
async function insertPipelineLead(lead) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  try {
    const parsed = new URL(SUPABASE_URL + '/rest/v1/lead_pipeline');
    const result = await httpPost(parsed.hostname, parsed.pathname, {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': 'return=representation'
    }, {
      name: lead.name || '',
      phone: lead.phone || '',
      source: lead.source || 'direct',
      vehicle: lead.vehicle || '',
      lead_type: lead.lead_type || 'general',
      state: 'NEW',
      score: lead.score || 50,
      priority: lead.priority || 'MEDIUM',
      details: lead.details || {},
      sms_sent: lead.sms_sent || false,
      notes: '',
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });
    return result;
  } catch (err) {
    console.error('Pipeline insert error:', err.message);
    return null;
  }
}

/**
 * Send Twilio SMS — returns true/false
 */
async function sendSMS(phone, body) {
  const SID = process.env.TWILIO_ACCOUNT_SID;
  const TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_FROM_NUMBER;
  if (!SID || !TOKEN || !FROM) return false;

  try {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return false;
    const authStr = Buffer.from(SID + ':' + TOKEN).toString('base64');
    const formData = `To=%2B1${digits}&From=${encodeURIComponent(FROM)}&Body=${encodeURIComponent(body)}`;
    await httpPost('api.twilio.com', `/2010-04-01/Accounts/${SID}/Messages.json`, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authStr
    }, formData);
    return true;
  } catch (err) {
    console.error('Twilio error:', err.message);
    return false;
  }
}

/**
 * Send Telegram notification
 */
async function sendTelegram(text) {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT) return false;

  try {
    await httpPost('api.telegram.org', '/bot' + TOKEN + '/sendMessage', {
      'Content-Type': 'application/json'
    }, { chat_id: CHAT, text, parse_mode: 'HTML' });
    return true;
  } catch (err) {
    console.error('Telegram error:', err.message);
    return false;
  }
}

/**
 * Get pipeline stats from Supabase
 */
async function getPipelineStats() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  try {
    const parsed = new URL(SUPABASE_URL + '/rest/v1/lead_pipeline?select=*&order=created_at.desc');
    const result = await httpGet(parsed.hostname, parsed.pathname + parsed.search, {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    });
    return JSON.parse(result.body);
  } catch (err) {
    console.error('Pipeline stats error:', err.message);
    return [];
  }
}

module.exports = { httpPost, httpGet, insertPipelineLead, sendSMS, sendTelegram, getPipelineStats };
