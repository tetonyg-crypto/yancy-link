const { httpPost, insertPipelineLead, sendSMS, sendTelegram } = require('./lib/pipeline.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, need, details, source, timestamp } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  // 1. Save to original leads table
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const parsed = new URL(SUPABASE_URL + '/rest/v1/leads');
      await httpPost(parsed.hostname, parsed.pathname, {
        'Content-Type': 'application/json', 'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'return=minimal'
      }, { name, phone, need: need || 'Not specified', details: details || '',
        source: source || 'direct', created_at: timestamp || new Date().toISOString(),
        contacted: false, notes: '' });
    } catch (err) { console.error('Supabase leads error:', err.message); }
  }

  // 2. Insert into lead_pipeline (the engine)
  const smsSent = await sendSMS(phone,
    `Hey ${name}, it's Yancy from Stone's Auto Group — got your info. What are you looking for? — (307) 699-3743`
  );

  await insertPipelineLead({
    name, phone, source: source || 'landing', vehicle: '',
    lead_type: 'general', score: 60, priority: 'MEDIUM',
    details: { need: need || '', details: details || '' },
    sms_sent: smsSent
  });

  // 3. Telegram notification
  const time = new Date(timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'America/Denver' });
  await sendTelegram([
    '🚨 <b>NEW LEAD</b> — ' + (source || 'direct').toUpperCase(),
    '', '👤 ' + name, '📱 ' + phone,
    '🚗 ' + (need || 'Not specified'),
    '📲 SMS: ' + (smsSent ? '✅' : '❌'),
    '🕐 ' + time
  ].join('\n'));

  return res.status(200).json({ ok: true, sms_sent: smsSent });
};
