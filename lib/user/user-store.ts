import { getSupabaseClient, getSupabaseServerClient } from '@/lib/supabase/client';

export interface UserProfileRecord {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPLIER' | 'AGENCY';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserTripRecord {
  id: string;
  userId: string;
  title: string;
  destination: string;
  destinationCity?: string;
  originCity?: string;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  travelers: number;
  budgetInr: number;
  status: string;
  routeJson?: any;
  itineraryJson?: any;
  tripContextJson?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserBookingRecord {
  id: string;
  bookingReference: string;
  userId: string;
  bookingType: string;
  inventoryType?: string;
  inventoryId?: string;
  inventoryTitle: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  adultCount: number;
  childCount: number;
  guestCount: number;
  totalAmountInr: number;
  currency: string;
  hotelDetail?: any;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSavedDestinationRecord {
  id: string;
  userId: string;
  destinationId: string;
  destinationName?: string;
  destinationData?: any;
  createdAt: string;
}

export interface UserPreferencesRecord {
  userId: string;
  preferredLanguage: string;
  dietaryPreference?: string;
  budgetTier: string;
  travelPace: string;
  travelStyle: string;
  transport: string[];
  interests: string[];
  originCity: string;
  originState: string;
  originCountry: string;
  typicalTravelers: number;
  updatedAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  adminId: string;
  adminEmail?: string;
  targetUserId?: string;
  action: string;
  details: any;
  ipAddress?: string;
  createdAt: string;
}

/**
 * In-memory fallback and test store for multi-user isolation.
 * Automatically keeps memory clean and isolated per user.
 */
class InMemoryUserDataStore {
  private profiles = new Map<string, UserProfileRecord>();
  private trips = new Map<string, UserTripRecord>();
  private bookings = new Map<string, UserBookingRecord>();
  private savedDestinations = new Map<string, UserSavedDestinationRecord>();
  private preferences = new Map<string, UserPreferencesRecord>();
  private auditLogs: AdminAuditLogRecord[] = [];

  public clearAll() {
    this.profiles.clear();
    this.trips.clear();
    this.bookings.clear();
    this.savedDestinations.clear();
    this.preferences.clear();
    this.auditLogs = [];
  }

  // --- PROFILES ---
  public async getProfile(userId: string): Promise<UserProfileRecord | null> {
    return this.profiles.get(userId) || null;
  }

  public async updateProfile(userId: string, data: Partial<UserProfileRecord>): Promise<UserProfileRecord> {
    const existing = this.profiles.get(userId) || {
      id: userId,
      email: data.email || `${userId}@bharatyatra.in`,
      fullName: data.fullName || 'BharatYatra Traveler',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated: UserProfileRecord = {
      ...existing,
      ...data,
      id: userId, // immutable
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  // --- TRIPS ---
  public async getTrips(userId: string): Promise<UserTripRecord[]> {
    return Array.from(this.trips.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  public async getTripById(tripId: string, userId: string): Promise<UserTripRecord | null> {
    const trip = this.trips.get(tripId);
    if (!trip || trip.userId !== userId) {
      return null; // Strict isolation: return null if not owned by user
    }
    return trip;
  }

  public async saveTrip(userId: string, trip: Partial<UserTripRecord>): Promise<UserTripRecord> {
    const id = trip.id || `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const fullTrip: UserTripRecord = {
      id,
      userId, // Strictly set from authenticated userId
      title: trip.title || 'New BharatYatra Trip',
      destination: trip.destination || 'India',
      destinationCity: trip.destinationCity,
      originCity: trip.originCity,
      startDate: trip.startDate,
      endDate: trip.endDate,
      durationDays: trip.durationDays || 4,
      travelers: trip.travelers || 2,
      budgetInr: trip.budgetInr || 25000,
      status: trip.status || 'SAVED',
      routeJson: trip.routeJson || {},
      itineraryJson: trip.itineraryJson || {},
      tripContextJson: trip.tripContextJson || {},
      createdAt: trip.createdAt || now,
      updatedAt: now,
    };
    this.trips.set(id, fullTrip);
    return fullTrip;
  }

  public async deleteTrip(tripId: string, userId: string): Promise<boolean> {
    const trip = this.trips.get(tripId);
    if (!trip || trip.userId !== userId) {
      return false;
    }
    return this.trips.delete(tripId);
  }

  // --- BOOKINGS ---
  public async getBookings(userId: string): Promise<UserBookingRecord[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  public async getBookingById(bookingId: string, userId: string): Promise<UserBookingRecord | null> {
    const booking = this.bookings.get(bookingId);
    if (!booking || booking.userId !== userId) {
      return null;
    }
    return booking;
  }

  public async createBooking(userId: string, booking: Partial<UserBookingRecord>): Promise<UserBookingRecord> {
    const id = booking.id || `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ref = booking.bookingReference || `BY-HTL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const record: UserBookingRecord = {
      id,
      bookingReference: ref,
      userId, // Strictly enforced
      bookingType: booking.bookingType || 'HOTEL',
      inventoryType: booking.inventoryType || 'HOTEL',
      inventoryId: booking.inventoryId,
      inventoryTitle: booking.inventoryTitle || 'Hotel Reservation',
      status: 'CONFIRMED',
      startDate: booking.startDate,
      endDate: booking.endDate,
      adultCount: booking.adultCount || 2,
      childCount: booking.childCount || 0,
      guestCount: booking.guestCount || 2,
      totalAmountInr: booking.totalAmountInr || 9500,
      currency: booking.currency || 'INR',
      hotelDetail: booking.hotelDetail || {},
      createdAt: now,
      updatedAt: now,
    };
    this.bookings.set(id, record);
    return record;
  }

  public async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<UserBookingRecord | null> {
    const booking = this.bookings.get(bookingId);
    if (!booking || booking.userId !== userId) {
      return null;
    }
    const updated: UserBookingRecord = {
      ...booking,
      status: 'CANCELLED',
      cancellationReason: reason || 'Cancelled by user',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.bookings.set(bookingId, updated);
    return updated;
  }

  // --- SAVED DESTINATIONS ---
  public async getSavedDestinations(userId: string): Promise<UserSavedDestinationRecord[]> {
    return Array.from(this.savedDestinations.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async saveDestination(userId: string, dest: { destinationId: string; name?: string; data?: any }): Promise<UserSavedDestinationRecord> {
    const key = `${userId}:${dest.destinationId}`;
    const record: UserSavedDestinationRecord = {
      id: `saved-${Date.now()}`,
      userId,
      destinationId: dest.destinationId,
      destinationName: dest.name || dest.destinationId,
      destinationData: dest.data || {},
      createdAt: new Date().toISOString(),
    };
    this.savedDestinations.set(key, record);
    return record;
  }

  public async removeSavedDestination(userId: string, destinationId: string): Promise<boolean> {
    const key = `${userId}:${destinationId}`;
    return this.savedDestinations.delete(key);
  }

  // --- PREFERENCES ---
  public async getPreferences(userId: string): Promise<UserPreferencesRecord> {
    const existing = this.preferences.get(userId);
    if (existing) return existing;
    const defaultPrefs: UserPreferencesRecord = {
      userId,
      preferredLanguage: 'en',
      budgetTier: 'moderate',
      travelPace: 'balanced',
      travelStyle: 'balanced',
      transport: ['train', 'bus'],
      interests: ['heritage', 'nature'],
      originCity: 'Ahmedabad',
      originState: 'Gujarat',
      originCountry: 'India',
      typicalTravelers: 2,
      updatedAt: new Date().toISOString(),
    };
    return defaultPrefs;
  }

  public async savePreferences(userId: string, prefs: Partial<UserPreferencesRecord>): Promise<UserPreferencesRecord> {
    const current = await this.getPreferences(userId);
    const updated: UserPreferencesRecord = {
      ...current,
      ...prefs,
      userId, // immutable
      updatedAt: new Date().toISOString(),
    };
    this.preferences.set(userId, updated);
    return updated;
  }

  // --- ADMIN OPERATIONS ---
  public async getAdminUsers(filters: { search?: string; role?: string; status?: string; limit?: number; offset?: number } = {}) {
    let list = Array.from(this.profiles.values());
    if (filters.role) list = list.filter((u) => u.role === filters.role);
    if (filters.status) list = list.filter((u) => u.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((u) => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q));
    }
    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return { users: list.slice(offset, offset + limit), total };
  }

  public async updateUserStatusOrRole(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    updates: { role?: string; status?: string }
  ): Promise<UserProfileRecord | null> {
    const user = this.profiles.get(targetUserId);
    if (!user) return null;

    const updated: UserProfileRecord = {
      ...user,
      ...(updates.role ? { role: updates.role as any } : {}),
      ...(updates.status ? { status: updates.status as any } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(targetUserId, updated);

    await this.logAdminAudit({
      id: `audit-${Date.now()}`,
      adminId,
      adminEmail,
      targetUserId,
      action: 'UPDATE_USER_STATUS_ROLE',
      details: updates,
      createdAt: new Date().toISOString(),
    });

    return updated;
  }

  public async logAdminAudit(log: AdminAuditLogRecord): Promise<void> {
    this.auditLogs.unshift(log);
  }

  public async getAdminAuditLogs(limit = 50): Promise<AdminAuditLogRecord[]> {
    return this.auditLogs.slice(0, limit);
  }
}

/**
 * Singleton instance of the in-memory fallback store
 */
const inMemoryStore = new InMemoryUserDataStore();

/**
 * Universal User Data Store
 * Checks Supabase PostgreSQL first; falls back to in-memory store if tables are unmigrated or in offline tests.
 */
export class UserDataStore {
  public static clearForTesting() {
    inMemoryStore.clearAll();
  }

  // --- PROFILES ---
  public static async getProfile(userId: string): Promise<UserProfileRecord | null> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          fullName: data.full_name || '',
          phoneNumber: data.phone_number || '',
          avatarUrl: data.avatar_url || '',
          role: data.role || 'CUSTOMER',
          status: data.status || 'ACTIVE',
          isPhoneVerified: data.is_phone_verified || false,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.getProfile(userId);
  }

  public static async updateProfile(userId: string, data: Partial<UserProfileRecord>): Promise<UserProfileRecord> {
    try {
      const supabase = getSupabaseServerClient();
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (data.fullName !== undefined) payload.full_name = data.fullName;
      if (data.phoneNumber !== undefined) payload.phone_number = data.phoneNumber;
      if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;
      if (data.email !== undefined) payload.email = data.email;

      const { data: updated, error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (!error && updated) {
        return {
          id: updated.id,
          email: updated.email,
          fullName: updated.full_name,
          phoneNumber: updated.phone_number,
          avatarUrl: updated.avatar_url,
          role: updated.role,
          status: updated.status,
          isPhoneVerified: updated.is_phone_verified,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.updateProfile(userId, data);
  }

  // --- TRIPS ---
  public static async getUserTrips(userId: string): Promise<UserTripRecord[]> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          title: t.title,
          destination: t.destination,
          destinationCity: t.destination_city,
          originCity: t.origin_city,
          startDate: t.start_date,
          endDate: t.end_date,
          durationDays: t.duration_days,
          travelers: t.travelers,
          budgetInr: Number(t.budget_inr || 0),
          status: t.status,
          routeJson: t.route_json,
          itineraryJson: t.itinerary_json,
          tripContextJson: t.trip_context_json,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));
      }
    } catch {}
    return inMemoryStore.getTrips(userId);
  }

  public static async getTripById(tripId: string, userId: string): Promise<UserTripRecord | null> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', userId) // STRICT OWNERSHIP FILTER
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          destination: data.destination,
          destinationCity: data.destination_city,
          originCity: data.origin_city,
          startDate: data.start_date,
          endDate: data.end_date,
          durationDays: data.duration_days,
          travelers: data.travelers,
          budgetInr: Number(data.budget_inr || 0),
          status: data.status,
          routeJson: data.route_json,
          itineraryJson: data.itinerary_json,
          tripContextJson: data.trip_context_json,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.getTripById(tripId, userId);
  }

  public static async saveTrip(userId: string, trip: Partial<UserTripRecord>): Promise<UserTripRecord> {
    const id = trip.id || `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    try {
      const supabase = getSupabaseServerClient();
      const payload = {
        id,
        user_id: userId, // NEVER trust client user_id
        title: trip.title || 'New BharatYatra Trip',
        destination: trip.destination || 'India',
        destination_city: trip.destinationCity || trip.destination || 'India',
        origin_city: trip.originCity || 'Ahmedabad',
        start_date: trip.startDate,
        end_date: trip.endDate,
        duration_days: trip.durationDays || 4,
        travelers: trip.travelers || 2,
        budget_inr: trip.budgetInr || 25000,
        status: trip.status || 'SAVED',
        route_json: trip.routeJson || {},
        itinerary_json: trip.itineraryJson || {},
        trip_context_json: trip.tripContextJson || {},
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_trips')
        .upsert(payload)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          destination: data.destination,
          destinationCity: data.destination_city,
          originCity: data.origin_city,
          startDate: data.start_date,
          endDate: data.end_date,
          durationDays: data.duration_days,
          travelers: data.travelers,
          budgetInr: Number(data.budget_inr || 0),
          status: data.status,
          routeJson: data.route_json,
          itineraryJson: data.itinerary_json,
          tripContextJson: data.trip_context_json,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.saveTrip(userId, trip);
  }

  public static async deleteTrip(tripId: string, userId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseServerClient();
      const { error } = await supabase
        .from('user_trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', userId);

      if (!error) return true;
    } catch {}
    return inMemoryStore.deleteTrip(tripId, userId);
  }

  // --- BOOKINGS ---
  public static async getUserBookings(userId: string): Promise<UserBookingRecord[]> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((b: any) => ({
          id: b.id,
          bookingReference: b.booking_reference,
          userId: b.user_id,
          bookingType: b.booking_type,
          inventoryType: b.inventory_type,
          inventoryId: b.inventory_id,
          inventoryTitle: b.inventory_title,
          status: b.status,
          startDate: b.start_date,
          endDate: b.end_date,
          adultCount: b.adult_count,
          childCount: b.child_count,
          guestCount: b.guest_count,
          totalAmountInr: Number(b.total_amount_inr || 0),
          currency: b.currency,
          hotelDetail: b.hotel_detail,
          cancellationReason: b.cancellation_reason,
          cancelledAt: b.cancelled_at,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        }));
      }
    } catch {}
    return inMemoryStore.getBookings(userId);
  }

  public static async getBookingById(bookingId: string, userId: string): Promise<UserBookingRecord | null> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', userId) // STRICT OWNERSHIP ENFORCEMENT
        .single();

      if (!error && data) {
        return {
          id: data.id,
          bookingReference: data.booking_reference,
          userId: data.user_id,
          bookingType: data.booking_type,
          inventoryType: data.inventory_type,
          inventoryId: data.inventory_id,
          inventoryTitle: data.inventory_title,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          adultCount: data.adult_count,
          childCount: data.child_count,
          guestCount: data.guest_count,
          totalAmountInr: Number(data.total_amount_inr || 0),
          currency: data.currency,
          hotelDetail: data.hotel_detail,
          cancellationReason: data.cancellation_reason,
          cancelledAt: data.cancelled_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.getBookingById(bookingId, userId);
  }

  public static async createBooking(userId: string, booking: Partial<UserBookingRecord>): Promise<UserBookingRecord> {
    const id = booking.id || `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ref = booking.bookingReference || `BY-HTL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      const supabase = getSupabaseServerClient();
      const payload = {
        id,
        booking_reference: ref,
        user_id: userId,
        booking_type: booking.bookingType || 'HOTEL',
        inventory_type: booking.inventoryType || 'HOTEL',
        inventory_id: booking.inventoryId,
        inventory_title: booking.inventoryTitle || 'Reservation',
        status: 'CONFIRMED',
        start_date: booking.startDate,
        end_date: booking.endDate,
        adult_count: booking.adultCount || 1,
        child_count: booking.childCount || 0,
        guest_count: booking.guestCount || 1,
        total_amount_inr: booking.totalAmountInr || 0,
        currency: booking.currency || 'INR',
        hotel_detail: booking.hotelDetail || {},
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_bookings')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          bookingReference: data.booking_reference,
          userId: data.user_id,
          bookingType: data.booking_type,
          inventoryType: data.inventory_type,
          inventoryId: data.inventory_id,
          inventoryTitle: data.inventory_title,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          adultCount: data.adult_count,
          childCount: data.child_count,
          guestCount: data.guest_count,
          totalAmountInr: Number(data.total_amount_inr || 0),
          currency: data.currency,
          hotelDetail: data.hotel_detail,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.createBooking(userId, booking);
  }

  public static async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<UserBookingRecord | null> {
    try {
      const supabase = getSupabaseServerClient();
      const payload = {
        status: 'CANCELLED',
        cancellation_reason: reason || 'Cancelled by user',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_bookings')
        .update(payload)
        .eq('id', bookingId)
        .eq('user_id', userId) // STRICT OWNERSHIP ENFORCEMENT
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          bookingReference: data.booking_reference,
          userId: data.user_id,
          bookingType: data.booking_type,
          inventoryType: data.inventory_type,
          inventoryId: data.inventory_id,
          inventoryTitle: data.inventory_title,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          adultCount: data.adult_count,
          childCount: data.child_count,
          guestCount: data.guest_count,
          totalAmountInr: Number(data.total_amount_inr || 0),
          currency: data.currency,
          hotelDetail: data.hotel_detail,
          cancellationReason: data.cancellation_reason,
          cancelledAt: data.cancelled_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.cancelBooking(bookingId, userId, reason);
  }

  // --- SAVED DESTINATIONS ---
  public static async getSavedDestinations(userId: string): Promise<UserSavedDestinationRecord[]> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_saved_destinations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          destinationId: d.destination_id,
          destinationName: d.destination_name,
          destinationData: d.destination_data,
          createdAt: d.created_at,
        }));
      }
    } catch {}
    return inMemoryStore.getSavedDestinations(userId);
  }

  public static async saveDestination(userId: string, dest: { destinationId: string; name?: string; data?: any }): Promise<UserSavedDestinationRecord> {
    try {
      const supabase = getSupabaseServerClient();
      const payload = {
        user_id: userId,
        destination_id: dest.destinationId,
        destination_name: dest.name || dest.destinationId,
        destination_data: dest.data || {},
      };

      const { data, error } = await supabase
        .from('user_saved_destinations')
        .upsert(payload, { onConflict: 'user_id,destination_id' })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          destinationId: data.destination_id,
          destinationName: data.destination_name,
          destinationData: data.destination_data,
          createdAt: data.created_at,
        };
      }
    } catch {}
    return inMemoryStore.saveDestination(userId, dest);
  }

  public static async removeSavedDestination(userId: string, destinationId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseServerClient();
      const { error } = await supabase
        .from('user_saved_destinations')
        .delete()
        .eq('user_id', userId)
        .eq('destination_id', destinationId);

      if (!error) return true;
    } catch {}
    return inMemoryStore.removeSavedDestination(userId, destinationId);
  }

