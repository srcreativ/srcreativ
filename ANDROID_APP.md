# SR Studio Android app

The Android app is a lightweight Capacitor shell for the live SR Studio admin website. It deliberately does not package the website's videos and gallery assets; the app loads the current Cloudflare Worker instead.

## Releases are built only on GitHub

No APK is kept or built locally. GitHub Actions builds the signed APK, removes the bundled media payload, names it `SR-Studio-Admin-vX.Y.Z.apk`, and attaches it to a GitHub Release. This keeps the repository and development machines free of release APKs.

## Production signing

Create an Android signing key once and keep it safely offline:

```bash
keytool -genkeypair -v -keystore android/release-keystore.jks -alias sr-studio -keyalg RSA -keysize 4096 -validity 10000
cp android/keystore.properties.example android/keystore.properties
```

Keep the key safely offline. Do not commit the `.jks` file or real properties file.

For GitHub Releases, add these GitHub repository secrets:

- `ANDROID_KEYSTORE_BASE64` — base64 of the `.jks` file
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

To release from GitHub, either push a tag such as `android-v1.1.0`, or use **Actions → Android APK release → Run workflow** and enter `1.1.0`. The workflow derives Android's increasing version code from the semantic version and publishes a signed `SR-Studio-Admin-v1.1.0.apk` GitHub Release.

## In-app updater

On app startup, the native updater checks the latest GitHub release at `srcreativ/srcreativ`. When it finds a newer `android-vX.Y.Z` tag with an APK asset, it prompts for download, requests Android's required “Install unknown apps” permission when needed, then invokes the system package installer. GitHub Releases must contain the signed `.apk` asset.
