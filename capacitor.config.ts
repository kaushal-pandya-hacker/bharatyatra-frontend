import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.bharatyatra.app',
  appName: 'BharatYatra',
  webDir: 'public-mobile',
  server: {
    // Production remote delivery URL: Loads the live Next.js App Router application
    url: 'https://www.bharatyatra.in',
    cleartext: false,
    // Native fallback path inside public/ when remote URL fails to load
    errorPath: 'offline.html',
    allowNavigation: [
      'bharatyatra.in',
      'www.bharatyatra.in',
      '*.bharatyatra.in',
      '*.supabase.co',
      'accounts.google.com',
      'api.razorpay.com',
      'checkout.razorpay.com',
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0F172A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFFFF',
    },
  },
};

export default config;