  // --- PREFERENCES ---
  public static async getPreferences(userId: string): Promise<UserPreferencesRecord> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();
      if (!error && data) {
        return {
          userId: data.user_id,
          preferredLanguage: data.preferred_language || 'en',
          dietaryPreference: data.dietary_preference,
          budgetTier: data.budget_tier || 'moderate',
          travelPace: data.travel_pace || 'balanced',
          travelStyle: data.travel_style || 'balanced',
          transport: data.transport || ['train', 'bus'],
          interests: data.interests || ['heritage', 'nature'],
          originCity: data.origin_city || 'Ahmedabad',
          originState: data.origin_state || 'Gujarat',
          originCountry: data.origin_country || 'India',
          typicalTravelers: data.typical_travelers || 2,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.getPreferences(userId);
  }

  public static async savePreferences(userId: string, prefs: Partial<UserPreferencesRecord>): Promise<UserPreferencesRecord> {
    try {
      const supabase = getSupabaseServerClient();
      const payload: any = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };
      if (prefs.preferredLanguage !== undefined) payload.preferred_language = prefs.preferredLanguage;
      if (prefs.dietaryPreference !== undefined) payload.dietary_preference = prefs.dietaryPreference;
      if (prefs.budgetTier !== undefined) payload.budget_tier = prefs.budgetTier;
      if (prefs.travelPace !== undefined) payload.travel_pace = prefs.travelPace;
      if (prefs.travelStyle !== undefined) payload.travel_style = prefs.travelStyle;
      if (prefs.transport !== undefined) payload.transport = prefs.transport;
      if (prefs.interests !== undefined) payload.interests = prefs.interests;
      if (prefs.originCity !== undefined) payload.origin_city = prefs.originCity;
      if (prefs.originState !== undefined) payload.origin_state = prefs.originState;
      if (prefs.originCountry !== undefined) payload.origin_country = prefs.originCountry;
      if (prefs.typicalTravelers !== undefined) payload.typical_travelers = prefs.typicalTravelers;

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(payload)
        .select()
        .single();

      if (!error && data) {
        return {
          userId: data.user_id,
          preferredLanguage: data.preferred_language,
          dietaryPreference: data.dietary_preference,
          budgetTier: data.budget_tier,
          travelPace: data.travel_pace,
          travelStyle: data.travel_style,
          transport: data.transport,
          interests: data.interests,
          originCity: data.origin_city,
          originState: data.origin_state,
          originCountry: data.origin_country,
          typicalTravelers: data.typical_travelers,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.savePreferences(userId, prefs);
  }

  // --- ADMIN OPERATIONS ---
  public static async getAdminUsers(filters: { search?: string; role?: string; status?: string; limit?: number; offset?: number } = {}) {
    try {
      const supabase = getSupabaseServerClient();
      let query = supabase.from('user_profiles').select('*', { count: 'exact' });
      if (filters.role) query = query.eq('role', filters.role);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (!error && data) {
        const users: UserProfileRecord[] = data.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          phoneNumber: u.phone_number,
          avatarUrl: u.avatar_url,
          role: u.role,
          status: u.status,
          isPhoneVerified: u.is_phone_verified,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
        }));
        return { users, total: count || users.length };
      }
    } catch {}
    return inMemoryStore.getAdminUsers(filters);
  }

