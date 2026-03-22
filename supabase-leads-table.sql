-- Run this in Supabase SQL Editor to create the leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    need TEXT DEFAULT 'Not specified',
    details TEXT DEFAULT '',
    source TEXT DEFAULT 'direct',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    contacted BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT ''
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the API endpoint)
CREATE POLICY "Allow anonymous inserts" ON leads
    FOR INSERT WITH CHECK (true);

-- Allow anonymous selects (for the dashboard)
CREATE POLICY "Allow anonymous selects" ON leads
    FOR SELECT USING (true);

-- Allow anonymous updates (for marking contacted)
CREATE POLICY "Allow anonymous updates" ON leads
    FOR UPDATE USING (true);

-- Create index on timestamp for fast sorting
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads (timestamp DESC);

-- Create index on source for fast filtering
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
