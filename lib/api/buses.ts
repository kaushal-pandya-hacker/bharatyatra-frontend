import { apiFetch } from './client';

export interface BusSearchResult {
  id: string;
  operator: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  duration: string;
  price: number;
  availableSeats: number;
  rating: number;
  isGSRTC?: boolean;
}

export async function fetchBuses(origin: string, destination: string, travelDate?: string): Promise<BusSearchResult[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: BusSearchResult[] }>(
      `/buses/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelDate=${encodeURIComponent(travelDate || '')}`
    );
    return res.data || [];
  } catch (err) {
    console.warn('Backend API fetchBuses unavailable, using fallback data:', err);
    return [];
  }
}

export async function fetchBusSeatLayout(busId: string): Promise<any> {
  try {
    const res = await apiFetch<{ success: boolean; data: any }>(`/buses/${busId}/seat-layout`);
    return res.data;
  } catch (err) {
    console.warn('Backend API fetchBusSeatLayout unavailable:', err);
    return null;
  }
}
