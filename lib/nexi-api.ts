// BHARAT YATRA — NEXI AI 24/7 ASSISTANT CLIENT API SDK

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:4000/api/v1';
    }
    return `${window.location.origin}/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || localStorage.getItem('bharatyatra_auth_token');
}

export interface NexiChatResponse {
  success: boolean;
  intent?: string;
  conversationId: string;
  message: string;
  actions?: Array<{
    type: 'OPEN_TRIP' | 'OPEN_BOOKING' | 'OPEN_PROFILE' | 'OPEN_MAP' | 'OPEN_PLANNER' | 'CONFIRM_PROFILE_UPDATE' | 'OPEN_PAYMENT_PAGE';
    label?: string;
    payload?: any;
  }>;
}

export async function sendNexiChatMessage(message: string, conversationId?: string): Promise<NexiChatResponse> {
  const token = getAuthToken();
  const apiBase = getApiBaseUrl();

  const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-correlation-id': correlationId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${apiBase}/nexi/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, conversationId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const lowerMsg = message.toLowerCase();
      const isPaymentOrRefundQuery =
        lowerMsg.includes('paid') ||
        lowerMsg.includes('payment') ||
        lowerMsg.includes('bus') ||
        lowerMsg.includes('confirm') ||
        lowerMsg.includes('paisa') ||
        lowerMsg.includes('ticket') ||
        lowerMsg.includes('refund') ||
        lowerMsg.includes('refunds') ||
        lowerMsg.includes('cancel') ||
        lowerMsg.includes('money');

      if (isPaymentOrRefundQuery) {
        return {
          success: false,
          conversationId: conversationId || `conv_error_${Date.now()}`,
          message: lowerMsg.includes('refund')
            ? "I’m unable to connect to the booking and refund service right now. Your request has not been verified yet. Please don’t submit duplicate refund requests. I can check your refund eligibility once the service is online."
            : "I’m unable to connect to the booking service right now. Your payment status has not yet been verified. Please don’t pay again. I can check the booking status once the service is available.",
          actions: [
            {
              type: 'OPEN_BOOKING',
              label: 'Check My Bookings',
            }
          ]
        };
      }

      return {
        success: false,
        conversationId: conversationId || `conv_error_${Date.now()}`,
        message: errorJson.message || "NEXI AI is temporarily unavailable. Please try again shortly.",
        actions: []
      };
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);

    const lower = message.toLowerCase();
    const isPaymentOrRefundQuery =
      lower.includes('paid') ||
      lower.includes('payment') ||
      lower.includes('bus') ||
      lower.includes('confirm') ||
      lower.includes('paisa') ||
      lower.includes('ticket') ||
      lower.includes('refund') ||
      lower.includes('refunds') ||
      lower.includes('cancel') ||
      lower.includes('money');

    return {
      success: false,
      conversationId: conversationId || `conv_offline_${Date.now()}`,
      message: isPaymentOrRefundQuery
        ? lower.includes('refund')
          ? "I’m unable to connect to the refund service right now. Your booking status cannot be retrieved offline. Please try again once the network connection is restored."
          : "I’m unable to connect to the booking service right now. Your payment status has not yet been verified. Please don’t pay again. I can check the booking status once the service is available."
        : "Unable to connect to NEXI AI servers right now. Please check your network connection or try again shortly.",
      actions: [
        {
          type: 'OPEN_BOOKING',
          label: 'Check My Bookings',
        }
      ]
    };
  }
}

export async function fetchNexiConversations() {
  const token = getAuthToken();
  if (!token) return { success: false, conversations: [] };

  const apiBase = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${apiBase}/nexi/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { success: false, conversations: [] };
    return await res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    return { success: false, conversations: [] };
  }
}
