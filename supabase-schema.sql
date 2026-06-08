-- ═══════════════════════════════════════════════════════════════
-- ReportMind — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- ── Clients ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rm_clients (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                  TEXT NOT NULL,
  status                TEXT DEFAULT 'active',
  google_ads_connected  BOOLEAN DEFAULT false,
  ga4_connected         BOOLEAN DEFAULT false,
  gsc_connected         BOOLEAN DEFAULT false,
  google_ads_customer_id TEXT,
  ga4_property_id       TEXT,
  gsc_site_url          TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rm_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own clients" ON rm_clients FOR ALL USING (auth.uid() = user_id);

-- ── Reports ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rm_reports (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id             UUID REFERENCES rm_clients(id) ON DELETE SET NULL,
  client_name           TEXT NOT NULL,
  month_label           TEXT NOT NULL,
  status                TEXT DEFAULT 'done',
  report_data           JSONB,
  narrative             TEXT,
  time_taken_seconds    INTEGER,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rm_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own reports" ON rm_reports FOR ALL USING (auth.uid() = user_id);

-- ── Waitlist ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rm_waitlist (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist is public insert, admin read
ALTER TABLE rm_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON rm_waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin reads waitlist" ON rm_waitlist FOR SELECT USING (false); -- service role only

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS rm_clients_user_id_idx ON rm_clients(user_id);
CREATE INDEX IF NOT EXISTS rm_reports_user_id_idx ON rm_reports(user_id);
CREATE INDEX IF NOT EXISTS rm_reports_client_id_idx ON rm_reports(client_id);
CREATE INDEX IF NOT EXISTS rm_reports_created_at_idx ON rm_reports(created_at DESC);
