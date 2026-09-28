import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration — wraps the built Vite web app (the `dist` folder)
 * into native Android and iOS apps WITHOUT changing any of the web code.
 *
 * Notes that matter for this project:
 *  - `webDir` points at Vite's build output (`dist`).
 *  - `androidScheme: 'https'` serves the app from https://localhost inside the
 *    Android WebView. That is a *secure context*, which the QR scanner's camera
 *    access (getUserMedia / BarcodeDetector) requires, and it also avoids
 *    mixed-content errors when your backend is served over HTTPS.
 *  - On a device/emulator there is NO dev proxy, so the app must call the backend
 *    using an ABSOLUTE URL. Set it at build time via VITE_API_BASE_URL / VITE_WS_URL
 *    (see .env.mobile.example) BEFORE running `npm run build`.
 *  - Add the WebView origins to the backend CORS allow-list (CORS_ALLOWED_ORIGINS):
 *        Android -> https://localhost        iOS -> capacitor://localhost
 *  - Camera permission for QR check-in is declared per-platform after you add the
 *    native projects (Android: CAMERA in AndroidManifest.xml; iOS:
 *    NSCameraUsageDescription in Info.plist). See MOBILE.md.
 */
const config: CapacitorConfig = {
  appId: 'com.campusconnect.app',
  appName: 'CampusConnect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
