<div align="center">
  <img src="public/sr-studio-mark.svg" alt="SR Studio logo" width="120" />
  <h1>SR Studio</h1>
  <p>Cinematic wedding photography, films, and aerial storytelling.</p>

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?logo=tanstack&logoColor=white)](https://tanstack.com/start)
</div>

SR Studio is a production wedding-photography portfolio, owner admin workspace, and signed Android companion app.

## Features

### Public website

- Cinematic, responsive portfolio with photography, film, drone and pre-wedding galleries.
- Service pages, testimonials, artist story, social links, enquiry form and multilingual controls.
- Validated wedding enquiry form; submissions are stored in Cloudflare D1.
- Search and sharing essentials: metadata, structured data, `robots.txt`, sitemap and `security.txt`.
- Progressive web app manifest and install prompt.

### Owner admin workspace

- Authenticated, role-gated `/admin` area with gallery, tracking, calendar, inquiry inbox, activity log, security, VDP/Hall of Fame and site-settings sections.
- No-code content controls for brand copy, calls to action, testimonials, links, palette, typography scale, section visibility/order and landing-page media.
- Gallery upload, preview, selection and bulk deletion workflows.
- Booking calendar and enquiry/analytics views.
- Encrypted owner guide rendered as Markdown only after local, authenticated browser decryption.
- Vulnerability-disclosure workflow, recognition records and PDF certificate generation.

### Cloudflare and Android

- Cloudflare Worker deployment with D1-backed inquiry storage, status endpoint and Worker observability.
- Security headers including CSP, anti-clickjacking, permissions policy and no-store handling for admin/auth routes.
- Capacitor Android admin shell with SR Studio splash/branding, edge-to-edge mobile layout and GitHub Release self-update prompt.
- Background Android enquiry polling with an opt-in status-bar notification. Android schedules this work, so delivery is delayed and battery/network dependent; Firebase Cloud Messaging would be needed for immediate push.
- GitHub Actions builds a signed release APK from `android-vX.Y.Z` tags.

```bash
npm install
npm run dev
npm test
npm run build
```

## Deployment

```bash
npm run build
npx wrangler deploy
```

Complete setup, operations, security, Android releases, data-migration notes and contribution rules: [docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md).

## Security and contribution notes

Never commit environment files, Cloudflare tokens, Android keystores or signing passwords. This repository is connected to Lovable: do not force-push, rebase, amend or squash published commits.
