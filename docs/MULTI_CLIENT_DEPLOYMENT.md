# Reusable client landing pages

The project now uses one application and one Cloudflare D1 database for all client sites. A visitor's **hostname** resolves to a tenant record; that record supplies only landing-page settings. The shared application, Android admin app, inquiry API, database, and non-landing UI remain the same.

## What can change per client

- Brand name, contact information, copy, social links, service list, testimonials, colours, corner radius, section order and visibility.
- Landing-page media and the fixed portfolio image slots.
- The client's public domain and isolated inquiry records.

Use [CLIENT_LANDING_SETTINGS.example.json](./CLIENT_LANDING_SETTINGS.example.json) as the override JSON. Omitted fields retain the SR Studio defaults, so a client setup only needs the fields that differ.

## Add a client

1. Apply migration `0010_multi_tenant_landing.sql` to the production D1 database.
2. Host client images at paths available from the shared Worker (or a separate approved image host) and update the JSON template with those URLs.
3. Insert the client and its exact hostname. Use a stable lowercase ID such as `northlight-films`.

   ```sql
   INSERT INTO tenants (id, display_name, settings_json)
   VALUES ('northlight-films', 'Northlight Films', '<settings JSON>');

   INSERT INTO tenant_domains (hostname, tenant_id)
   VALUES ('www.northlight.example', 'northlight-films');
   ```

4. Map that hostname to this Worker in Cloudflare. For a small number of domains, use Workers custom domains. For a larger commercial portfolio, configure Cloudflare for SaaS/custom hostnames. The hostname must exactly match `tenant_domains.hostname`.
5. Visit `https://www.northlight.example/api/public/site-settings` to confirm that it returns the intended tenant, then test an inquiry. Its status and stored inquiry rows are scoped to that tenant.

## Important boundaries

- The public API selects a tenant from the request hostname, not from a browser-provided ID. This prevents a visitor choosing another client's settings or inquiry bucket.
- `settings_json` is public landing-page content; do not put passwords, API keys, or private notes in it.
- Existing authenticated admin/editor pages still use the current Supabase authorization model. Do not give client users shared administrator credentials. Before offering self-service editing, add tenant ownership to authentication and scope every admin query by `tenant_id`.
- Existing legacy Supabase gallery uploads are deliberately not shown on the public landing page because they are not tenant-scoped. Configure the per-client portfolio image slots in tenant settings until tenant-aware media management is added.
