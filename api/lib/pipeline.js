/**
 * Shared pipeline lib — used by all lead endpoints
 * Handles: Supabase write, Telegram alerts (with suggested replies),
 *          Twilio SMS, email backup CC
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

function httpPatch(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = { hostname, path, method: 'PATCH', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } };
    const req = https.request(opts, (res) => {
      let buf = ''; res.on('data', c => buf += c); res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ─── Supabase: insert into lead_pipeline ───
async function insertPipelineLead(lead) {
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_KEY;
  if (!URL || !KEY) { return { status: 0, body: 'MISSING: URL=' + (URL ? 'set' : 'empty') + ' KEY=' + (KEY ? KEY.substring(0,10) + '...' : 'empty') }; }
  try {
    const parsed = new URL(URL + '/rest/v1/lead_pipeline');
    const result = await httpPost(parsed.hostname, parsed.pathname, {
      'Content-Type': 'application/json', 'apikey': KEY,
      'Authorization': 'Bearer ' + KEY, 'Prefer': 'return=minimal'
    }, {
      name: lead.name || '', phone: lead.phone || '',
      source: lead.source || 'direct', vehicle: lead.vehicle || '',
      lead_type: lead.lead_type || 'general', state: 'NEW',
      score: lead.score || 50, priority: lead.priority || 'MEDIUM',
      details: lead.details || {}, sms_sent: lead.sms_sent || false,
      notes: '', created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });
    if (result.status >= 300) {
      console.error('Pipeline insert failed:', result.status, result.body);
    }
    return result;
  } catch (err) { console.error('Pipeline insert error:', err.message); return { status: 0, body: err.message }; }
}

// ─── SMS via MacBook Relay (sends from your real iPhone number) ───
async function sendSMS(phone, body) {
  const RELAY_URL = process.env.MACBOOK_SMS_URL;
  const RELAY_SECRET = process.env.SMS_RELAY_SECRET || 'yancy-sms-2026';
  if (!RELAY_URL) return false;

  try {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return false;
    const parsed = new URL(RELAY_URL + '/send');
    const result = await httpPost(parsed.hostname, parsed.pathname, {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + RELAY_SECRET
    }, { phone: digits, message: body });
    const data = JSON.parse(result.body);
    return data.ok === true;
  } catch (err) {
    console.error('SMS relay error:', err.message);
    return false;
  }
}

// ─── Telegram ───
async function sendTelegram(text) {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT) return false;
  try {
    await httpPost('api.telegram.org', '/bot' + TOKEN + '/sendMessage', {
      'Content-Type': 'application/json'
    }, { chat_id: CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true });
    return true;
  } catch (err) { console.error('Telegram error:', err.message); return false; }
}

// ─── Smart Telegram Alert (with suggested reply + funnel link) ───
function buildSmartAlert(lead) {
  const name = lead.name || 'Unknown';
  const phone = lead.phone || '';
  const digits = phone.replace(/\D/g, '');
  const type = lead.lead_type || 'general';
  const vehicle = lead.vehicle || '';
  const source = (lead.source || 'direct').toUpperCase();
  const time = new Date().toLocaleString('en-US', { timeZone: 'America/Denver', hour: 'numeric', minute: '2-digit' });

  // Icon by type
  const icons = { general: '🚨', trade: '🔄', buying_power: '💰' };
  const labels = { general: 'NEW LEAD', trade: 'TRADE-IN LEAD', buying_power: 'BUYING POWER LEAD' };

  // Build suggested reply based on lead type
  let suggestedReply, funnelAction;

  if (type === 'trade') {
    const details = lead.details || {};
    const veh = [details.year, details.make, details.model].filter(Boolean).join(' ');
    suggestedReply = `Hey ${name}, it's Yancy — got your trade info on the ${veh || 'vehicle'}. I'll run the numbers and text you back within the hour.`;
    funnelAction = 'Review trade details → text them a real number';
  } else if (type === 'buying_power') {
    const details = lead.details || {};
    const min = '$' + (details.estimated_min || 0).toLocaleString();
    const max = '$' + (details.estimated_max || 0).toLocaleString();
    suggestedReply = `Hey ${name}, Yancy here — you're in the ${min}-${max} range. I've got a few things that fit. Want me to send pics?`;
    funnelAction = 'Pull 3 vehicles in their range → text options';
  } else {
    const need = (lead.details || {}).need || '';
    if (need === 'trade') {
      suggestedReply = `Hey ${name}, it's Yancy. For your trade value, run this real quick — takes 60 seconds: yancygarcia.com/trade`;
      funnelAction = '→ Send trade funnel';
    } else if (need === 'financing') {
      suggestedReply = `Hey ${name}, Yancy here. Let me see what you can work with — no credit pull: yancygarcia.com/buying-power`;
      funnelAction = '→ Send buying power funnel';
    } else if (need === 'vehicle') {
      suggestedReply = `Hey ${name}, it's Yancy from Stone's. What kind of vehicle are you looking for? Truck, SUV, sedan? And what's your budget range?`;
      funnelAction = '→ Qualify: vehicle type + budget';
    } else {
      suggestedReply = `Hey ${name}, it's Yancy from Stone's Auto Group — got your info. What are you looking for?`;
      funnelAction = '→ Qualify: what do they need?';
    }
  }

  // Build the alert
  const lines = [
    (icons[type] || '🚨') + ' <b>' + (labels[type] || 'NEW LEAD') + '</b> — ' + source,
    ''
  ];

  // Lead info
  lines.push('👤 <b>' + name + '</b>');
  lines.push('📱 ' + phone);
  if (vehicle) lines.push('🚗 ' + vehicle);

  // Type-specific details
  if (type === 'trade') {
    const d = lead.details || {};
    if (d.condition) lines.push('📋 Condition: ' + d.condition);
    if (d.mileage) lines.push('📏 ' + parseInt(d.mileage).toLocaleString() + ' miles');
    if (d.photo_count) lines.push('📷 ' + d.photo_count + ' photos');
  } else if (type === 'buying_power') {
    const d = lead.details || {};
    if (d.monthly_payment) lines.push('💵 $' + d.monthly_payment + '/mo');
    if (d.down_payment) lines.push('💰 Down: ' + d.down_payment);
    if (d.credit_range) lines.push('📊 Credit: ' + d.credit_range);
    if (d.estimated_min) lines.push('🎯 Range: $' + d.estimated_min.toLocaleString() + '–$' + (d.estimated_max || 0).toLocaleString());
  } else {
    const need = (lead.details || {}).need;
    if (need) lines.push('🔍 Need: ' + need);
  }

  lines.push('📲 SMS auto-reply: ' + (lead.sms_sent ? '✅' : '❌'));
  lines.push('🕐 ' + time);

  // Suggested reply (the money section)
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━');
  lines.push('📋 <b>COPY-PASTE REPLY:</b>');
  lines.push('<code>' + suggestedReply + '</code>');
  lines.push('');
  lines.push('⚡ <b>NEXT:</b> ' + funnelAction);

  // Tap to text link
  const smsBody = encodeURIComponent(suggestedReply);
  lines.push('');
  lines.push('📲 <a href="sms:' + digits + '?body=' + smsBody + '">TAP TO TEXT ' + name.split(' ')[0].toUpperCase() + '</a>');

  return lines.join('\n');
}

// ─── Email backup CC ───
async function sendEmailBackup(lead) {
  // Uses Supabase Edge Function or simple SMTP relay
  // For now, we'll use a Telegram-formatted backup that includes all data
  // The email CC is a nice-to-have — Telegram is the primary
  // This can be wired to SendGrid/Resend later if needed
  return true;
}

// ─── Get pipeline stats ───
async function getPipelineStats() {
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_KEY;
  if (!URL || !KEY) return [];
  try {
    const parsed = new URL(URL + '/rest/v1/lead_pipeline?select=*&order=created_at.desc');
    const result = await httpGet(parsed.hostname, parsed.pathname + parsed.search, {
      'apikey': KEY, 'Authorization': 'Bearer ' + KEY
    });
    return JSON.parse(result.body);
  } catch (err) { console.error('Pipeline stats error:', err.message); return []; }
}

module.exports = { httpPost, httpGet, httpPatch, insertPipelineLead, sendSMS, sendTelegram, buildSmartAlert, getPipelineStats };
