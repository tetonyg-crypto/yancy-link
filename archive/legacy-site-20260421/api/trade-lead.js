const { httpPost, insertPipelineLead, sendSMS, sendTelegram, buildSmartAlert } = require('./lib/pipeline.js');

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
  const vehicleStr = [year, make, model].filter(Boolean).join(' ') || 'your vehicle';

  // 1. Save to trade_leads table
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const parsed = new URL(SUPABASE_URL + '/rest/v1/trade_leads');
      await httpPost(parsed.hostname, parsed.pathname, {
        'Content-Type': 'application/json', 'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'return=minimal'
      }, { name, phone, vin: vin || '', year: year || '', make: make || '', model: model || '',
        mileage: parseInt(mileage) || 0, condition: condition || '', photos: photos || [],
        source: source || 'trade-page', timestamp: timestamp || new Date().toISOString(), contacted: false });
    } catch (err) { console.error('Supabase error:', err.message); }
  }

  // 2. SMS
  const smsSent = await sendSMS(phone,
    `Hey ${name}, it's Yancy — got your trade info on the ${vehicleStr}. I'll run the numbers and text you back shortly. — (307) 699-3743`
  );

  // 3. Pipeline insert
  const leadData = {
    name, phone, source: source || 'trade-page', vehicle: vehicleStr,
    lead_type: 'trade', score: 70, priority: 'HIGH',
    details: { vin, year, make, model, mileage: parseInt(mileage) || 0, condition, photo_count: (photos || []).filter(Boolean).length },
    sms_sent: smsSent
  };
  await insertPipelineLead(leadData);

  // 4. Smart Telegram alert
  await sendTelegram(buildSmartAlert(leadData));

  return res.status(200).json({ ok: true, sms_sent: smsSent });
};
