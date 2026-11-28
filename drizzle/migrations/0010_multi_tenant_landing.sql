-- One shared Worker and D1 database can serve multiple client brands.
-- The hostname is the tenant boundary for public traffic; never accept a tenant ID from the browser.
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 100),
  settings_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS tenant_domains (
  hostname TEXT PRIMARY KEY COLLATE NOCASE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO tenants (id, display_name, settings_json)
VALUES ('sr-studio', 'SR Studio', '{}');

INSERT OR IGNORE INTO tenant_domains (hostname, tenant_id)
VALUES ('srcreativ.srcreativ92.workers.dev', 'sr-studio');

ALTER TABLE inquiries ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'sr-studio';
CREATE INDEX IF NOT EXISTS inquiries_tenant_created_at_idx
  ON inquiries(tenant_id, created_at DESC);
