<div align="center">
  <img src="rsc/logo.png" alt="SR Studio" width="120" />
  <h1>SR Studio</h1>
  <p>Cinematic wedding photography, films, and aerial storytelling.</p>

  [![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?logo=tanstack&logoColor=white)](https://tanstack.com/start)
  [![License](https://img.shields.io/badge/license-Proprietary-lightgrey)](LICENSE)
</div>

## What is included

- Public portfolio with editable content, theme, media, social links, and SEO metadata.
- Authenticated admin workspace for site settings, gallery, analytics, logs, security, and VDP/Hall of Fame.
- Progressive web app shell with a Capacitor Android project.
- PDF researcher certificates with QR verification data.
- Cloudflare Worker deployment configuration and D1 database binding.

## Technology

| Area | Technology |
| --- | --- |
| App | React 19, TypeScript, TanStack Start/Router/Query |
| Styling | Tailwind CSS 4, Lucide icons |
| Runtime | Cloudflare Workers via Nitro |
| Data/auth (current) | Supabase Auth, Postgres, Storage, Realtime |
| Database tooling | Drizzle migrations |
| Mobile | Capacitor Android |
| Documents | jsPDF, html2canvas, qrcode |
| Quality | Vitest, ESLint, Prettier, Dependabot |

See the [technology reference](docs/TECHNOLOGY.md), [operations guide](docs/OPERATIONS.md), and [security policy](SECURITY.md).

## Local development

```bash
npm install
npm run dev
```

Create a `.env.local` from the deployment environment and provide the Supabase public URL and publishable key. Never commit environment files or secrets.

### Useful commands

```bash
npm run build     # production Worker build
npm test          # test suite
npm run lint      # static checks
npx wrangler deploy --config wrangler.jsonc
```

## Deployment

The Worker configuration is in [`wrangler.jsonc`](wrangler.jsonc). Cloudflare deployment uses the generated `.output/server` entrypoint and static assets from `.output/public`.

For a production domain, add the custom domain in Cloudflare after DNS is configured with the registrar. Keep production secrets in Cloudflare Worker secrets—never in GitHub Actions, source files, or client-side environment variables.

## Repository guide

- [`src/routes`](src/routes): public, auth, and admin routes.
- [`src/components`](src/components): reusable UI sections.
- [`src/lib`](src/lib): shared configuration, telemetry, certificates, and encrypted-guide utilities.
- [`drizzle/migrations`](drizzle/migrations): database migration history.
- [`android`](android): Capacitor Android shell.
- [`docs`](docs): technical and operational documentation.

## Admin guide

The owner guide is intentionally stored as an encrypted asset (`public/admin-guide.enc.json`). It is available from **Admin → Security** after authentication and local passphrase unlock. The passphrase is not included in this repository or transmitted by the application.

## Policies

[Security](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [License](LICENSE)
