# SR Studio Admin for Android

The Android application is a secure native wrapper around the live SR Studio
admin panel. It uses the same account, gallery, inquiries, and Supabase data as
the website, so there is only one place to manage the studio.

## Install

1. Open the repository's **Releases** page on an Android phone.
2. Download `sr-studio-admin.apk` from the newest Android release.
3. Allow installs from the browser or file manager when Android asks.
4. Open **SR Studio Admin** and sign in at `/auth`.

The app requires an internet connection because it loads the current protected
site from Cloudflare. Updates to the website are immediately reflected in the
app; a new APK is needed only when the Android wrapper itself changes.

## Publish an APK release

Push a tag that begins with `android-v`, for example:

```bash
git tag android-v1.0.0
git push origin android-v1.0.0
```

GitHub Actions builds the debug APK with Java 17 and adds it to the matching
GitHub Release. No Supabase keys, passwords, or signing keys are stored in the
repository.

## Production note

The GitHub Release APK is suitable for direct client installation. Play Store
distribution requires a separately generated, private signing key and a signed
release App Bundle; never commit that signing key to this repository.
