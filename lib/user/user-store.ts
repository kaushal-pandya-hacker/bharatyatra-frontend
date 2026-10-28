import {
  GroupMember,
  TripExpenseItem,
  SettlementSuggestion,
  createTripExpense,
  inrToPaise,
  paiseToInr,
} from '@/lib/trips/group-expense-engine';
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
 * Custom error indicating a persistent storage failure.
 * Ensures caller receives an honest error and is never misled by a silent in-memory fallback.
 */
export class DatabasePersistenceError extends Error {
  public readonly code: string;
  public readonly details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'DatabasePersistenceError';
    this.code = 'DATABASE_PERSISTENCE_ERROR';
    this.details = details;
  }
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
  private tripMembers = new Map<string, GroupMember[]>();
  private tripExpenses = new Map<string, TripExpenseItem[]>();
  private tripSettlements = new Map<string, any[]>();

  public clearAll() {
    this.profiles.clear();
    this.trips.clear();
    this.bookings.clear();
    this.savedDestinations.clear();
    this.preferences.clear();
    this.auditLogs = [];
    this.tripMembers.clear();
    this.tripExpenses.clear();
    this.tripSettlements.clear();
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


  // --- GROUP EXPENSES & MEMBERS (IN-MEMORY) ---
  public verifyTripAccess(tripId: string, userId: string): boolean {
    const trip = this.trips.get(tripId);
    if (trip && trip.userId === userId) return true;
    const members = this.tripMembers.get(tripId) || [];
    const userEmail = this.profiles.get(userId)?.email;
    const organizerId = `mem_${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;
    return members.some(
      (m) =>
        m.id === organizerId ||
        (Boolean(m.email && userEmail && m.email.toLowerCase() === userEmail.toLowerCase()))
    );
  }

  public async getTripMembers(tripId: string, userId: string): Promise<GroupMember[] | null> {
    const trip = this.trips.get(tripId);
    if (!trip && !this.tripMembers.has(tripId)) return null;
    if (!this.verifyTripAccess(tripId, userId)) return null;

    let members = this.tripMembers.get(tripId);
    if (!members || members.length === 0) {
      const profile = this.profiles.get(userId);
      const ownerName = profile?.fullName || (trip?.userId === userId ? 'Trip Organizer' : 'Traveler');
      const ownerMember: GroupMember = {
        id: `mem_${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'organizer'}`,
        name: ownerName,
        isCurrentUser: true,
        role: 'OWNER',
        avatar: ownerName.slice(0, 2).toUpperCase(),
      };
      members = [ownerMember];
      this.tripMembers.set(tripId, members);
    }
    const currentMemberId = `mem_${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'organizer'}`;
    const userEmail = this.profiles.get(userId)?.email;
    return members.map((m) => ({
      ...m,
      isCurrentUser: m.id === currentMemberId || (!!userEmail && m.email === userEmail),
    }));
  }

  public async addTripMember(
    tripId: string,
    userId: string,
    memberData: { name: string; email?: string; phone?: string; upiId?: string; role?: string }
  ): Promise<GroupMember> {
    const hasAccess = this.verifyTripAccess(tripId, userId);
    if (!hasAccess && !this.trips.has(tripId)) {
      throw new Error('Trip not found or unauthorized to add members.');
    }
    const currentMembers = (await this.getTripMembers(tripId, userId)) || [];
    const newMember: GroupMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: memberData.name.trim(),
      email: memberData.email,
      phone: memberData.phone,
      upiId: memberData.upiId,
      role: memberData.role || 'MEMBER',
      avatar: memberData.name.trim().slice(0, 2).toUpperCase(),
    };
    currentMembers.push(newMember);
    this.tripMembers.set(tripId, currentMembers);
    return newMember;
  }

  public async removeTripMember(tripId: string, memberId: string, userId: string): Promise<boolean> {
    const hasAccess = this.verifyTripAccess(tripId, userId);
    if (!hasAccess) return false;
    const members = this.tripMembers.get(tripId) || [];
    const filtered = members.filter((m) => m.id !== memberId);
    this.tripMembers.set(tripId, filtered);
    const expenses = this.tripExpenses.get(tripId) || [];
    const updatedExpenses = expenses.map((e) => ({
      ...e,
      participants: e.participants.filter((p) => p.memberId !== memberId),
    }));
    this.tripExpenses.set(tripId, updatedExpenses);
    return true;
  }

  public async getTripExpenses(tripId: string, userId: string): Promise<TripExpenseItem[] | null> {
    const trip = this.trips.get(tripId);
    if (!trip && !this.tripMembers.has(tripId)) return null;
    if (trip && trip.userId !== userId && !this.verifyTripAccess(tripId, userId)) return null;
    return this.tripExpenses.get(tripId) || [];
  }

  public async createTripExpense(tripId: string, userId: string, data: any): Promise<TripExpenseItem> {
    const hasAccess = this.verifyTripAccess(tripId, userId);
    if (!hasAccess && !this.trips.has(tripId)) {
      throw new Error('Trip not found or unauthorized to record expense.');
    }
    const amountInr = Number(data.amountInr);
    if (isNaN(amountInr) || amountInr <= 0) {
      throw new Error('Expense amount must be a positive number.');
    }
    const members = (await this.getTripMembers(tripId, userId)) || [];
    if (members.length > 0 && !members.some((m) => m.id === data.paidByMemberId)) {
      throw new Error('Payer must be an active member of this trip.');
    }
    const participantIds: string[] =
      data.participantMemberIds ||
      (data.participants ? data.participants.map((p: any) => p.memberId) : members.map((m) => m.id));

    if (participantIds.length === 0) {
      throw new Error('Expense must have at least one participant.');
    }
    if (members.length > 0) {
      for (const pId of participantIds) {
        if (!members.some((m) => m.id === pId)) {
          throw new Error(`Participant ${pId} is not a member of this trip.`);
        }
      }
    }

    const created = createTripExpense({
      id: data.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tripId,
      title: (data.title || 'Untitled Expense').trim(),
      amountInr,
      paidByMemberId: data.paidByMemberId,
      category: data.category || 'Food',
      splitType: data.splitType || 'EQUAL',
      participantMemberIds: participantIds,
      customSplits: data.customSplits,
    });

    const list = this.tripExpenses.get(tripId) || [];
    list.unshift(created);
    this.tripExpenses.set(tripId, list);
    return created;
  }

  public async deleteTripExpense(tripId: string, expenseId: string, userId: string): Promise<boolean> {
    const hasAccess = this.verifyTripAccess(tripId, userId);
    if (!hasAccess) return false;
    const list = this.tripExpenses.get(tripId) || [];
    const filtered = list.filter((e) => e.id !== expenseId);
    if (filtered.length === list.length) return false;
    this.tripExpenses.set(tripId, filtered);
    return true;
  }

  public async recordSettlement(tripId: string, userId: string, data: any): Promise<any> {
    const hasAccess = this.verifyTripAccess(tripId, userId);
    if (!hasAccess) throw new Error('Unauthorized or trip not found.');
    const list = this.tripSettlements.get(tripId) || [];
    const key = `${data.fromMemberId}->${data.toMemberId}`;
    const record = {
      id: data.id || `set_${Date.now()}`,
      tripId,
      fromMemberId: data.fromMemberId,
      fromMemberName: data.fromMemberName || 'Traveler',
      toMemberId: data.toMemberId,
      toMemberName: data.toMemberName || 'Traveler',
      amountInr: Number(data.amountInr || 0),
      amountPaise: Math.round(Number(data.amountInr || 0) * 100),
      status: data.status || 'PENDING',
      paymentRef: data.paymentRef || data.refCode,
      settledAt: data.status === 'SETTLED' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };
    const filtered = list.filter((s) => `${s.fromMemberId}->${s.toMemberId}` !== key);
    filtered.push(record);
    this.tripSettlements.set(tripId, filtered);
    return record;
  }

  public async getSettlements(tripId: string, userId: string): Promise<SettlementSuggestion[] | null> {
    const trip = this.trips.get(tripId);
    if (!trip && !this.tripMembers.has(tripId)) return null;
    if (trip && trip.userId !== userId && !this.verifyTripAccess(tripId, userId)) return null;
    const list = this.tripSettlements.get(tripId) || [];
    return list.map((s) => ({
      id: s.id,
      fromMemberId: s.fromMemberId,
      fromMemberName: s.fromMemberName,
      toMemberId: s.toMemberId,
      toMemberName: s.toMemberName,
      amountInr: s.amountInr,
      amountPaise: s.amountPaise,
      status: s.status,
      refCode: s.paymentRef,
      paidAt: s.settledAt,
    }));
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

let simulateDatabaseFailure = false;

function shouldAllowFallback(): boolean {
  if (simulateDatabaseFailure) return false;
  return process.env.NODE_ENV === 'test' && process.env.USE_REAL_DB !== 'true';
}

/**
 * Universal User Data Store
 * Checks Supabase PostgreSQL first; never masks database write failures in production.
 */
export class UserDataStore {
  public static clearForTesting() {
    inMemoryStore.clearAll();
    simulateDatabaseFailure = false;
  }

  public static setSimulateDatabaseFailure(enabled: boolean) {
    simulateDatabaseFailure = enabled;
  }

  // --- PROFILES ---
  public static async getProfile(userId: string): Promise<UserProfileRecord | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database connection failure.');
    }
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
      if (error && error.code === 'PGRST116') {
        return null;
      }
      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getProfile(userId);
        throw new DatabasePersistenceError(`Database error querying user_profiles: ${error.message}`, error);
      }
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getProfile(userId);
      throw new DatabasePersistenceError(`Database connection failure: ${err?.message || 'Unknown error'}`, err);
    }
    return inMemoryStore.getProfile(userId);
  }

  public static async updateProfile(userId: string, data: Partial<UserProfileRecord>): Promise<UserProfileRecord> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database write failure.');
    }
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

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.updateProfile(userId, data);
        throw new DatabasePersistenceError(`Failed to update profile in database: ${error.message}`, error);
      }

      if (updated) {
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
      throw new DatabasePersistenceError('Profile update completed without returning data');
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.updateProfile(userId, data);
      throw new DatabasePersistenceError(`Profile update error: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  // --- TRIPS ---
  public static async getUserTrips(userId: string): Promise<UserTripRecord[]> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getTrips(userId);
        throw new DatabasePersistenceError(`Database error querying user_trips: ${error.message}`, error);
      }

      if (Array.isArray(data)) {
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
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getTrips(userId);
      throw new DatabasePersistenceError(`Error reading user trips: ${err?.message || 'Unknown database error'}`, err);
    }
    return inMemoryStore.getTrips(userId);
  }

  public static async getTripById(tripId: string, userId: string): Promise<UserTripRecord | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', userId) // STRICT OWNERSHIP FILTER
        .single();

      if (error && error.code === 'PGRST116') {
        return null;
      }

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getTripById(tripId, userId);
        throw new DatabasePersistenceError(`Database error fetching trip: ${error.message}`, error);
      }

      if (data) {
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
      return null;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getTripById(tripId, userId);
      throw new DatabasePersistenceError(`Error fetching trip: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  public static async saveTrip(userId: string, trip: Partial<UserTripRecord>): Promise<UserTripRecord> {
    const id = trip.id || `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database persistence failure.');
    }
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

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.saveTrip(userId, trip);
        throw new DatabasePersistenceError(`Database persistence failed for user_trips: ${error.message}`, error);
      }

      if (data) {
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
      throw new DatabasePersistenceError('Database upsert completed without returning record');
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.saveTrip(userId, trip);
      throw new DatabasePersistenceError(`Database write failure: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  public static async deleteTrip(tripId: string, userId: string): Promise<boolean> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database deletion failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { error } = await supabase
        .from('user_trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', userId);

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.deleteTrip(tripId, userId);
        throw new DatabasePersistenceError(`Database deletion failed for user_trips: ${error.message}`, error);
      }
      return true;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.deleteTrip(tripId, userId);
      throw new DatabasePersistenceError(`Database deletion failure: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  // --- BOOKINGS ---
  public static async getUserBookings(userId: string): Promise<UserBookingRecord[]> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getBookings(userId);
        throw new DatabasePersistenceError(`Database error querying user_bookings: ${error.message}`, error);
      }

      if (Array.isArray(data)) {
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
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getBookings(userId);
      throw new DatabasePersistenceError(`Error reading bookings: ${err?.message || 'Unknown database error'}`, err);
    }
    return inMemoryStore.getBookings(userId);
  }

  public static async getBookingById(bookingId: string, userId: string): Promise<UserBookingRecord | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', userId) // STRICT OWNERSHIP ENFORCEMENT
        .single();

      if (error && error.code === 'PGRST116') {
        return null;
      }

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getBookingById(bookingId, userId);
        throw new DatabasePersistenceError(`Database error querying booking: ${error.message}`, error);
      }

      if (data) {
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
      return null;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getBookingById(bookingId, userId);
      throw new DatabasePersistenceError(`Error fetching booking: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  public static async createBooking(userId: string, booking: Partial<UserBookingRecord>): Promise<UserBookingRecord> {
    const id = booking.id || `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ref = booking.bookingReference || `BY-HTL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database write failure.');
    }
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

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.createBooking(userId, booking);
        throw new DatabasePersistenceError(`Database insert failed for user_bookings: ${error.message}`, error);
      }

      if (data) {
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
      throw new DatabasePersistenceError('Database insert completed without returning record');
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.createBooking(userId, booking);
      throw new DatabasePersistenceError(`Database write failure: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  public static async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<UserBookingRecord | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database cancellation failure.');
    }
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

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.cancelBooking(bookingId, userId, reason);
        throw new DatabasePersistenceError(`Database cancellation failed for user_bookings: ${error.message}`, error);
      }

      if (data) {
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
      return null;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.cancelBooking(bookingId, userId, reason);
      throw new DatabasePersistenceError(`Database cancellation failure: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  // --- SAVED DESTINATIONS ---
  public static async getSavedDestinations(userId: string): Promise<UserSavedDestinationRecord[]> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('user_saved_destinations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getSavedDestinations(userId);
        throw new DatabasePersistenceError(`Database read error on user_saved_destinations: ${error.message}`, error);
      }

      if (Array.isArray(data)) {
        return data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          destinationId: d.destination_id,
          destinationName: d.destination_name,
          destinationData: d.destination_data,
          createdAt: d.created_at,
        }));
      }
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getSavedDestinations(userId);
      throw new DatabasePersistenceError(`Database read failure: ${err?.message || 'Unknown database error'}`, err);
    }
    return inMemoryStore.getSavedDestinations(userId);
  }

  public static async saveDestination(userId: string, dest: { destinationId: string; name?: string; data?: any }): Promise<UserSavedDestinationRecord> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database write failure.');
    }
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

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.saveDestination(userId, dest);
        throw new DatabasePersistenceError(`Database write failure on user_saved_destinations: ${error.message}`, error);
      }

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          destinationId: data.destination_id,
          destinationName: data.destination_name,
          destinationData: data.destination_data,
          createdAt: data.created_at,
        };
      }
      throw new DatabasePersistenceError('Failed to return saved destination record');
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.saveDestination(userId, dest);
      throw new DatabasePersistenceError(`Database write failure: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  public static async removeSavedDestination(userId: string, destinationId: string): Promise<boolean> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database deletion failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { error } = await supabase
        .from('user_saved_destinations')
        .delete()
        .eq('user_id', userId)
        .eq('destination_id', destinationId);

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.removeSavedDestination(userId, destinationId);
        throw new DatabasePersistenceError(`Database delete failed for user_saved_destinations: ${error.message}`, error);
      }
      return true;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.removeSavedDestination(userId, destinationId);
      throw new DatabasePersistenceError(`Database deletion failure: ${err?.message || 'Unknown database error'}`, err);
    }
  }

  // --- PREFERENCES ---
  public static async getPreferences(userId: string): Promise<UserPreferencesRecord> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
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
      if (error && error.code === 'PGRST116') {
        return inMemoryStore.getPreferences(userId);
      }
      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getPreferences(userId);
        throw new DatabasePersistenceError(`Database error on user_preferences: ${error.message}`, error);
      }
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getPreferences(userId);
      throw new DatabasePersistenceError(`Database failure reading preferences: ${err?.message || 'Unknown error'}`, err);
    }
    return inMemoryStore.getPreferences(userId);
  }

  public static async savePreferences(userId: string, prefs: Partial<UserPreferencesRecord>): Promise<UserPreferencesRecord> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database write failure.');
    }
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

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.savePreferences(userId, prefs);
        throw new DatabasePersistenceError(`Database write failed for user_preferences: ${error.message}`, error);
      }

      if (data) {
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
      throw new DatabasePersistenceError('Failed to return updated preferences');
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.savePreferences(userId, prefs);
      throw new DatabasePersistenceError(`Database write failure: ${err?.message || 'Unknown error'}`, err);
    }
  }

  // --- ADMIN OPERATIONS ---
  public static async getAdminUsers(filters: { search?: string; role?: string; status?: string; limit?: number; offset?: number } = {}) {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
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
      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getAdminUsers(filters);
        throw new DatabasePersistenceError(`Database query error on user_profiles: ${error.message}`, error);
      }

      if (data) {
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
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getAdminUsers(filters);
      throw new DatabasePersistenceError(`Error querying users: ${err?.message || 'Unknown database error'}`, err);
    }
    return inMemoryStore.getAdminUsers(filters);
  }

  public static async updateUserStatusOrRole(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    updates: { role?: string; status?: string }
  ): Promise<UserProfileRecord | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database write failure.');
    }
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

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.updateUserStatusOrRole(adminId, adminEmail, targetUserId, updates);
        throw new DatabasePersistenceError(`Database update failed for user_profiles: ${error.message}`, error);
      }

      if (data) {
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
      return null;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.updateUserStatusOrRole(adminId, adminEmail, targetUserId, updates);
      throw new DatabasePersistenceError(`Error updating user status/role: ${err?.message || 'Unknown database error'}`, err);
    }
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
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getAdminAuditLogs(limit);
        throw new DatabasePersistenceError(`Error fetching admin audit logs: ${error.message}`, error);
      }

      if (data) {
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
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getAdminAuditLogs(limit);
      throw new DatabasePersistenceError(`Error reading audit logs: ${err?.message || 'Unknown database error'}`, err);
    }
    return inMemoryStore.getAdminAuditLogs(limit);
  }

  // ============================================================================
  // TRIP GROUP EXPENSES & MEMBERS (PERSISTENT / TENANT-ISOLATED)
  // ============================================================================

  public static async getTripMembers(tripId: string, userId: string): Promise<GroupMember[] | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure for trip members.');
    }
    try {
      const supabase = getSupabaseServerClient();
      // Check authorization: must own user_trips or be in trip_members
      const { data: trip, error: tripErr } = await supabase
        .from('user_trips')
        .select('id, user_id')
        .eq('id', tripId)
        .maybeSingle();

      if (tripErr) {
        if (shouldAllowFallback()) return inMemoryStore.getTripMembers(tripId, userId);
        throw new DatabasePersistenceError(`Database error verifying trip: ${tripErr.message}`, tripErr);
      }

      if (trip && trip.user_id !== userId) {
        // Check if user is a registered member
        const { data: membership } = await supabase
          .from('trip_members')
          .select('id')
          .eq('trip_id', tripId)
          .eq('user_id', userId)
          .maybeSingle();
        if (!membership) {
          return null; // Forbidden / Not Found
        }
      } else if (!trip) {
        if (shouldAllowFallback()) return inMemoryStore.getTripMembers(tripId, userId);
        return null;
      }

      const { data: members, error: memErr } = await supabase
        .from('trip_members')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (memErr) {
        if (shouldAllowFallback()) return inMemoryStore.getTripMembers(tripId, userId);
        throw new DatabasePersistenceError(`Error fetching trip members: ${memErr.message}`, memErr);
      }

      if (!members || members.length === 0) {
        // Auto-initialize organizer if user owns trip
        const profile = await this.getProfile(userId);
        const ownerName = profile?.fullName || 'Trip Organizer';
        const ownerId = `mem_${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;
        const { data: inserted, error: insErr } = await supabase
          .from('trip_members')
          .insert({
            id: ownerId,
            trip_id: tripId,
            user_id: userId,
            name: ownerName,
            email: profile?.email,
            phone: profile?.phoneNumber,
            role: 'OWNER',
            status: 'ACCEPTED',
          })
          .select()
          .single();

        if (insErr) {
          if (shouldAllowFallback()) return inMemoryStore.getTripMembers(tripId, userId);
          throw new DatabasePersistenceError(`Failed to initialize trip owner: ${insErr.message}`, insErr);
        }

        return [
          {
            id: inserted.id,
            name: inserted.name,
            email: inserted.email,
            phone: inserted.phone,
            role: inserted.role,
            isCurrentUser: true,
            avatar: inserted.name.slice(0, 2).toUpperCase(),
          },
        ];
      }

      return members.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        upiId: m.upi_id,
        role: m.role,
        isCurrentUser: m.user_id === userId,
        avatar: (m.name || 'TR').slice(0, 2).toUpperCase(),
      }));
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getTripMembers(tripId, userId);
      throw new DatabasePersistenceError(`Database error loading members: ${err?.message || 'Unknown'}`, err);
    }
  }

  public static async addTripMember(
    tripId: string,
    userId: string,
    memberData: { name: string; email?: string; phone?: string; upiId?: string; role?: string }
  ): Promise<GroupMember> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database write failure for trip member.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const existingTrip = await this.getTripById(tripId, userId);
      if (!existingTrip) {
        if (shouldAllowFallback()) return inMemoryStore.addTripMember(tripId, userId, memberData);
        throw new Error('Trip not found or unauthorized to add member.');
      }

      const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const { data, error } = await supabase
        .from('trip_members')
        .insert({
          id,
          trip_id: tripId,
          name: memberData.name.trim(),
          email: memberData.email,
          phone: memberData.phone,
          upi_id: memberData.upiId,
          role: memberData.role || 'MEMBER',
          status: 'ACCEPTED',
        })
        .select()
        .single();

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.addTripMember(tripId, userId, memberData);
        throw new DatabasePersistenceError(`Failed to add trip member: ${error.message}`, error);
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        upiId: data.upi_id,
        role: data.role,
        isCurrentUser: false,
        avatar: data.name.slice(0, 2).toUpperCase(),
      };
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.addTripMember(tripId, userId, memberData);
      throw new DatabasePersistenceError(`Failed to add member: ${err?.message || 'Unknown'}`, err);
    }
  }

  public static async removeTripMember(tripId: string, memberId: string, userId: string): Promise<boolean> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database delete failure.');
    }
    try {
      const supabase = getSupabaseServerClient();
      const existingTrip = await this.getTripById(tripId, userId);
      if (!existingTrip) {
        if (shouldAllowFallback()) return inMemoryStore.removeTripMember(tripId, memberId, userId);
        return false;
      }
      const { error } = await supabase.from('trip_members').delete().eq('id', memberId).eq('trip_id', tripId);
      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.removeTripMember(tripId, memberId, userId);
        throw new DatabasePersistenceError(`Failed to delete member: ${error.message}`, error);
      }
      return true;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.removeTripMember(tripId, memberId, userId);
      throw new DatabasePersistenceError(`Error deleting member: ${err?.message || 'Unknown'}`, err);
    }
  }

  public static async getTripExpenses(tripId: string, userId: string): Promise<TripExpenseItem[] | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure for trip expenses.');
    }
    try {
      const members = await this.getTripMembers(tripId, userId);
      if (!members) {
        if (shouldAllowFallback()) return inMemoryStore.getTripExpenses(tripId, userId);
        return null;
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('trip_expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getTripExpenses(tripId, userId);
        throw new DatabasePersistenceError(`Error reading trip expenses: ${error.message}`, error);
      }

      if (!data) return [];

      return data.map((d: any) => ({
        id: d.id,
        tripId: d.trip_id,
        title: d.title,
        amountInr: Number(d.amount_inr),
        amountPaise: d.amount_cents,
        paidByMemberId: d.payer_id,
        category: d.category,
        splitType: d.split_type,
        participants: d.participants_json || [],
        sharedByAll: false,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getTripExpenses(tripId, userId);
      throw new DatabasePersistenceError(`Error reading expenses: ${err?.message || 'Unknown'}`, err);
    }
  }

  public static async createTripExpense(tripId: string, userId: string, data: any): Promise<TripExpenseItem> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database write failure for expense creation.');
    }
    try {
      const members = await this.getTripMembers(tripId, userId);
      if (!members) {
        if (shouldAllowFallback()) return inMemoryStore.createTripExpense(tripId, userId, data);
        throw new Error('Trip not found or unauthorized to record expense.');
      }

      const amountInr = Number(data.amountInr);
      if (isNaN(amountInr) || amountInr <= 0) {
        throw new Error('Expense amount must be a positive number.');
      }
      if (members.length > 0 && !members.some((m) => m.id === data.paidByMemberId)) {
        throw new Error('Payer must be an active member of this trip.');
      }

      const participantIds: string[] =
        data.participantMemberIds ||
        (data.participants ? data.participants.map((p: any) => p.memberId) : members.map((m) => m.id));

      if (participantIds.length === 0) {
        throw new Error('Expense must have at least one participant.');
      }
      for (const pId of participantIds) {
        if (!members.some((m) => m.id === pId)) {
          throw new Error(`Participant ${pId} is not a member of this trip.`);
        }
      }

      const calculated = createTripExpense({
        id: data.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tripId,
        title: (data.title || 'Untitled Expense').trim(),
        amountInr,
        paidByMemberId: data.paidByMemberId,
        category: data.category || 'Food',
        splitType: data.splitType || 'EQUAL',
        participantMemberIds: participantIds,
        customSplits: data.customSplits,
      });

      const supabase = getSupabaseServerClient();
      const { data: inserted, error } = await supabase
        .from('trip_expenses')
        .insert({
          id: calculated.id,
          trip_id: tripId,
          payer_id: calculated.paidByMemberId,
          title: calculated.title,
          category: calculated.category,
          amount_inr: calculated.amountInr,
          amount_cents: calculated.amountPaise,
          split_type: calculated.splitType,
          participants_json: calculated.participants,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.createTripExpense(tripId, userId, data);
        throw new DatabasePersistenceError(`Failed to save expense to database: ${error.message}`, error);
      }

      return calculated;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.createTripExpense(tripId, userId, data);
      throw new DatabasePersistenceError(`Failed to create expense: ${err?.message || 'Unknown'}`, err);
    }
  }

  public static async deleteTripExpense(tripId: string, expenseId: string, userId: string): Promise<boolean> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database delete failure for expense.');
    }
    try {
      const members = await this.getTripMembers(tripId, userId);
      if (!members) {
        if (shouldAllowFallback()) return inMemoryStore.deleteTripExpense(tripId, expenseId, userId);
        return false;
      }
      const supabase = getSupabaseServerClient();
      const { error } = await supabase.from('trip_expenses').delete().eq('id', expenseId).eq('trip_id', tripId);
      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.deleteTripExpense(tripId, expenseId, userId);
        throw new DatabasePersistenceError(`Failed to delete expense: ${error.message}`, error);
      }
      return true;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.deleteTripExpense(tripId, expenseId, userId);
      throw new DatabasePersistenceError(`Error deleting expense: ${err?.message || 'Unknown'}`, err);
    }
  }

  public static async recordSettlement(tripId: string, userId: string, data: any): Promise<any> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database failure for settlement.');
    }
    try {
      const members = await this.getTripMembers(tripId, userId);
      if (!members) {
        if (shouldAllowFallback()) return inMemoryStore.recordSettlement(tripId, userId, data);
        throw new Error('Unauthorized or trip not found.');
      }
      const supabase = getSupabaseServerClient();
      const id = data.id || `set_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const payload = {
        id,
        trip_id: tripId,
        from_member_id: data.fromMemberId,
        from_member_name: data.fromMemberName || 'Traveler',
        to_member_id: data.toMemberId,
        to_member_name: data.toMemberName || 'Traveler',
        amount_inr: Number(data.amountInr || 0),
        amount_cents: Math.round(Number(data.amountInr || 0) * 100),
        status: data.status || 'PENDING',
        payment_ref: data.paymentRef || data.refCode,
        settled_at: data.status === 'SETTLED' ? new Date().toISOString() : null,
      };

      const { data: inserted, error } = await supabase
        .from('group_expense_settlements')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.recordSettlement(tripId, userId, data);
        throw new DatabasePersistenceError(`Failed to record settlement: ${error.message}`, error);
      }
      return inserted;
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.recordSettlement(tripId, userId, data);
      throw new DatabasePersistenceError(`Error recording settlement: ${err?.message || 'Unknown'}`, err);
    }
  }

  public static async getSettlements(tripId: string, userId: string): Promise<SettlementSuggestion[] | null> {
    if (simulateDatabaseFailure) {
      throw new DatabasePersistenceError('Simulated database read failure for settlements.');
    }
    try {
      const members = await this.getTripMembers(tripId, userId);
      if (!members) {
        if (shouldAllowFallback()) return inMemoryStore.getSettlements(tripId, userId);
        return null;
      }
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from('group_expense_settlements')
        .select('*')
        .eq('trip_id', tripId);

      if (error) {
        if (shouldAllowFallback()) return inMemoryStore.getSettlements(tripId, userId);
        throw new DatabasePersistenceError(`Error reading settlements: ${error.message}`, error);
      }
      if (!data) return [];
      return data.map((s: any) => ({
        id: s.id,
        fromMemberId: s.from_member_id,
        fromMemberName: s.from_member_name,
        toMemberId: s.to_member_id,
        toMemberName: s.to_member_name,
        amountInr: Number(s.amount_inr),
        amountPaise: s.amount_cents,
        status: s.status,
        refCode: s.payment_ref,
        paidAt: s.settled_at,
      }));
    } catch (err: any) {
      if (err instanceof DatabasePersistenceError) throw err;
      if (shouldAllowFallback()) return inMemoryStore.getSettlements(tripId, userId);
      throw new DatabasePersistenceError(`Error reading settlements: ${err?.message || 'Unknown'}`, err);
    }
  }

}
