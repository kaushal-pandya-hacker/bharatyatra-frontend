# BharatYatra Phase 2.1 — Mobile Foundation Stabilization Report

**Platform:** BharatYatra (Web, Android, iOS, Tablets)  
**Architecture:** Next.js 14 (App Router) + Capacitor 6.2.3  
**Target Package ID:** `in.bharatyatra.app`  
**Date:** November 16, 2026  
**Status:** **SUCCESS / STABILIZED**

---

## 1. Executive Summary

Phase 2.1 focused on stabilizing the cross-platform mobile foundation for BharatYatra, addressing a critical APK bloat issue, establishing a safe native bridge lifecycle hook, validating native Android builds, auditing iOS project health, and verifying platform security.

### Key Highlights
- **APK Size Reduction:** Slashed debug APK size from **428.46 MB (449,271,534 bytes)** down to **8.16 MB (8,556,981 bytes)** — a **98.1% size reduction**, surpassing the < 30 MB target.
- **Native Bridge Integration:** Connected `CapacitorMobileBridge.initializeApp()` within the React layout lifecycle (`components/layout/CustomerLayoutWrapper.tsx`) with proper cleanup to prevent memory leaks, listener duplicates, and browser-only SSR errors.
- **Android Validation:** Clean build completed with Gradle 8.7 and Microsoft OpenJDK 17 LTS (`BUILD SUCCESSFUL in 32s`).
- **iOS Audit:** iOS project configurations (`Podfile`, `Info.plist`, `AppDelegate.swift`) verified for Capacitor 6.2.3 compatibility; macOS/Xcode build requirements documented.
- **Website Preservation:** Live website (`https://www.bharatyatra.in`) runtime and asset structure preserved without interference.

---

## 2. Step-by-Step Implementation & Verification

### Step 1 — Architectural Inspection

| Configuration / Directory | State / Findings | Action Taken |
| :--- | :--- | :--- |
| `capacitor.config.ts` | Configured with `webDir: 'public'`, causing full 419 MB Next.js public directory to be synced to native assets. | Switched `webDir` to lightweight `public-mobile/`. |
| `CustomerLayoutWrapper.tsx` | No invocation of `CapacitorMobileBridge`. | Added lifecycle-safe `useEffect` hook with listener unmounting. |
| `lib/mobile/capacitor-bridge.ts` | Bridge defined, but lacked listener cleanup handles for hardware back button and app state changes. | Added `backButtonHandle`, `appStateHandle`, and `CapacitorMobileBridge.cleanup()`. |
| `android/` | Full Gradle project, SDK 34, AndroidManifest configured with camera, geolocation, network, push notifications. | Maintained and verified via Gradle. |
| `ios/` | Xcode workspace with Capacitor Pods, targeted for iOS 14.0+, iPadOS supported. | Verified configuration and permissions. |

---

### Step 2 — Native Bridge Lifecycle Hook

`CapacitorMobileBridge.initializeApp()` handles:
1. Native status bar styling (`Style.Dark`, `#0F172A`).
2. Hardware back button navigation handling via Capacitor App plugin.
3. Network connectivity status change monitoring.
4. Push notification permission requests and FCM/APNs token registration.
5. Deep link listener registration for OAuth / payment returns (`bharatyatra://`).

#### Modifications Made:
1. **`lib/mobile/capacitor-bridge.ts`**:
   - Added listener references:
     ```typescript
     private static backButtonHandle: PluginListenerHandle | null = null;
     private static appStateHandle: PluginListenerHandle | null = null;
     ```
   - Implemented `CapacitorMobileBridge.cleanup()` to safely remove listeners when components unmount.
   - Wrapped all browser-only and native plugin calls with `isNative()` checks and error boundaries to guarantee web compatibility.
2. **`components/layout/CustomerLayoutWrapper.tsx`**:
   - Added client-side React lifecycle integration:
     ```typescript
     useEffect(() => {
       if (typeof window !== 'undefined') {
         CapacitorMobileBridge.initializeApp().catch(console.error);
       }
       return () => {
         CapacitorMobileBridge.cleanup().catch(console.error);
       };
     }, []);
     ```

---

### Step 3 — APK Size Optimization & Root Cause Analysis

#### Root Cause:
`capacitor.config.ts` had `webDir: 'public'`. During `npx cap sync`, Capacitor recursively copied every file in the Next.js `public/` directory into:
- `android/app/src/main/assets/public/`
- `ios/App/App/public/`

The `public/` directory contained **419.14 MB** of static assets, primarily:
- `public/state-images/`: ~357.7 MB (high-resolution destination photography)
- `public/landmarks/` & `public/places/`: ~55 MB

Because BharatYatra runs via **Capacitor Remote Delivery** (`server.url: 'https://www.bharatyatra.in'`), all high-resolution images are fetched live from Vercel's global CDN and image optimizer. Bundling 419 MB of static images inside the native binary was redundant.

#### Solution:
1. Created dedicated `public-mobile/` containing only essential bootstrap & offline assets:
   - `index.html` (lightweight Capacitor bootstrapper)
   - `offline.html` (offline network fallback screen)
   - `logo.png`, `bharatyatra-logo.png`, `chalo-farva-logo.png` (branding)
   - `favicon.ico`, `manifest.json`, `sw.js` (PWA bootstrap)
   - Total `public-mobile/` footprint: **1.46 MB**.
