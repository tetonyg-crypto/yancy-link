const { httpPost, insertPipelineLead, sendSMS, sendTelegram } = require('./lib/pipeline.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, monthly_payment, down_payment, credit_range, estimated_min, estimated_max, source, timestamp } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const minStr = '$' + (estimated_min || 0).toLocaleString();
  const maxStr = '$' + (estimated_max || 0).toLocaleString();

  // 1. Save to buying_power_leads table
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const parsed = new URL(SUPABASE_URL + '/rest/v1/buying_power_leads');
      await httpPost(parsed.hostname, parsed.pathname, {
        'Content-Type': 'application/json', 'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'return=minimal'
      }, { name, phone, monthly_payment: parseInt(monthly_payment) || 0, down_payment: down_payment || '',
        credit_range: credit_range || '', estimated_min: parseInt(estimated_min) || 0,
        estimated_max: parseInt(estimated_max) || 0, source: source || 'buying-power',
        timestamp: timestamp || new Date().toISOString(), contacted: false });
    } catch (err) { console.error('Supabase buying-power error:', err.message); }
  }

  // 2. SMS auto-responder
  const smsSent = await sendSMS(phone,
    `Hey ${name}, Yancy here — based on your numbers you're looking at the ${minStr}-${maxStr} range. Let me pull some options that fit. — (307) 699-3743`
  );

  // 3. Insert into lead_pipeline
  await insertPipelineLead({
    name, phone, source: source || 'buying-power', vehicle: '',
    lead_type: 'buying_power', score: 65, priority: 'HIGH',
    details: { monthly_payment, down_payment, credit_range, estimated_min, estimated_max },
    sms_sent: smsSent
  });

  // 4. Telegram
  await sendTelegram([
    '💰 <b>BUYING POWER LEAD</b>',
    '', '👤 ' + name, '📱 ' + phone,
    '💵 $' + (monthly_payment || 0) + '/mo',
    '💰 Down: ' + (down_payment || '?'),
    '📊 Credit: ' + (credit_range || '?'),
    '🎯 Range: ' + minStr + ' — ' + maxStr,
    '📲 SMS: ' + (smsSent ? '✅' : '❌'),
    '🕐 ' + new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })
  ].join('\n'));

  return res.status(200).json({ ok: true, sms_sent: smsSent, estimated_min, estimated_max });
};
