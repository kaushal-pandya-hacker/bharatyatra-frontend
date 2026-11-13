'use client';

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

/**
 * BharatYatra Native Mobile Bridge
 * Enables seamless communication between the remote Next.js application
 * and native iOS / Android hardware capabilities.
 */
export class CapacitorMobileBridge {
  private static isInitialized = false;

  /**
   * Returns true if the application is currently running inside
   * an Android APK or iOS native shell.
   */
  public static isNative(): boolean {
    return typeof window !== 'undefined' && Capacitor.isNativePlatform();
  }

  /**
   * Returns the native platform: 'android', 'ios', or 'web'.
   */
  public static getPlatform(): 'android' | 'ios' | 'web' {
    if (typeof window === 'undefined') return 'web';
    return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
  }

  /**
   * Initializes native app lifecycle, status bar styling, and back button handlers.
   */
  public static async initializeApp(): Promise<void> {
    if (!this.isNative() || this.isInitialized) return;
    this.isInitialized = true;

    try {
      // 1. Configure Native Status Bar
      await StatusBar.setStyle({ style: Style.Dark });
      if (this.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      }

      // 2. Android Hardware Back Button Handling
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          // If on root page, exit or minimize
          App.exitApp();
        }
      });

      // 3. App State Change Listener (Resume / Pause)
      App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          // Trigger any session refresh or network re-check on app foreground
          window.dispatchEvent(new CustomEvent('bharatyatra:app-resumed'));
        }
      });
    } catch (err) {
      console.warn('[CapacitorMobileBridge] Failed during core initialization:', err);
    }
  }

  /**
   * Registers for Native Push Notifications (FCM on Android, APNs on iOS).
   * Sends the native device token to the BharatYatra backend.
   */
  public static async registerPushNotifications(
    onTokenReceived?: (token: string) => void
  ): Promise<boolean> {
    if (!this.isNative()) return false;

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('[CapacitorMobileBridge] Push notification permission not granted.');
        return false;
      }

      await PushNotifications.register();

      // Listen for registration token
      PushNotifications.addListener('registration', (token) => {
        console.log('[CapacitorMobileBridge] Push Registration Token:', token.value);
        if (onTokenReceived) {
          onTokenReceived(token.value);
        }
        // Send token to server endpoint
        fetch('/api/v1/notifications/push/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token.value,
            platform: this.getPlatform(),
          }),
        }).catch(() => {});
      });

      // Listen for notification taps (Deep Linking)
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        const data = notification.notification.data;
        const targetUrl = data?.url || data?.deepLink;
        if (targetUrl && typeof window !== 'undefined') {
          window.location.href = targetUrl;
        }
      });

      return true;
    } catch (err) {
      console.error('[CapacitorMobileBridge] Push registration failed:', err);
      return false;
    }
  }

  /**
   * Gets current GPS coordinates with native high accuracy.
   */
  public static async getCurrentPosition(): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    if (!this.isNative()) {
      // Browser Geolocation fallback
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 10000, enableHighAccuracy: true }
          );
        });
      }
      return null;
    }

    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') return null;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err) {
      console.warn('[CapacitorMobileBridge] GPS coordinates retrieval failed:', err);
      return null;
    }
  }

  /**
   * Triggers native tactile haptic feedback.
   */
  public static async triggerHaptic(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    if (!this.isNative()) return;
    try {
      await Haptics.impact({ style });
    } catch {}
  }

  /**
   * Monitors live network connectivity changes.
   */
  public static addNetworkListener(callback: (status: ConnectionStatus) => void) {
    if (!this.isNative()) return () => {};
    const handle = Network.addListener('networkStatusChange', callback);
    return () => {
      handle.then((h) => h.remove());
    };
  }

  /**
   * Opens an external link safely in the device system browser or external app
   * rather than replacing the authenticated Capacitor WebView.
   */
  public static openExternalUrl(url: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.open(url, '_system');
    } catch {
      window.location.href = url;
    }
  }

  /**
   * Caches an itinerary and travel pass in device local storage for
   * offline access during travel in low-connectivity areas (e.g. Kutch, Gir).
   */
  public static cacheTripOffline(tripId: string, tripData: any): void {
    if (typeof window === 'undefined') return;
    try {
      const key = `by_offline_trip_${tripId}`;
      const payload = {
        savedAt: new Date().toISOString(),
        trip: tripData,
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (err) {
      console.warn('[CapacitorMobileBridge] Failed to cache trip offline:', err);
    }
  }

  /**
   * Retrieves a cached offline itinerary when the device is disconnected.
   */
  public static getOfflineTrip(tripId: string): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = `by_offline_trip_${tripId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

