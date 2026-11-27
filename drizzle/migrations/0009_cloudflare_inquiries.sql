-- Cloudflare D1 is the authoritative inbox for public inquiries.
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  phone TEXT NOT NULL CHECK (length(phone) BETWEEN 7 AND 16),
  wedding_date TEXT NOT NULL,
  location TEXT NOT NULL CHECK (length(location) BETWEEN 1 AND 150),
  services_json TEXT NOT NULL,
  message TEXT CHECK (message IS NULL OR length(message) <= 1000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC);
