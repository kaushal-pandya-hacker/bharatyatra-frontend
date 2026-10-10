import { apiFetch } from './client';
import { Trip } from '@/types/trip';

export async function getUserTrips(): Promise<Trip[]> {
  return apiFetch<Trip[]>('/trips');
}

export async function getTripById(tripId: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${tripId}`);
}
