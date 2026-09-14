import { apiFetch } from './client';
import { Booking } from '@/types/booking';

export async function getUserBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>('/bookings');
}
