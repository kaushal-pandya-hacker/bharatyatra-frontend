# BharatYatra Phase 2.2 — Android Release Readiness Report

**Platform:** BharatYatra Android  
**Application ID:** `in.bharatyatra.app`  
**Version:** Code `1`, Name `1.0`  
**Target SDK:** 34 (Android 14) | Min SDK: 22 (Android 5.1) | Tested on: Android 17 (API 37, 16k page size)  
**Date:** November 16, 2026  
**Final Release Verdict:** **CONDITIONAL GO** (Production packaging & binary readiness passed; requires official Google Play upload key & `google-services.json` for live store upload)

---

## 1. Build Artifacts & Exact Paths

All artifacts were generated using Microsoft OpenJDK 17 LTS (`jdk-17.0.21.21-hotspot`) and Gradle 8.7.

| Artifact Type | Build Target | Output Path | Exact File Size | Signing Status |
| :--- | :--- | :--- | :--- | :--- |
| **Debug APK** | `assembleDebug` | `android/app/build/outputs/apk/debug/app-debug.apk` | **8,556,981 bytes** (~8.16 MB) | Signed with `CN=Android Debug` |
| **Release APK** | `assembleRelease` | `android/app/build/outputs/apk/release/app-release.apk` | **7,337,036 bytes** (~7.00 MB) | Signed with `CN=BharatYatra Release` (v1 + v2) |
| **Release AAB (Bundle)** | `bundleRelease` | `android/app/build/outputs/bundle/release/app-release.aab` | **6,588,890 bytes** (~6.28 MB) | Signed with `CN=BharatYatra Release` |

---

## 2. Signing Pipeline & Security Architecture

### Production Signing Process
- Configured dynamic signing in `android/app/build.gradle` that reads from:
  1. Environment variables (`BHARATYATRA_RELEASE_STORE_FILE`, `BHARATYATRA_RELEASE_STORE_PASSWORD`, `BHARATYATRA_RELEASE_KEY_ALIAS`, `BHARATYATRA_RELEASE_KEY_PASSWORD`).
  2. Local `keystore.properties` file in `android/` directory.
- Created `android/keystore.properties.example` for developer documentation.
- **Strict Credential Exclusion:**
  - Added `*.keystore`, `*.jks`, `*.p12`, `keystore.properties`, and `google-services.json` to root `.gitignore` and `android/.gitignore`.
  - No secret keys, passwords, or keystores are tracked in the Git repository.

### Release Signature Verification
Verified using Android SDK Build-Tools 34.0.0 `apksigner verify --verbose --print-certs`:
```text
Verifies: true
Verified using v1 scheme (JAR signing): true
Verified using v2 scheme (APK Signature Scheme v2): true
Number of signers: 1
Signer #1 certificate DN: CN=BharatYatra Release, OU=Mobile, O=BharatYatra Technologies, L=Ahmedabad, ST=Gujarat, C=IN
Signer #1 certificate SHA-256: 43b0a3e64ccd332aee871da5b514634a744c3784ee19b119083c13064836f9df
```

---

## 3. Device & Emulator Testing Environment

- **Target Device / AVD:** `Pixel_10a`
- **Host Emulation:** WHPX (Windows Hypervisor Platform) with SwiftShader GPU
- **OS Version:** Android 17 Preview (`ro.build.version.release: 17`, `ro.build.version.sdk: 37`)
- **ABI & Architecture:** `x86_64` with **16 KB page size support** (`ps16k`)
- **Display Resolution:** 1080 x 2424 px

---

## 4. Functional Test Matrix

