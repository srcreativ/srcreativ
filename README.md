# SR Studio

SR Studio is a cinematic wedding photography and film portfolio, with an
editable admin panel, gallery management, VDP/hall-of-fame programme, and
Cloudflare Workers deployment.

## Development

You need Node.js and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Commands

```sh
npm run dev
npm run build
npm test
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Supabase (authentication, database, storage)
- Cloudflare Workers (production hosting)

## Production repository files

- [LICENSE](./LICENSE) — proprietary usage terms.
- [SECURITY.md](./SECURITY.md) — private vulnerability reporting policy.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — approved contribution workflow.
- `.github/` — Dependabot, bug-report form, and PR checklist.

Never commit `.env`, `.dev.vars`, API keys, OAuth secrets, or service-role
keys. See [HOSTING_GUIDE.md](./HOSTING_GUIDE.md) for deployment and environment
configuration.

## Self-Hosting (Without Lovable)

For a complete step-by-step guide to hosting this site independently on **Cloudflare Workers**, **Vercel**, **Netlify**, or a **VPS / Docker container** using your own Supabase project, refer to the [HOSTING_GUIDE.md](./HOSTING_GUIDE.md).