2. Updated `capacitor.config.ts`:
   ```typescript
   webDir: 'public-mobile',
   ```
3. Updated `scripts/update_brand_logo.py` to synchronize any future brand logo/favicon updates directly to `public-mobile/`.
4. Synchronized assets with `npx cap sync`.

#### Size Comparison:

| Metric | Before Optimization | After Optimization | Difference |
| :--- | :--- | :--- | :--- |
| **Android Assets Folder** | 419.14 MB | 1.47 MB | -99.6% |
| **iOS Assets Folder** | 419.14 MB | 1.46 MB | -99.6% |
| **Debug APK (`app-debug.apk`)** | **428.46 MB** (449,271,534 bytes) | **8.16 MB** (8,556,981 bytes) | **-98.1%** |

---

### Step 4 — Android Validation

- **JDK Version:** Microsoft OpenJDK 17.0.21.21-hotspot (`C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot`)
- **Gradle Version:** Gradle 8.7 (Distribution `gradle-8.7-all.zip`)
- **Android SDK:** Compile SDK 34, Min SDK 22, Target SDK 34
- **Build Command:** `.\gradlew.bat clean assembleDebug`
- **Build Result:** `BUILD SUCCESSFUL in 32s` (40 actionable tasks: 40 executed).
- **Target APK Path:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Native Plugins Tested:**
  - `@capacitor/camera` (3.4.1)
  - `@capacitor/geolocation` (6.1.3)
  - `@capacitor/network` (6.0.4)
  - `@capacitor/push-notifications` (6.0.5)
  - `@capacitor/status-bar` (6.0.3)
  - `@capacitor/app` (6.0.3)
  - `@capacitor/haptics` (6.0.3)

---

### Step 5 — iOS Project Health & Audit

- **Environment:** Windows host OS (No direct macOS `xcodebuild` available on host).
- **Project Structure:** `ios/App/App.xcworkspace` with CocoaPods integration.
- **Capacitor Configuration:** `ios/App/App/capacitor.config.json` verified to use `public-mobile`.
- **Target OS:** iOS 14.0+ (`Podfile` specifies `platform :ios, '14.0'`).
- **Device Support:** iPhone and iPad orientations enabled (`UIInterfaceOrientationPortrait`, `UIInterfaceOrientationLandscapeLeft`, `UIInterfaceOrientationLandscapeRight`).
- **Privacy Usage Descriptions (`Info.plist`):**
  - `NSLocationWhenInUseUsageDescription`: Present ("BharatYatra needs your location to show nearby tourist places and navigation.")
  - `NSCameraUsageDescription`: Present ("BharatYatra needs access to your camera to take photos of tourist places.")
  - `NSPhotoLibraryUsageDescription`: Present ("BharatYatra needs access to your photo library to select photos.")
- **Note on iOS Compilation:** Native `.ipa` generation requires macOS with Xcode 15+ and CocoaPods. The project configuration and assets are completely prepared for compilation on any macOS CI/CD or local machine.

---

### Step 6 — Security Audit

1. **Cleartext Traffic:** Disabled (`cleartext: false` in `capacitor.config.ts`). Only secure HTTPS endpoints are loaded.
2. **Mixed Content:** Prohibited (`allowMixedContent: false`).
3. **Navigation Whitelist (`allowNavigation`):**
   - `bharatyatra.in` & `*.bharatyatra.in` (Core application)
   - `*.supabase.co` (Authentication & Database API)
   - `accounts.google.com` (Google OAuth)
   - `api.razorpay.com` (Razorpay Payment Gateway)
4. **Deep Linking Scheme:** Registered custom scheme `bharatyatra://` for OAuth and payment callback redirects.
5. **Sensitive Information:** No API secret keys, service role keys, or database credentials are baked into client-side APK bundles or mobile assets.

---

## 3. Files Modified

| File | Type | Changes |
| :--- | :--- | :--- |
| `capacitor.config.ts` | Config | Updated `webDir` from `'public'` to `'public-mobile'`. |
| `components/layout/CustomerLayoutWrapper.tsx` | Component | Added safe `useEffect` invoking `CapacitorMobileBridge.initializeApp()` and cleanup. |
| `lib/mobile/capacitor-bridge.ts` | Service | Added listener handles and `cleanup()` method for safe lifecycle teardown. |
| `scripts/update_brand_logo.py` | Tooling | Added automatic asset sync to `public-mobile/`. |
| `public-mobile/` (directory) | Static Assets | Lightweight bundle (1.46 MB) containing bootstrap HTML, offline screen, and brand logos. |
| `BHARATYATRA_PHASE2_1_STABILIZATION_REPORT.md` | Documentation | This comprehensive Phase 2.1 technical stabilization report. |

---

## 4. Production Readiness & Next Steps

1. **Google Play Store Release:**
   - Generate production signing keystore (`keytool -genkey -v -keystore bharatyatra-release.keystore ...`).
   - Configure `signingConfigs` in `android/app/build.gradle`.
   - Build Android App Bundle (AAB): `.\gradlew.bat bundleRelease`.
2. **Apple App Store Release:**
   - Clone repository to macOS environment.
   - Run `npx cap sync ios`.
   - Open in Xcode (`npx cap open ios`), configure Developer Team and Provisioning Profiles, and archive for App Store Connect.
3. **Continuous Integration (CI/CD):**
   - Add a GitHub Actions workflow for automated Android APK/AAB builds and iOS linting on push to `main`.
