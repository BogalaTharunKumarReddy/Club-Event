# CampusConnect — Mobile app (Capacitor)

This wraps the **existing** React/Vite frontend into native **Android** and **iOS**
apps using [Capacitor](https://capacitorjs.com). No web code is rewritten — the same
`dist` build that runs in the browser is packaged inside a native shell, and the app
talks to your Spring Boot backend over the network.

Producing an installable **APK/IPA still requires the platform IDEs** (Android Studio
for Android, Xcode for iOS) — Capacitor generates the native projects; the IDEs compile
and sign them. Everything below is run from the `frontend/` folder unless noted.

---

## 1. Prerequisites

- **Node 18+** and npm (already required for the web app).
- **Android:** [Android Studio](https://developer.android.com/studio) + a JDK 17. Set
  `ANDROID_HOME` / SDK per Android Studio's setup.
- **iOS (macOS only):** Xcode + Command Line Tools + CocoaPods (`sudo gem install cocoapods`).

## 2. One-time setup

```bash
cd frontend

# Install dependencies (adds the Capacitor packages listed in package.json)
npm install

# Add the native projects (creates ./android and ./ios folders)
npx cap add android
npx cap add ios      # macOS only
```

## 3. Point the app at your backend (required)

A packaged app has **no dev proxy**, so a relative `/api` will not work — you must give
it an absolute URL the device can reach. Copy the template and edit it:

```bash
cp .env.mobile.example .env.production   # Vite auto-loads .env.production for `vite build`
```

Set `VITE_API_BASE_URL` and `VITE_WS_URL` to one of:

| Scenario | Example |
| --- | --- |
| Deployed HTTPS backend (recommended) | `https://api.yourhost.com/api` |
| Android **emulator** → backend on this PC | `http://10.0.2.2:8080/api` |
| Real device on same Wi‑Fi → this PC | `http://192.168.x.x:8080/api` (your LAN IP) |

## 4. Backend must allow the app's origin (CORS)

The WebView's origin is **`https://localhost`** on Android and **`capacitor://localhost`**
on iOS. Add both to the backend's allow-list (env `CORS_ALLOWED_ORIGINS`, comma‑separated):

```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://localhost,capacitor://localhost
```

This is read by both the REST CORS config and the WebSocket config, so it covers API and
realtime notifications. No backend code changes are needed — it's purely this env var.

## 5. Build, sync, and open

```bash
# Build the web app with your .env.production values, then copy it into the native projects
npm run cap:sync

# Open the platform IDE to run on a device/emulator and to build the APK/IPA
npm run cap:open:android    # or: npm run cap:open:ios
```

Shortcuts `npm run cap:run:android` / `cap:run:ios` do build + sync + open in one step.
**Re-run `npm run cap:sync` after every web change** — the native project holds a *copy*
of `dist`.

## 6. Camera permission for QR check-in

The QR scanner uses the browser camera API inside the WebView. Because `androidScheme`
is `https`, the WebView runs in a secure context (required for camera). You still must
declare the OS permission once, in the generated native projects:

**Android** — `android/app/src/main/AndroidManifest.xml`, inside `<manifest>`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

**iOS** — `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>CampusConnect uses the camera to scan event check-in QR codes.</string>
```

The user is prompted the first time the scanner opens. (These files live in the native
projects, which are created by `npx cap add` and are yours to commit.)

## 7. Android + a plain-HTTP backend (cleartext)

Android blocks `http://` traffic by default. If you point the app at an **http** backend
(e.g. `10.0.2.2` during development), either use HTTPS, or allow cleartext in
`AndroidManifest.xml` on the `<application>` tag **for development only**:

```xml
<application android:usesCleartextTraffic="true" ... >
```

Production should always use HTTPS; remove the cleartext flag before shipping.

## 8. Producing the installable build

- **Android:** Android Studio → *Build ▸ Build Bundle(s)/APK(s) ▸ Build APK*, or
  *Build ▸ Generate Signed Bundle/APK* for a signed release `.aab`/`.apk`.
- **iOS:** Xcode → select a device/target → *Product ▸ Archive* → distribute.

## Troubleshooting

- **"Network Error" / requests fail:** the URL isn't reachable from the device, or CORS
  isn't allowing `https://localhost` / `capacitor://localhost`. Verify §3 and §4.
- **Blank/white screen:** you edited the web app but didn't re-sync — run `npm run cap:sync`.
- **Camera never opens:** the OS permission (§6) is missing, or (rare) the device lacks
  `BarcodeDetector`; ensure you built with `androidScheme: https` (the default here).
- **WebSocket/notifications don't connect:** set `VITE_WS_URL` to an absolute URL too, and
  confirm the origin is in `CORS_ALLOWED_ORIGINS`.
