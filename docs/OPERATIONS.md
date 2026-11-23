# SR Studio operations handbook

## Publishing website changes

1. Open **Admin → Settings**.
2. Update copy, links, theme, order, or media.
3. Review the live draft preview.
4. Select **Publish website changes**.
5. Check the public homepage and send a test inquiry.

## Gallery workflow

Review the complete preview before upload. Use descriptive titles and the correct category. Select gallery cards with their checkboxes before deleting; deletion is permanent from the public gallery.

## Security checklist

- Use a unique owner password and Google login where available.
- Restrict admin access to trusted devices.
- Download logs before significant launches.
- Review inquiry records and VDP reports regularly.
- Keep local backups of all original client media.
- Do not commit `.env`, `.env.local`, Worker secrets, access tokens, or private certificates.

## Deploying the Worker

Run `npm run build`, `npm test`, then `npx wrangler deploy --config wrangler.jsonc`. Confirm the Worker URL responds successfully after deployment. Make only forward Git commits: this project is connected to Lovable, so do not force-push, rebase, amend, or rewrite published history.

## Android application

After web changes, run the documented Capacitor sync/build process from [ANDROID_APP.md](../ANDROID_APP.md). The Android app is a Capacitor shell around the responsive admin experience, so deployed website changes appear after reload without publishing a new APK unless native configuration changes.
