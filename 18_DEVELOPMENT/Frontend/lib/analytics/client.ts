/**
 * Chalo Farva Frontend Analytics Client SDK v1.1
 * Provides non-blocking first-party event tracking, anonymous session management, and failure isolation.
 */

export interface TrackOptions {
  page?: string;
  source?: string;
  campaign?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  };
  properties?: Record<string, any>;
}

class AnalyticsClient {
  private anonymousId: string = '';
  private sessionId: string = '';
  private userId: string | null = null;
  private apiEndpoint: string = '/api/v1/analytics/events';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAnonymousIdentity();
      this.initSession();
    }
  }

  private initAnonymousIdentity() {
    try {
      let storedId = localStorage.getItem('cf_anon_id');
      if (!storedId) {
        storedId = `anon-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        localStorage.setItem('cf_anon_id', storedId);
      }
      this.anonymousId = storedId;
    } catch {
      this.anonymousId = `anon-temp-${Date.now()}`;
    }
  }

  private initSession() {
    try {
      let currentSession = sessionStorage.getItem('cf_session_id');
      if (!currentSession) {
        currentSession = `sess-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        sessionStorage.setItem('cf_session_id', currentSession);
      }
      this.sessionId = currentSession;
    } catch {
      this.sessionId = `sess-temp-${Date.now()}`;
    }
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public track(eventName: string, options?: TrackOptions) {
    if (typeof window === 'undefined') return;

    const payload = {
      eventId: `evt-fe-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      eventType: eventName,
      eventVersion: '1.1',
      userId: this.userId || undefined,
      anonymousId: this.anonymousId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      platform: 'WEB',
      deviceType: this.detectDeviceType(),
      appVersion: '1.1.0',
      page: options?.page || window.location.pathname,
      source: options?.source || document.referrer || 'direct',
      campaign: options?.campaign,
      properties: options?.properties || {},
    };

    // Non-blocking fire and forget telemetry push
    setTimeout(() => {
      fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Silently swallow network failures so main user journey is never disrupted
      });
    }, 0);
  }

  private detectDeviceType(): string {
    if (typeof window === 'undefined') return 'DESKTOP';
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'MOBILE';
    if (/tablet|ipad/i.test(ua)) return 'TABLET';
    return 'DESKTOP';
  }
}

export const analytics = new AnalyticsClient();
