const https = require('https');

function supabaseQuery(url, key, path) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url + '/rest/v1/' + path);
        const opts = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key
            }
        };
        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Parse error: ' + data)); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function supabaseUpdate(url, key, id, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const parsed = new URL(url + '/rest/v1/leads?id=eq.' + id);
        const opts = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Prefer': 'return=minimal',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(opts, (res) => {
            let d = '';
            res.on('data', (c) => d += c);
            res.on('end', () => resolve({ status: res.statusCode }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

module.exports = async function handler(req, res) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
    const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'yancy2026';

    // Auth check
    const auth = req.headers['x-dashboard-password'] || req.query.password;
    if (auth !== DASHBOARD_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({ error: 'Supabase not configured' });
    }

    // PATCH — mark as contacted
    if (req.method === 'PATCH') {
        const { id, contacted, notes } = req.body;
        if (!id) return res.status(400).json({ error: 'ID required' });
        const update = {};
        if (typeof contacted === 'boolean') update.contacted = contacted;
        if (typeof notes === 'string') update.notes = notes;
        await supabaseUpdate(SUPABASE_URL, SUPABASE_KEY, id, update);
        return res.status(200).json({ ok: true });
    }

    // GET — fetch leads
    const leads = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'leads?order=created_at.desc&limit=200');
    return res.status(200).json(leads);
};