  public static async updateUserStatusOrRole(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    updates: { role?: string; status?: string }
  ): Promise<UserProfileRecord | null> {
    try {
      const supabase = getSupabaseServerClient();
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.role) payload.role = updates.role;
      if (updates.status) payload.status = updates.status;

      const { data, error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', targetUserId)
        .select()
        .single();

      if (!error && data) {
        // Record admin audit log
        await this.logAdminAudit({
          id: `audit-${Date.now()}`,
          adminId,
          adminEmail,
          targetUserId,
          action: 'UPDATE_USER_STATUS_ROLE',
          details: updates,
          createdAt: new Date().toISOString(),
        });

        return {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          avatarUrl: data.avatar_url,
          role: data.role,
          status: data.status,
          isPhoneVerified: data.is_phone_verified,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return inMemoryStore.updateUserStatusOrRole(adminId, adminEmail, targetUserId, updates);
  }

  public static async logAdminAudit(log: AdminAuditLogRecord): Promise<void> {
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('admin_audit_logs').insert({
        admin_id: log.adminId,
        admin_email: log.adminEmail,
        target_user_id: log.targetUserId,
        action: log.action,
        details: log.details || {},
        ip_address: log.ipAddress,
      });
    } catch {}
    await inMemoryStore.logAdminAudit(log);
  }

  public static async getAdminAuditLogs(limit = 50): Promise<AdminAuditLogRecord[]> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          adminId: d.admin_id,
          adminEmail: d.admin_email,
          targetUserId: d.target_user_id,
          action: d.action,
          details: d.details,
          ipAddress: d.ip_address,
          createdAt: d.created_at,
        }));
      }
    } catch {}
    return inMemoryStore.getAdminAuditLogs(limit);
  }
}

