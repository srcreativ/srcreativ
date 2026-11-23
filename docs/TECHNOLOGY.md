# SR Studio technology reference

## Application architecture

SR Studio is a server-rendered React application built with TanStack Start and Vite. TanStack Router defines public, authentication, and nested admin routes. TanStack Query handles client data loading and cache invalidation.

## Runtime and hosting

The production application builds through Nitro for the Cloudflare Workers runtime. `wrangler.jsonc` connects the Worker entrypoint, static asset directory, observability, and the D1 binding. The app can run on its `workers.dev` subdomain before a custom domain is purchased.

## Data, authentication, and media

The current implementation uses Supabase Auth for password and Google sign-in, Postgres for content, analytics, inquiries, VDP records, and role data, plus Supabase Storage for media. Drizzle migration files document schema changes. The repository is already structured so persistence adapters can be migrated to Cloudflare D1/R2 without changing the public UI.

## UI and content

- React 19 and TypeScript provide the component model and type safety.
- Tailwind CSS 4 provides the design system.
- Lucide React provides accessible SVG icons.
- `src/lib/site-settings.ts` provides a typed default website configuration.
- `public/default-site-settings.json` is the reset fallback for the no-code settings editor.

## Platform integrations

- Capacitor packages the web app as an Android application.
- jsPDF, html2canvas, and qrcode generate VDP researcher certificates.
- Three.js renders the interactive drone presentation.
- Sonner provides application notifications.

## Quality and maintenance

Vitest covers routing behavior, ESLint checks code quality, Prettier standardises formatting, and Dependabot tracks dependency updates. GitHub Actions contains the Android release workflow.

## Security model

Admin routes require an authenticated account and an `admin` role. Database row-level policies protect privileged data. The encrypted owner guide uses AES-256-GCM and browser-local decryption; its passphrase is neither committed nor sent to a server.
