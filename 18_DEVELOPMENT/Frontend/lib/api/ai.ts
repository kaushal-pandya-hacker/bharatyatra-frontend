import { apiFetch } from './client';
import { AdaptationProposal } from '@/types/ai';

export async function generateAITrip(payload: Record<string, unknown>): Promise<{ tripId: string }> {
  return apiFetch<{ tripId: string }>('/ai/trips/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function respondToProposal(proposalId: string, decision: 'ACCEPTED' | 'REJECTED'): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/adaptive-ai/proposals/${proposalId}/decide`, {
    method: 'POST',
    body: JSON.stringify({ decision }),
  });
}
