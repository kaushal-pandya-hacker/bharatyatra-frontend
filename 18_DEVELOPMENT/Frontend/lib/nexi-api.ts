// BHARAT YATRA — NEXI AI 24/7 ASSISTANT CLIENT API SDK

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '');

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || localStorage.getItem('bharatyatra_auth_token');
}

export interface NexiChatResponse {
  success: boolean;
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/nexi/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, conversationId }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'NEXI AI is temporarily unavailable.');
  }

  return res.json();
}

export async function fetchNexiConversations() {
  const token = getAuthToken();
  if (!token) return { success: false, conversations: [] };

  const res = await fetch(`${API_BASE}/nexi/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return { success: false, conversations: [] };
  return res.json();
}
