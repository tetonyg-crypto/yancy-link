/**
 * API: /api/dashboard
 * Purpose: Send pipeline dashboard summary to Telegram
 * Also checks for stalled leads and queues follow-up alerts
 * Trigger: Vercel Cron (every 4 hours) or manual GET request
 */
const { httpGet, httpPatch, sendTelegram } = require('./lib/pipeline.js');

module.exports = async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  // Fetch all pipeline leads
  let leads = [];
  try {
    const parsed = new URL(SUPABASE_URL + '/rest/v1/lead_pipeline?select=*&order=created_at.desc');
    const result = await httpGet(parsed.hostname, parsed.pathname + parsed.search, {
      'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY
    });
    leads = JSON.parse(result.body);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch leads: ' + err.message });
  }

  if (!Array.isArray(leads)) leads = [];

  const now = new Date();
  const newLeads = leads.filter(l => l.state === 'NEW');
  const contacted = leads.filter(l => l.state === 'CONTACTED' || l.state === 'QUALIFIED' || l.state === 'FUNNEL_SENT');
  const appointments = leads.filter(l => l.state === 'APPOINTMENT_SET');
  const closed = leads.filter(l => l.state === 'CLOSED');
  const lost = leads.filter(l => l.state === 'LOST');

  // Find stalled leads (no activity in 24h+ and not closed/lost)
  const stalled = leads.filter(l => {
    if (['CLOSED', 'LOST', 'NEW'].includes(l.state)) return false;
    const lastActivity = new Date(l.last_activity || l.created_at);
    const hoursSince = (now - lastActivity) / 3600000;
    return hoursSince > 24;
  });

  // Find leads needing follow-up (contacted but no response in 24h)
  const needFollowUp = leads.filter(l => {
    if (['CLOSED', 'LOST', 'APPOINTMENT_SET'].includes(l.state)) return false;
    const lastActivity = new Date(l.last_activity || l.created_at);
    const hoursSince = (now - lastActivity) / 3600000;
    return hoursSince >= 24 && hoursSince < 120; // 1-5 days
  });

  // Today's leads
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayLeads = leads.filter(l => new Date(l.created_at) >= todayStart);

  // Build dashboard message
  const timeStr = now.toLocaleString('en-US', { timeZone: 'America/Denver', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const lines = [
    '📊 <b>DASHBOARD — ' + timeStr + '</b>',
    ''
  ];

  // New leads (urgent)
  if (newLeads.length > 0) {
    lines.push('🔴 <b>NEW LEADS (' + newLeads.length + ') — REPLY NOW</b>');
    newLeads.slice(0, 5).forEach(l => {
      lines.push('   ' + l.name + ' — ' + (l.vehicle || l.lead_type) + ' [' + l.source + ']');
    });
    lines.push('');
  }

  // Follow-ups needed
  if (needFollowUp.length > 0) {
    lines.push('📬 <b>FOLLOW-UP NEEDED (' + needFollowUp.length + ')</b>');
    needFollowUp.slice(0, 5).forEach(l => {
      const hrs = Math.round((now - new Date(l.last_activity || l.created_at)) / 3600000);
      lines.push('   ' + l.name + ' — ' + hrs + 'h silent — ' + (l.vehicle || '?'));
    });
    lines.push('');
  }

  // Active
  if (contacted.length > 0) {
    lines.push('🟡 <b>ACTIVE (' + contacted.length + ')</b>');
    contacted.slice(0, 3).forEach(l => {
      lines.push('   ' + l.name + ' [' + l.state + '] — ' + (l.vehicle || l.lead_type));
    });
    lines.push('');
  }

  // Appointments
  if (appointments.length > 0) {
    lines.push('🟢 <b>APPOINTMENTS (' + appointments.length + ')</b>');
    appointments.forEach(l => {
      lines.push('   ' + l.name + ' — ' + (l.vehicle || '?'));
    });
    lines.push('');
  }

  // Stats
  lines.push('📈 <b>PIPELINE</b>');
  lines.push('   Today: ' + todayLeads.length + ' new leads');
  lines.push('   Total active: ' + (leads.length - closed.length - lost.length));
  lines.push('   Closed: ' + closed.length);
  lines.push('   Lost: ' + lost.length);
  lines.push('   Stalled: ' + stalled.length);

  // What to do
  lines.push('');
  lines.push('⚡ <b>DO NOW</b>');
  if (newLeads.length > 0) lines.push('   → Reply to ' + newLeads.length + ' new lead(s)');
  if (needFollowUp.length > 0) lines.push('   → Follow up with ' + needFollowUp.length + ' silent lead(s)');
  if (newLeads.length === 0 && needFollowUp.length === 0) lines.push('   → Pipeline clear. Post vehicles + create content.');

  const msg = lines.join('\n');
  await sendTelegram(msg);

  // Update stalled leads state in Supabase
  for (const lead of stalled) {
    if (lead.state !== 'STALLED') {
      try {
        const parsed = new URL(SUPABASE_URL + '/rest/v1/lead_pipeline?id=eq.' + lead.id);
        await httpPatch(parsed.hostname, parsed.pathname + parsed.search, {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer': 'return=minimal'
        }, { state: 'STALLED' });
      } catch {}
    }
  }

  return res.status(200).json({
    ok: true,
    summary: {
      new: newLeads.length,
      active: contacted.length,
      appointments: appointments.length,
      follow_up: needFollowUp.length,
      stalled: stalled.length,
      closed: closed.length,
      total: leads.length
    }
  });
};
