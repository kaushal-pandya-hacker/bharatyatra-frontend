// BHARAT YATRA — WEB PUSH NOTIFICATION CLIENT SDK
// Provides browser permission management, service worker registration, VAPID subscription, and device management.

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface PushDevice {
  id: string;
  deviceType: string;
  browser: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
}

export interface NotificationPreferences {
  tripReminders: boolean;
  bookingUpdates: boolean;
  tripUpdates: boolean;
  aiUpdates: boolean;
  marketing: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

// Convert VAPID public key string to Uint8Array
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if Push Notifications are supported in current browser
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Get current permission state
export function getPermissionState(): PermissionState {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission as PermissionState;
}

// Register service worker safely
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('[WebPush] Service Worker registration failed:', error);
    return null;
  }
}

// Fetch VAPID public key from backend or fallback to env
export async function getVapidPublicKey(): Promise<string> {
  const envKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (envKey) return envKey;

  try {
    const res = await fetch(`${API_BASE}/notifications/push/vapid-public-key`);
    if (res.ok) {
      const data = await res.json();
      return data.publicKey;
    }
  } catch (e) {
    console.warn('[WebPush] Failed to fetch VAPID key from API:', e);
  }

  // Fallback public key matching default VAPID pair
  return 'BApbADPRNeXRqYEZg6FqX9vEQQsj6xNGjbvnQvW8RGkNroxdrZLqa1zE_viOflnvTiaCMdh_qUrXEnRyPgksglA';
}

// Request permission and subscribe browser for Web Push
export async function subscribeToPush(userId?: string): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications are not supported by your browser.' };
  }

  // Request browser permission explicitly
  const permission = await Notification.requestPermission();

  if (permission === 'denied') {
    return { success: false, error: 'Notifications are blocked in your browser. Please enable them in site settings.' };
  }

  if (permission !== 'granted') {
    return { success: false, error: 'Notification permission was not granted.' };
  }

  const swReg = await registerServiceWorker();
  if (!swReg) {
    return { success: false, error: 'Failed to initialize Service Worker.' };
  }

  try {
    const vapidKey = await getVapidPublicKey();
    const convertedKey = urlBase64ToUint8Array(vapidKey);

    // Get existing subscription or create new one
    let subscription = await swReg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as any,
      });
    }

    const subJson = subscription.toJSON();

    // Prepare device metadata
    const userAgent = navigator.userAgent;
    const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : /tablet|ipad/i.test(userAgent) ? 'Tablet' : 'Desktop';
    const browser = /edg/i.test(userAgent)
      ? 'Edge'
      : /chrome|crios/i.test(userAgent)
      ? 'Chrome'
      : /firefox|fxios/i.test(userAgent)
      ? 'Firefox'
      : /safari/i.test(userAgent)
      ? 'Safari'
      : 'Browser';

    // Post subscription to backend API
    const res = await fetch(`${API_BASE}/notifications/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: {
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
        },
        device: {
          userAgent,
          deviceType,
          browser,
        },
        userId: userId || 'usr_customer_demo',
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Backend failed to save push subscription');
    }

    return { success: true };
  } catch (err: any) {
    console.error('[WebPush] Subscription error:', err);
    return { success: false, error: err.message || 'Could not complete push subscription.' };
  }
}

// Unsubscribe current push subscription
export async function unsubscribeFromPush(userId?: string): Promise<{ success: boolean }> {
  if (!isPushSupported()) return { success: false };

  try {
    const swReg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (swReg) {
      const subscription = await swReg.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        await fetch(`${API_BASE}/notifications/push/subscribe`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, userId: userId || 'usr_customer_demo' }),
        });
      }
    }
    return { success: true };
  } catch (e) {
    console.error('[WebPush] Unsubscribe error:', e);
    return { success: false };
  }
}

// Fetch user's registered push devices
export async function fetchConnectedDevices(userId?: string): Promise<PushDevice[]> {
  try {
    const uid = userId || 'usr_customer_demo';
    const res = await fetch(`${API_BASE}/notifications/push/devices?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : Array.isArray(data?.devices) ? data.devices : [];
    }
  } catch (e) {
    console.error('[WebPush] Error fetching devices:', e);
  }
  return [];
}

// Remove a specific device
export async function removeDevice(deviceId: string, userId?: string): Promise<boolean> {
  try {
    const uid = userId || 'usr_customer_demo';
    const res = await fetch(`${API_BASE}/notifications/push/devices/${deviceId}?userId=${uid}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('[WebPush] Error removing device:', e);
    return false;
  }
}

// Fetch notification preferences
export async function fetchPreferences(userId?: string): Promise<NotificationPreferences> {
  try {
    const uid = userId || 'usr_customer_demo';
    const res = await fetch(`${API_BASE}/notifications/preferences?userId=${uid}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('[WebPush] Error fetching preferences:', e);
  }
  return {
    tripReminders: true,
    bookingUpdates: true,
    tripUpdates: true,
    aiUpdates: true,
    marketing: false,
  };
}

// Update notification preferences
export async function updatePreferences(
  prefs: Partial<NotificationPreferences>,
  userId?: string,
): Promise<NotificationPreferences> {
  try {
    const uid = userId || 'usr_customer_demo';
    const res = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prefs, userId: uid }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('[WebPush] Error updating preferences:', e);
  }
  return {
    tripReminders: true,
    bookingUpdates: true,
    tripUpdates: true,
    aiUpdates: true,
    marketing: false,
    ...prefs,
  };
}

// Trigger a test notification
export async function sendTestNotification(userId?: string): Promise<boolean> {
  try {
    const uid = userId || 'usr_customer_demo';
    const res = await fetch(`${API_BASE}/notifications/push/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid }),
    });
    return res.ok;
  } catch (e) {
    console.error('[WebPush] Error sending test notification:', e);
    return false;
  }
}
