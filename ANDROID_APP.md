# SR Studio Android app

The Android app is a lightweight Capacitor shell for the live SR Studio admin website. It deliberately does not package the website's videos and gallery assets; the app loads the current Cloudflare Worker instead.

## Build commands

```bash
npm run android:debug
npm run android:release
```

`android:prepare` syncs Capacitor, then removes the copied media bundle while keeping the small native bridge and offline connection shell. This reduces the APK substantially compared with bundling the entire website.

## Production signing

Create an Android signing key once and keep it safely offline:

```bash
keytool -genkeypair -v -keystore android/release-keystore.jks -alias sr-studio -keyalg RSA -keysize 4096 -validity 10000
cp android/keystore.properties.example android/keystore.properties
```

Fill `android/keystore.properties` with the key details, then run `npm run android:release`. Do not commit the `.jks` file or real properties file.

For GitHub Releases, add these GitHub repository secrets:

- `ANDROID_KEYSTORE_BASE64` — base64 of the `.jks` file
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Tag a release as `android-v1.1.0` (then increase `versionCode` and `versionName` for every future update). The workflow builds a signed release APK and publishes it to GitHub Releases.

## In-app updater

On app startup, the native updater checks the latest GitHub release at `srcreativ/srcreativ`. When it finds a newer `android-vX.Y.Z` tag with an APK asset, it prompts for download, requests Android's required “Install unknown apps” permission when needed, then invokes the system package installer. GitHub Releases must contain the signed `.apk` asset.
