# BHARATYATRA — PHASE 2.3: ANDROID TEST BUILD PREPARATION REPORT

**Document ID:** BY-ENG-BUILD-P2.3-001  
**Project:** BharatYatra (Cross-Platform Transformation)  
**Website:** [https://www.bharatyatra.in](https://www.bharatyatra.in)  
**Package ID:** `in.bharatyatra.app`  
**Application Name:** `BharatYatra`  
**Build Variant:** `debug`  
**Author:** Senior Android Build Engineer  
**Date:** November 13, 2026  
**Build Result:** **SUCCESSFUL**  
**Phase 2.3 Verdict:** **READY FOR DEVICE VALIDATION**

---

## EXECUTIVE SUMMARY & AUDIT VERDICT

| Category | Finding | Status |
|---|---|---|
| **Debug APK Build Status** | `BUILD SUCCESSFUL in 2m 59s` (264 actionable tasks executed) | ✅ Passed |
| **Java Environment** | Microsoft OpenJDK 17 LTS (`build 17.0.21.0.2+1-LTS`) | ✅ Compatible & Active |
| **Gradle Wrapper** | Gradle 8.2.1 (`gradle-8.2.1-all.zip`) | ✅ Standard LTS |
| **Android Gradle Plugin (AGP)** | `com.android.tools.build:gradle:8.2.1` | ✅ Standard LTS |
| **Target SDK / Build Tools** | Android SDK Platform 34 (Android 14) / Build-Tools `34.0.0` | ✅ Installed & Verified |
| **Generated APK Location** | `android/app/build/outputs/apk/debug/app-debug.apk` | ✅ Verified on Disk |
| **Generated APK Size** | `449,271,534 bytes` (~428.46 MB) | ✅ Verified on Disk |
| **Device Testing Status** | **Pending User Confirmation** (AVD `Pixel_10a` detected) | ⏸️ Awaiting Approval |

---

## 1. JAVA VERSION & RESOLUTION

- **Detected System Default:** Android Studio bundled JBR was OpenJDK `25.0.3` (bytecode major version 69), which causes Gradle 8.2.1 / Groovy build failures.
- **Resolution Applied:** Installed **Microsoft OpenJDK 17 LTS** via `winget install --id Microsoft.OpenJDK.17`.
- **Active JDK Path:** `C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot`
- **Exact Java Version:**
  ```text
  openjdk version "17.0.21.0.2" 2026-10-22 LTS
  OpenJDK Runtime Environment Microsoft-15779939 (build 17.0.21.0.2+1-LTS)
  OpenJDK 64-Bit Server VM Microsoft-15779939 (build 17.0.21.0.2+1-LTS, mixed mode, sharing)
  ```
- **Result:** Provides 100% stable compatibility with Gradle 8.2.1 and Android Gradle Plugin 8.2.1.

---

## 2. GRADLE VERSION

- **Gradle Distribution:** `https://services.gradle.org/distributions/gradle-8.2.1-all.zip`
- **Gradle Version:** `8.2.1`
- **Kotlin DSL / Groovy Version:** Kotlin 1.8.20 / Groovy 3.0.17
- **Verification Output:**
  ```text
  ------------------------------------------------------------
  Gradle 8.2.1
  ------------------------------------------------------------
  Build time:   2023-07-10 12:12:35 UTC
  Revision:     a38ec64d3c4612da9083cc506a1ccb212afeecaa
  JVM:          17.0.21.0.2 (Microsoft 17.0.21.0.2+1-LTS)
  OS:           Windows 11 10.0 amd64
  ```

---

## 3. ANDROID GRADLE PLUGIN VERSION & SDK DEPENDENCIES

- **Top-Level Build File (`android/build.gradle`):**
  - `com.android.tools.build:gradle:8.2.1`
  - `com.google.gms:google-services:4.4.0`
- **App Module (`android/app/build.gradle`):**
  - `namespace`: `in.bharatyatra.app`
  - `compileSdk`: `34`
  - `minSdkVersion`: `22` (Covers >98% of active Android devices in India)
  - `targetSdkVersion`: `34` (Android 14)
  - `versionCode`: `1`
  - `versionName`: `"1.0"`
- **Android SDK Components Auto-Installed & Verified:**
  - Android SDK Build-Tools `34.0.0`
  - Android SDK Platform `android-34` (revision 3)
  - Android SDK Directory: `C:\Users\Pandya Kaushal\AppData\Local\Android\Sdk`

---

## 4. BUILD EXECUTION RESULT

The debug build was executed using PowerShell:
```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
cd "C:\Users\Pandya Kaushal\Desktop\BhartYatra_6\android"
.\gradlew.bat assembleDebug
```

### Build Log Summary:
- **Duration:** 2 minutes 59 seconds
- **Tasks Executed:** 264 actionable tasks (264 executed, 0 failed)
- **Status:** **`BUILD SUCCESSFUL in 2m 59s`**
- **Output Artifacts Generated:**
  - `android/app/build/outputs/apk/debug/app-debug.apk`
  - `android/app/build/outputs/apk/debug/output-metadata.json`

---

## 5. GENERATED APK DETAILS

| Attribute | Specification |
|---|---|
| **File Name** | `app-debug.apk` |
| **Full File Path** | `C:\Users\Pandya Kaushal\Desktop\BhartYatra_6\android\app\build\outputs\apk\debug\app-debug.apk` |
| **Exact File Size** | `449,271,534 bytes` (428.46 MB) |
| **Application ID** | `in.bharatyatra.app` |
| **Variant** | `debug` |
| **Version Code** | `1` |
| **Version Name** | `1.0` |
| **Build Signature** | Android Debug Keystore |

### Why the APK is ~428 MB:
Capacitor copies the entire Next.js `public/` directory into `android/app/src/main/assets/public/`. BharatYatra contains extensive high-resolution regional photography (`public/state-images/`, `public/places/`, etc.) that are bundled into this debug build. For production release, high-resolution imagery can be served via CDN to reduce the binary download size to ~15-25 MB.

---

## 6. DEVICE TESTING STATUS

- **Status:** **PENDING EXPLICIT USER CONFIRMATION**
- **Safety Compliance:** In strict adherence to Task 6 ("Install or launch the debug APK on an available emulator/device only with explicit confirmation"), the APK was **not** installed or launched automatically.
- **Available Hardware / Virtual Devices Detected:**
  - `C:\Users\Pandya Kaushal\AppData\Local\Android\Sdk\emulator\emulator.exe -list-avds` identified:
    **`Pixel_10a`** Android Virtual Device (AVD).
- **Execution Protocol Ready (Awaiting User Command):**
  1. Boot AVD: `& "C:\Users\Pandya Kaushal\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Pixel_10a`
  2. Install APK: `& "C:\Users\Pandya Kaushal\AppData\Local\Android\Sdk\platform-tools\adb.exe" install "android\app\build\outputs\apk\debug\app-debug.apk"`
  3. Launch Intent: `& "C:\Users\Pandya Kaushal\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell am start -n in.bharatyatra.app/.MainActivity`
  4. Perform verification checklist:
     - [ ] App launches and splash screen renders (`#0F172A`).
     - [ ] Canonical home page (`https://www.bharatyatra.in`) loads.
     - [ ] Supabase authentication & login flow functions.
     - [ ] Bottom mobile navigation operates smoothly.
     - [ ] GPS permission prompt triggers and returns location.
     - [ ] Airplane mode triggers offline screen with retry functionality.

---

## 7. REMAINING ISSUES & PRODUCTION RECOMMENDATIONS

1. **Production Assets Optimization:**  
   The current APK includes ~428 MB of public assets. Before building the production Google Play App Bundle (`.aab`), configure asset exclusion so media loads dynamically from the Vercel CDN.
2. **Push Notifications Firebase Config:**  
   Live push notifications require obtaining `google-services.json` from the Firebase Console and placing it in `android/app/`.
3. **Production Signing Keystore:**  
   This debug APK is signed with the standard Android debug key. Release builds will require generating a private production keystore and configuring signing configs in `android/app/build.gradle`.

---

## 8. PRODUCTION READINESS VERDICT

**READY FOR DEVICE VALIDATION**

The Android build toolchain, SDK dependencies, Gradle wrapper, and Java 17 runtime have been completely harmonized and verified. The debug APK exists on disk and is ready for installation onto the `Pixel_10a` emulator or a connected physical Android device upon user confirmation.

