const https = require('https');

function supabaseInsert(url, key, lead) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(lead);
        const parsed = new URL(url + '/rest/v1/leads');
        const opts = {
            hostname: parsed.hostname,
            path: parsed.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Prefer': 'return=minimal',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function sendTelegram(token, chatId, text) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' });
        const opts = {
            hostname: 'api.telegram.org',
            path: '/bot' + token + '/sendMessage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, phone, need, details, source, timestamp } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone required' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // 1. Save to Supabase
    if (SUPABASE_URL && SUPABASE_KEY) {
        try {
            await supabaseInsert(SUPABASE_URL, SUPABASE_KEY, {
                name,
                phone,
                need: need || 'Not specified',
                details: details || '',
                source: source || 'direct',
                timestamp: timestamp || new Date().toISOString(),
                contacted: false,
                notes: ''
            });
        } catch (err) {
            console.error('Supabase error:', err.message);
        }
    }

    // 2. Send Telegram notification
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const srcLabel = (source || 'direct').toUpperCase();
        const smsBody = encodeURIComponent(
            'Hey ' + name + ", it's Yancy from Teton Motors! I saw you were interested in " + (need || 'a vehicle') + ". What's your budget range?"
        );
        const tapToText = 'sms:' + phone + '?body=' + smsBody;

        const msg = [
            '🚨 <b>NEW LEAD — ' + srcLabel + '</b>',
            '',
            '👤 Name: ' + name,
            '📱 Phone: ' + phone,
            '🚗 Need: ' + (need || 'Not specified'),
            '📝 Details: ' + (details || 'None'),
            '🕐 Time: ' + new Date(timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'America/Denver' }),
            '',
            '📲 TAP TO TEXT:',
            tapToText
        ].join('\n');

        try {
            await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, msg);
        } catch (err) {
            console.error('Telegram error:', err.message);
        }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ ok: true });
};
