import { apiFetch } from './client';

export interface UserProfileData {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePhoto?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  homeCity?: string;
}

export interface TravelerData {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  documentType?: string;
  documentNumber?: string;
  isSelf?: boolean;
  createdAt?: string;
}

export interface SavedDestinationData {
  id: string;
  savedAt: string;
  destination: any;
}

export interface UserPreferencesData {
  userId?: string;
  preferredLanguage?: string;
  dietaryPreference?: string;
  budgetTier?: string;
  travelPace?: string;
  interests?: string[];
}

export const userDataApi = {
  // Account Overview
  async getMe() {
    return apiFetch<{ success: boolean; data: any }>('/me');
  },

  // Profile
  async getProfile() {
    return apiFetch<{ success: boolean; data: UserProfileData }>('/me/profile');
  },
  async updateProfile(profile: Partial<UserProfileData>) {
    return apiFetch<{ success: boolean; data: UserProfileData }>('/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
  },

  // Travelers
  async getTravelers() {
    return apiFetch<{ success: boolean; data: TravelerData[] }>('/me/travelers');
  },
  async createTraveler(traveler: TravelerData) {
    return apiFetch<{ success: boolean; data: TravelerData }>('/me/travelers', {
      method: 'POST',
      body: JSON.stringify(traveler),
    });
  },
  async updateTraveler(id: string, traveler: Partial<TravelerData>) {
    return apiFetch<{ success: boolean; data: TravelerData }>(`/me/travelers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(traveler),
    });
  },
  async deleteTraveler(id: string) {
    return apiFetch<{ success: boolean; message: string }>(`/me/travelers/${id}`, {
      method: 'DELETE',
    });
  },

  // Saved Destinations
  async getSavedDestinations() {
    return apiFetch<{ success: boolean; data: SavedDestinationData[] }>('/me/saved-destinations');
  },
  async saveDestination(destinationId: string) {
    return apiFetch<{ success: boolean; data: any }>('/me/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ destinationId }),
    });
  },
  async removeSavedDestination(destinationId: string) {
    return apiFetch<{ success: boolean; message: string }>(`/me/saved-destinations/${destinationId}`, {
      method: 'DELETE',
    });
  },

  // Preferences
  async getPreferences() {
    return apiFetch<{ success: boolean; data: UserPreferencesData }>('/me/preferences');
  },
  async updatePreferences(preferences: Partial<UserPreferencesData>) {
    return apiFetch<{ success: boolean; data: UserPreferencesData }>('/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  },

  // Trips
  async getTrips() {
    return apiFetch<{ success: boolean; data: any[] }>('/me/trips');
  },
  async createTrip(tripData: any) {
    return apiFetch<{ success: boolean; data: any }>('/me/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },
  async getTripById(id: string) {
    return apiFetch<{ success: boolean; data: any }>(`/me/trips/${id}`);
  },
  async updateTrip(id: string, tripData: any) {
    return apiFetch<{ success: boolean; data: any }>(`/me/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(tripData),
    });
  },
  async deleteTrip(id: string) {
    return apiFetch<{ success: boolean; message: string }>(`/me/trips/${id}`, {
      method: 'DELETE',
    });
  },

  // Bookings
  async getBookings() {
    return apiFetch<{ success: boolean; data: any[] }>('/me/bookings');
  },
  async getBookingById(id: string) {
    return apiFetch<{ success: boolean; data: any }>(`/me/bookings/${id}`);
  },
};
