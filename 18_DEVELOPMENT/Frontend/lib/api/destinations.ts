import { apiFetch } from './client';
import { GUJARAT_DESTINATIONS, Destination } from '../data/destinations';

export async function fetchDestinations(query?: { region?: string; search?: string }): Promise<Destination[]> {
  try {
    const params = new URLSearchParams();
    if (query?.region) params.append('region', query.region);
    if (query?.search) params.append('search', query.search);

    const res = await apiFetch<{ success: boolean; data: Destination[] }>(`/destinations?${params.toString()}`);
    if (res && res.data && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend API fetchDestinations unavailable, falling back to local metadata:', err);
  }
  
  // Local fallback dataset matching Stitch specification
  if (query?.search) {
    return GUJARAT_DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(query.search!.toLowerCase()) ||
        d.region.toLowerCase().includes(query.search!.toLowerCase())
    );
  }
  return GUJARAT_DESTINATIONS;
}

export async function fetchDestinationBySlug(slug: string): Promise<Destination | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: Destination }>(`/destinations/${slug}`);
    if (res && res.data) return res.data;
  } catch (err) {
    console.warn(`Backend API fetchDestinationBySlug(${slug}) unavailable, using local metadata:`, err);
  }
  return GUJARAT_DESTINATIONS.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
}
