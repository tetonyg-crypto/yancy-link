const https = require('https');

function httpPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = { hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } };
    const req = https.request(opts, (res) => {
      let buf = ''; res.on('data', c => buf += c); res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, vin, year, make, model, mileage, condition, photos, source, timestamp } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;

  let smsSent = false;
  const vehicleStr = [year, make, model].filter(Boolean).join(' ') || 'your vehicle';

  // 1. Save to Supabase
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const parsed = new URL(SUPABASE_URL + '/rest/v1/trade_leads');
      await httpPost(parsed.hostname, parsed.pathname, {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      }, {
        name, phone, vin: vin || '',
        year: year || '', make: make || '', model: model || '',
        mileage: parseInt(mileage) || 0,
        condition: condition || '',
        photos: photos || [],
        source: source || 'trade-page',
        timestamp: timestamp || new Date().toISOString(),
        contacted: false
      });
    } catch (err) { console.error('Supabase error:', err.message); }
  }

  // 2. Twilio SMS auto-responder
  if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
    try {
      const digits = phone.replace(/\D/g, '');
      const smsBody = `Hey ${name}, it's Yancy — got your trade info on the ${vehicleStr}. I'll run the numbers and text you back shortly. — (307) 699-3743`;
      const authStr = Buffer.from(TWILIO_SID + ':' + TWILIO_TOKEN).toString('base64');
      const formData = `To=%2B1${digits}&From=${encodeURIComponent(TWILIO_FROM)}&Body=${encodeURIComponent(smsBody)}`;
      await httpPost('api.twilio.com', `/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + authStr
      }, formData);
      smsSent = true;
    } catch (err) { console.error('Twilio error:', err.message); }
  }

  // 3. Telegram notification
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const photoCount = (photos || []).filter(Boolean).length;
    const msg = [
      '🔄 <b>TRADE-IN LEAD</b>',
      '',
      '👤 Name: ' + name,
      '📱 Phone: ' + phone,
      '🚗 Vehicle: ' + vehicleStr + (mileage ? ' — ' + parseInt(mileage).toLocaleString() + ' miles' : ''),
      '📋 Condition: ' + (condition || 'Not specified'),
      '📷 Photos: ' + photoCount + ' uploaded',
      (vin ? '🔑 VIN: ' + vin : ''),
      '📲 SMS sent: ' + (smsSent ? '✅' : '❌'),
      '',
      '🕐 ' + new Date(timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'America/Denver' }),
    ].filter(Boolean).join('\n');

    try {
      await httpPost('api.telegram.org', '/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
        'Content-Type': 'application/json'
      }, { chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'HTML' });
    } catch (err) { console.error('Telegram error:', err.message); }
  }

  return res.status(200).json({ ok: true, sms_sent: smsSent });
};
