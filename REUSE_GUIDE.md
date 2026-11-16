# Reusing SR Studio

This project is designed to be reused as a studio portfolio and Android-installable admin app.

## Brand a new installation

1. Update the values in `src/lib/site-config.ts`.
2. Replace images in `src/assets/`, public videos in `public/videos/`, and the mark in `public/sr-studio-mark.svg`.
3. Update copy, service packages, testimonials, and social links in `src/routes/index.tsx`.
4. Create a new Supabase project, run the SQL migrations in `drizzle/migrations/`, and set its public URL/key in a local ignored `.env` file.
5. Deploy with Cloudflare Workers using the command in `HOSTING_GUIDE.md`.

## Android app workflow

The app is a PWA: open `/admin` in Chrome for Android and choose **Install app**. It uses the same secure login, gallery, inquiry, and account-management interfaces as the web admin panel, so no separate data store is required.

For inquiry alerts, keep the installed app open at least once and allow notifications. Real-time notifications require the `0002_enable_inquiry_realtime.sql` migration. Background notifications while the app is fully closed require a separate server-side Web Push/VAPID setup and are intentionally not configured with browser-exposed secrets.
