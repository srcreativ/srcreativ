# SR Studio project structure

This is a source-focused map of the repository. Generated, dependency and private folders are summarized instead of listing every bundled file.

```text
srcreativ/
├── AGENTS.md                         # Project rules; preserve Lovable history.
├── README.md                         # Project overview, capabilities and local commands.
├── LICENSE                           # Repository licence.
├── package.json                      # Node scripts and application dependencies.
├── package-lock.json                 # Locked Node dependency versions.
├── tsconfig.json                     # TypeScript compiler configuration.
├── vite.config.ts                    # Vite/TanStack Start build configuration.
├── vitest.config.ts                  # Test runner configuration.
├── eslint.config.js                  # Linting rules.
├── prettierrc                        # Code-formatting rules.
├── prettierignore                    # Files excluded from Prettier.
├── components.json                   # shadcn/ui component generator settings.
├── capacitor.config.ts               # Android shell URL and Capacitor settings.
├── wrangler.jsonc                    # Cloudflare Worker, D1 and observability bindings.
├── drizzle.config.ts                 # Drizzle migration configuration.
├── .gitignore                        # Files that must not enter Git.
├── .env                              # Local environment values — never commit.
├── .env.local                        # Local overrides/secrets — never commit.
├── sr-studio-release-keystore.jks    # Android signing key — never commit or share.
├── sr-studio-release-signing.properties # Local signing configuration — never commit.
│
├── .github/
│   ├── dependabot.yml                # Automated dependency update policy.
│   ├── ISSUE_TEMPLATE/               # GitHub issue forms.
│   ├── PULL_REQUEST_TEMPLATE.md      # Pull-request checklist.
│   └── workflows/
│       └── android-release.yml       # Builds and publishes signed Android APK releases.
│
├── docs/
│   ├── PROJECT_GUIDE.md              # Setup, operations, security and release guide.
│   └── PROJECT_STRUCTURE.md          # This file.
│
├── drizzle/
│   ├── migrations/                   # Ordered database migrations.
│   │   ├── 0000_admin_gallery_analytics.sql # Original admin, gallery and analytics schema.
│   │   ├── 0001_add_inquiry_phone.sql       # Inquiry phone-field migration.
│   │   ├── 0002_enable_inquiry_realtime.sql # Historic Supabase realtime configuration.
│   │   ├── 0003_repair_gallery_storage.sql  # Gallery storage repair.
│   │   ├── 0004_site_settings.sql           # Editable site settings schema.
│   │   ├── 0005_vdp_hall_of_fame.sql        # Vulnerability disclosure records.
│   │   ├── 0006_site_theme_media.sql        # Theme and landing-media fields.
│   │   ├── 0007_booking_calendar.sql        # Booking calendar schema.
│   │   ├── 0008_harden_public_inputs.sql    # Public input validation/RLS hardening.
│   │   ├── 0009_cloudflare_inquiries.sql    # Cloudflare D1 inquiry table and index.
│   │   └── meta/                     # Drizzle migration snapshots/journal.
│   └── schema.ts                      # Drizzle schema entry point.
│
├── public/                           # Files served unchanged at the site root.
│   ├── _headers                      # Cloudflare static asset headers.
│   ├── admin-guide.enc.json          # Encrypted owner-guide payload.
│   ├── default-site-settings.json    # Fallback site configuration.
│   ├── manifest.webmanifest           # PWA manifest.
│   ├── sw.js                         # Service worker.
│   ├── sr-studio-mark.svg            # SR Studio logo/mark.
│   ├── controller.png                # 3D drone control texture.
│   ├── drone-parts/                  # STL files and configuration for the 3D drone.
│   └── videos/                       # Public website video assets.
│
├── scripts/
│   └── prune-android-assets.mjs      # Keeps Android release payload small.
│
├── src/                              # Application source code.
│   ├── assets/                       # Bundled portfolio photography.
│   ├── components/                   # Reusable feature components.
│   │   ├── AdSlot.tsx                # Advertising placeholder component.
│   │   ├── AppInstallPrompt.tsx      # PWA/app installation prompt.
│   │   ├── DroneModel.*              # Three.js drone model implementation/styles.
│   │   ├── DroneShowcase.*           # Interactive drone showcase.
│   │   ├── LanguageSwitcher.tsx      # Translation/language UI.
│   │   └── ui/                       # Reusable shadcn/Radix UI primitives.
│   ├── hooks/
│   │   └── use-mobile.tsx            # Mobile viewport helper.
│   ├── integrations/
│   │   ├── lovable/                  # Lovable integration support.
│   │   └── supabase/                 # Remaining Supabase client/auth integration.
│   ├── lib/                          # Shared application services and helpers.
│   │   ├── admin-guide.ts            # Browser-side encrypted guide decryption.
│   │   ├── error-capture.ts          # SSR/client error capture support.
│   │   ├── error-page.ts             # Safe fallback error page.
│   │   ├── security-certificate.ts   # PDF certificate utilities.
│   │   ├── site-config.ts            # Canonical site identity/configuration.
│   │   ├── site-settings.ts          # Settings defaults and validation helpers.
│   │   ├── telemetry.ts              # Client telemetry helper.
│   │   ├── utils.ts                  # General UI utilities.
│   │   └── vdp-settings.ts           # Vulnerability-disclosure defaults/types.
│   ├── routes/                       # File-based TanStack routes.
│   │   ├── __root.tsx                # Document shell, global metadata and root UI.
│   │   ├── index.tsx                 # Public SR Studio website and enquiry form.
│   │   ├── auth.tsx                  # Owner sign-in screen.
│   │   ├── vulnerability-disclosure.tsx # Public vulnerability-disclosure page.
│   │   ├── _authenticated/           # Authenticated route boundary.
│   │   │   ├── route.tsx             # Authentication/role route guard.
│   │   │   ├── admin.tsx             # Admin layout, shared controls and feature logic.
│   │   │   └── admin/                # Individual admin pages.
│   │   │       ├── calendar.tsx      # Booking calendar.
│   │   │       ├── edit.tsx          # No-code site editor.
│   │   │       ├── gallery.tsx       # Gallery manager.
│   │   │       ├── inbox.tsx         # Inquiry inbox.
│   │   │       ├── index.tsx         # Admin home/dashboard.
│   │   │       ├── log.tsx           # Activity/log view.
│   │   │       ├── security.tsx      # Security and owner-guide page.
│   │   │       ├── track.tsx         # Visitor/analytics view.
│   │   │       └── vdp.tsx           # VDP and Hall of Fame manager.
│   │   └── README.md                 # Route-organisation notes.
│   ├── test/                         # Vitest setup and routing tests.
│   ├── router.tsx                    # TanStack Router creation.
│   ├── routeTree.gen.ts              # Generated route manifest; do not hand-edit.
│   ├── server.ts                     # Worker request handling, security headers and D1 APIs.
│   ├── start.ts                      # TanStack Start entry configuration.
│   └── styles.css                    # Global design system and responsive styling.
│
├── android/                          # Native Capacitor Android project.
│   ├── app/                          # App module, manifest, resources and Java activity/worker code.
│   ├── gradle/                       # Gradle wrapper configuration.
│   ├── build.gradle                  # Android root build configuration.
│   ├── variables.gradle              # Android dependency/version variables.
│   └── keystore.properties.example   # Safe signing configuration example.
│
├── supabase/
│   └── config.toml                   # Supabase CLI project configuration.
│
├── poster/                           # Local app-store poster variants and their HTML source.
│   ├── poster-01-control.png         # “Control every frame” store poster.
│   ├── poster-02-workflow.png        # “One calm place” store poster.
│   ├── poster-03-premium.png         # “Behind every beautiful story” store poster.
│   └── *.html / source assets         # Editable render templates and poster inputs.
│
├── .output/                          # Generated production build — recreate with npm run build.
├── .tanstack/                        # TanStack development/build cache.
├── .wrangler/                        # Wrangler deployment/build cache.
├── node_modules/                     # Installed dependencies — recreate with npm install.
├── .git/                             # Git repository metadata; never edit manually.
├── .agents/, .aws/, .codex/          # Local agent/tool/account configuration; private/local.
└── PROJECT_PRICE_ESTIMATE.local.md   # Local-only commercial estimate; intentionally Git-ignored.
```

## Generated versus source files

Do not edit `.output/`, `.tanstack/`, `.wrangler/`, `node_modules/` or `src/routeTree.gen.ts` by hand. They are generated from the source/configuration files above. Build a fresh Worker bundle with `npm run build`, then deploy with `npx wrangler deploy`.

## Data-layer note

New public enquiries use `src/server.ts` and Cloudflare D1 through migration `0009_cloudflare_inquiries.sql`. Some existing admin features still reference the legacy Supabase integration; do not remove its files until their data and authentication paths have been migrated and tested.