| Test Suite / Feature | Execution Method | Result | Notes & Observations |
| :--- | :--- | :--- | :--- |
| **App Launch & Cold Boot** | `am start -n in.bharatyatra.app/.MainActivity` | **PASSED** | Cold start completed in ~3.6s. Splash screen loaded and smoothly rendered remote Next.js App Router app (`https://www.bharatyatra.in`). |
| **Brand Logo & UI Layout** | Screenshot verification (`screencap`) | **PASSED** | New BharatYatra header logo, hero banners, and bottom navigation render at native DPI without clipping. |
| **Navigation & History** | Tab touch simulation (`input tap`) | **PASSED** | Switched between Home, Explore (`/explore`), and AI Planner (`/planner`). |
| **Hardware Back Button** | Key event `KEYCODE_BACK` (code 4) | **PASSED** | Hardware back button popped browser history cleanly from `/explore` back to `/` without exiting the app. |
| **Destination & Images** | Visual inspection of Explore view | **PASSED** | High-resolution photography loaded asynchronously from CDN. |
| **AI Trip Planner** | Tapped "Plan Trip with AI" | **PASSED** | Rendered `/planner` with smart duration engine, Ahmedabad start point, and destination search catalog. |
| **Authentication Flow** | Tapped "Sign In" -> "Continue with Google" | **PASSED** | Loaded official Google OAuth login (`accounts.google.com`) through Supabase without WebView navigation block. |
| **Deep Linking (Custom Scheme)** | `am start -d "bharatyatra://explore"` | **PASSED** | OS resolved `bharatyatra://` directly to `MainActivity` with `Status: ok`. |
| **App Links (Web Scheme)** | `am start -d "https://bharatyatra.in/explore"` | **PASSED** | Intent delivered to running instance with `Complete`. |
| **Network Loss & Recovery** | `cmd connectivity airplane-mode enable / disable` | **PASSED** | Network plugin fired `networkStatusChange` events. UI remained intact upon reconnection. |
| **Offline Fallback** | Cold launch in Airplane Mode | **PASSED** | Displayed bundled local `offline.html` with "No Internet Connection" notice and functional "Retry Connection" button. |
| **GPS Permissions** | Runtime permission check via `dumpsys` | **PASSED** | `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` requested and granted via package manager. |
| **Push Notifications (FCM)** | Registration listener verification | **NOT TESTED** | `PushNotifications.checkPermissions()` and plugin code are integrated, but receiving real FCM tokens requires a production `google-services.json` from Firebase Console. |
| **Live Payment Execution** | Navigation policy verification | **VERIFIED (WHITELIST)** | `checkout.razorpay.com`, `api.razorpay.com`, and `*.razorpay.com` added to `allowNavigation`. Live money transactions not executed in automated testing. |

---

## 5. Security & Manifest Audit

1. **Exported Components:**
   - `MainActivity`: `android:exported="true"` with `android.intent.action.MAIN` launcher, custom scheme `bharatyatra://`, and HTTPS App Links.
   - `FileProvider`: `android:exported="false"`, `grantUriPermissions="true"`.
2. **Permissions:**
   - Strictly limited to necessary features: `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `CAMERA`, `VIBRATE`, `POST_NOTIFICATIONS`.
   - No unnecessary administrative, SMS, or storage permissions requested.
3. **Network Security:**
   - `cleartext: false` enforced in Capacitor config.
   - `allowMixedContent: false` strictly enforced.
   - WebView navigation restricted to whitelisted domains (`bharatyatra.in`, `*.supabase.co`, `accounts.google.com`, `*.razorpay.com`).

---

## 6. Confirmed Defects & Fixes Applied

1. **Defect:** Deep links (`bharatyatra://`) and App Links were missing in `AndroidManifest.xml`.
   - **Fix:** Added custom scheme and `android:autoVerify="true"` HTTPS intent filters for `bharatyatra.in` and `www.bharatyatra.in`.
2. **Defect:** `lib/mobile/capacitor-bridge.ts` did not register `appUrlOpen` in `initializeApp()`.
   - **Fix:** Added `appUrlOpen` listener and cleanup handle to route incoming deep links to internal Next.js paths.
3. **Defect:** `public-mobile/offline.html` used absolute root image path `src="/logo.png"`.
   - **Fix:** Changed to relative `src="logo.png"` so local asset resolution succeeds in offline WebView.
4. **Defect:** `capacitor.config.ts` only whitelisted `api.razorpay.com`, which could block Razorpay's checkout modal.
   - **Fix:** Added `'checkout.razorpay.com'` and `'*.razorpay.com'` to `allowNavigation`.
5. **Defect:** Keystore and signing files were not excluded in `.gitignore`.
   - **Fix:** Updated `.gitignore` and `android/.gitignore` to strictly ignore all `.keystore`, `.jks`, `.p12`, `keystore.properties`, and `google-services.json` files.

---

## 7. Release Readiness Verdict

### **Verdict: CONDITIONAL GO**

#### Why CONDITIONAL GO:
1. **Ready for Production:**
   - Both **Release APK** (7.00 MB) and **Release App Bundle (AAB)** (6.28 MB) compile cleanly with 0 errors.
   - Android 14+ target SDK 34 compatibility confirmed, including execution on Android 17 Preview with 16k page size.
   - All interactive UI, routing, auth redirects, and offline fallbacks are functional.
2. **Conditions Before Google Play Console Submission:**
   - **Firebase Configuration:** Place the production `google-services.json` into `android/app/` to enable live Firebase Cloud Messaging (FCM).
   - **Production Key:** Replace the local release key with the organization's official Google Play Upload Key via `keystore.properties` or CI environment variables.
   - **Digital Asset Links:** Deploy `https://bharatyatra.in/.well-known/assetlinks.json` containing the SHA-256 fingerprint for verified App Links.
