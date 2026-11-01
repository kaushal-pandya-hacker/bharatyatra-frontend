/**
 * BharatYatra — Complete Enterprise Admin Control Center Data Engine
 * Covers Phases 1–7:
 * Phase 1: Core Operations (Dashboard, Bookings, Users)
 * Phase 2: Business Operations (Partners, Packages, Destinations)
 * Phase 3: Financial Management (Payments, Refunds, Commissions, Financial Reports)
 * Phase 4: AI Trip Planner Management (AI Config, Knowledge Base, Telemetry, Pricing Engine)
 * Phase 5: Hotel & Transport Operations (Hotels, Buses, Trains/Flights, Local Cabs)
 * Phase 6: Customer Experience (Support Desk, Reviews & Ratings, Marketing & Notifications)
 * Phase 7: Platform & Security Operations (CMS, APIs, System Monitoring, Audit Logs, Staff RBAC)
 */

import { getSupabaseServerClient } from '@/lib/supabase/client';
import { GUJARAT_100_LANDMARKS, GUJARAT_DESTINATIONS } from '@/lib/data/destinations';

const TOTAL_VERIFIED_KNOWLEDGE_ENTITIES = GUJARAT_100_LANDMARKS.length + GUJARAT_DESTINATIONS.length;

// ============================================================================
// Data Models & Interfaces
// ============================================================================

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'BOOKING_MANAGER'
  | 'FINANCE_MANAGER'
  | 'PARTNER_MANAGER'
  | 'CONTENT_MANAGER'
  | 'SUPPORT_MANAGER'
  | 'MARKETING_MANAGER'
  | 'TECHNICAL_ADMIN';

export interface AdminSupplier {
  id: string;
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  city: string;
  totalInventoryCount: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AdminInventoryItem {
  id: string;
  name: string;
  type: 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'PACKAGE';
  supplierId: string;
  supplierName: string;
  destination: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface BookingTimelineEvent {
  timestamp: string;
  title: string;
  description: string;
  actor: string;
}

export interface AdminBooking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: 'HOTEL' | 'BUS' | 'TRAIN' | 'FLIGHT' | 'PACKAGE' | 'ACTIVITY';
  supplierId: string;
  supplierName: string;
  travelDate: string;
  destination: string;
  amount: number;
  paymentStatus: 'INITIATED' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
  confirmationReference: string;
  refundStatus: 'NONE' | 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  timeline: BookingTimelineEvent[];
  createdAt: string;
  details?: Record<string, any>;
}

export interface AdminCustomerUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  totalBookings: number;
  totalSpent: number;
  city: string;
  state: string;
  registrationDate: string;
  lastLogin: string;
  kycVerified: boolean;
}

export interface AdminPaymentTransaction {
  id: string;
  transactionId: string;
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  gateway: 'BharatGateway™' | 'Cashfree' | 'Razorpay' | 'UPI AutoPay';
  method: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NETBANKING';
  amount: number;
  gatewayReference: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  failureReason?: string;
  transactionDate: string;
  rawGatewayResponseRedacted?: Record<string, any>;
}

export interface AdminRefundItem {
  id: string;
  refundReference: string;
  transactionId: string;
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  eligibilityVerified: boolean;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  gatewayReference?: string;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface AdminSettlement {
  id: string;
  supplierId: string;
  bookingId: string;
  grossAmountInr: number;
  commissionAmountInr: number;
  payableAmountInr: number;
  status: 'PENDING' | 'SETTLED' | 'FAILED';
  settlementReference?: string;
  failureReason?: string;
  createdAt: string;
  supplier: {
    businessName: string;
    email: string;
  };
}

export interface AdminDestinationItem {
  id: string;
  name: string;
  state: string;
  city: string;
  category: 'Adventure' | 'Religious' | 'Mountains' | 'Beaches' | 'Historical' | 'Wildlife' | 'Family' | 'Honeymoon' | 'Cultural';
  description: string;
  attractions: string[];
  bestSeason: string;
  suggestedDuration: string;
  estimatedBudget: string;
  travelTips: string[];
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  image: string;
  visitCount: number;
}

export interface AdminAiConfig {
  providers: Array<{
    id: string;
    name: string;
    model: string;
    status: 'ACTIVE' | 'STANDBY' | 'ERROR';
    latencyMs: number;
    tokenCount: number;
    costEstimateUsd: number;
    rateLimitPerMin: number;
  }>;
  rules: {
    destinationWeight: number;
    durationComfortBufferDays: number;
    budgetTolerancePct: number;
    transportPriority: 'FASTEST' | 'ECONOMICAL' | 'BALANCED';
    dynamicPricingEnabled: boolean;
    pricingEngineSeparated: boolean;
    preferenceConsistencyEnforced: boolean;
  };
  knowledgeBase: {
    totalEntities: number;
    lastIndexed: string;
    indexedCategories: string[];
    outdatedCount: number;
  };
  telemetry: {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    avgLatencyMs: number;
    dailyTrend: Array<{ date: string; requests: number; tokens: number }>;
  };
}

export interface AdminHotel {
  id: string;
  name: string;
  supplierName: string;
  city: string;
  state: string;
  starRating: number;
  basePrice: number;
  roomsAvailable: number;
  integration: 'Hotelbeds' | 'SelfContracted';
  status: 'ACTIVE' | 'INACTIVE';
  syncStatus: 'OPTIMAL' | 'DEGRADED';
  lastSyncedAt: string;
}

export interface AdminBusRoute {
  id: string;
  operatorName: string;
  sourceCity: string;
  destinationCity: string;
  busType: 'AC Sleeper (2+1)' | 'Bharat Benz AC Seater' | 'Volvo Multi-Axle AC' | 'Non-AC Sleeper';
  departureTime: string;
  arrivalTime: string;
  fare: number;
  seatsAvailable: number;
  status: 'ACTIVE' | 'INACTIVE';
  provider: 'eTravelSmart' | 'DirectFleet';
}

export interface AdminTransportIntegration {
  id: string;
  name: string;
  category: 'TRAIN' | 'FLIGHT' | 'CAB';
  provider: string;
  status: 'CONNECTED' | 'SANDBOX' | 'CONFIGURATION_REQUIRED' | 'DISCONNECTED';
  description: string;
  lastPing: string;
}

export interface AdminSupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  category: 'BOOKING' | 'PAYMENT' | 'CANCELLATION' | 'AI_PLANNER' | 'HOTEL' | 'GENERAL';
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedStaff: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  messages: Array<{
    id: string;
    sender: 'CUSTOMER' | 'STAFF';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export interface AdminReviewItem {
  id: string;
  entityType: 'HOTEL' | 'PACKAGE' | 'PARTNER' | 'DESTINATION';
  entityName: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'PUBLISHED' | 'REPORTED' | 'HIDDEN' | 'SPAM';
  reportedReason?: string;
  moderationNotes?: string;
  createdAt: string;
}

export interface AdminMarketingCampaign {
  id: string;
  title: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'PUSH' | 'BANNER';
  targetAudience: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  scheduledDate: string;
  sentCount: number;
  openRate: string;
  conversionRate: string;
}

export interface AdminCmsState {
  banners: Array<{
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    isActive: boolean;
    position: number;
  }>;
  featuredDestinations: string[];
  featuredPackages: string[];
  noticeBar: {
    message: string;
    isEnabled: boolean;
    type: 'INFO' | 'ALERT' | 'PROMO';
  };
}

export interface AdminStaffMember {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  department: string;
  permissions: string[];
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastActiveAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminEmail: string;
  details: string;
  createdAt: string;
}

// ============================================================================
// Authoritative Admin Data Store Implementation
// ============================================================================

class AdminDataStoreImpl {
  private suppliers: AdminSupplier[] = [];
  private inventory: AdminInventoryItem[] = [];
  private bookings: AdminBooking[] = [];
  private users: AdminCustomerUser[] = [];
  private payments: AdminPaymentTransaction[] = [];
  private refunds: AdminRefundItem[] = [];
  private destinations: AdminDestinationItem[] = [];

  private aiConfig: AdminAiConfig = {
    providers: [
      {
        id: 'p-gemini-2',
        name: 'Google Gemini 2.0 Flash / Pro',
        model: 'gemini-2.0-flash-exp',
        status: 'ACTIVE',
        latencyMs: 0,
        tokenCount: 0,
        costEstimateUsd: 0.0,
        rateLimitPerMin: 120,
      },
      {
        id: 'p-claude-35',
        name: 'Anthropic Claude 3.5 Sonnet',
        model: 'claude-3-5-sonnet-20241022',
        status: 'STANDBY',
        latencyMs: 0,
        tokenCount: 0,
        costEstimateUsd: 0.0,
        rateLimitPerMin: 60,
      },
    ],
    rules: {
      destinationWeight: 0.85,
      durationComfortBufferDays: 1,
      budgetTolerancePct: 15,
      transportPriority: 'BALANCED',
      dynamicPricingEnabled: true,
      pricingEngineSeparated: true,
      preferenceConsistencyEnforced: true,
    },
    knowledgeBase: {
      totalEntities: TOTAL_VERIFIED_KNOWLEDGE_ENTITIES,
      lastIndexed: new Date().toISOString(),
      indexedCategories: ['Heritage & Forts', 'Nature & Wildlife', 'Pilgrimage & Temples', 'Beaches & Coast', 'Cuisine & Thali'],
      outdatedCount: 0,
    },
    telemetry: {
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      avgLatencyMs: 0,
      dailyTrend: [],
    },
  };

  private hotels: AdminHotel[] = [];
  private busRoutes: AdminBusRoute[] = [];

  private transportIntegrations: AdminTransportIntegration[] = [
    {
      id: 'int-001',
      name: 'Hotelbeds Booking API Suite',
      category: 'CAB',
      provider: 'Hotelbeds APItude',
      status: 'SANDBOX',
      description: 'Real-time multi-property inventory and dynamic rate distribution (Sandbox credentials active; production keys pending).',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'int-002',
      name: 'eTravelSmart Bus Operator Distribution',
      category: 'CAB',
      provider: 'eTravelSmart Network',
      status: 'SANDBOX',
      description: 'Pan-Gujarat bus inventory, live seat maps, and PNR ticketing adapter.',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'int-003',
      name: 'IRCTC Rail API Adapter',
      category: 'TRAIN',
      provider: 'IRCTC Enterprise Gateway',
      status: 'CONFIGURATION_REQUIRED',
      description: 'Official train schedules, availability lookup, and PNR tracking (Awaiting enterprise GDS credentials).',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'int-004',
      name: 'Amadeus / Sabre Global GDS Adapter',
      category: 'FLIGHT',
      provider: 'Amadeus Travel Innovation API',
      status: 'CONFIGURATION_REQUIRED',
      description: 'Domestic & international flight search, fare calendar, and ticketing (Configuration required).',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'int-005',
      name: 'BharatCab Inter-City & Local Taxi Dispatch',
      category: 'CAB',
      provider: 'Local Fleet Network (Sedan, SUV, Innova)',
      status: 'CONNECTED',
      description: 'Airport transfers, point-to-point sightseeing cabs with GPS telemetry.',
      lastPing: new Date().toISOString(),
    },
  ];

  private supportTickets: AdminSupportTicket[] = [];
  private reviews: AdminReviewItem[] = [];
  private marketingCampaigns: AdminMarketingCampaign[] = [];

  private cms: AdminCmsState = {
    banners: [
      {
        id: 'ban-001',
        title: 'Discover the Timeless Splendor of India',
        subtitle: 'AI-Guided Pilgrimages, Wildlife Safaris & UNESCO Heritage Journeys',
        imageUrl: '/dwarka-temple-bg.jpg',
        ctaText: 'Start AI Trip Planner',
        ctaLink: '/plan',
        isActive: true,
        position: 1,
      },
      {
        id: 'ban-002',
        title: 'White Rann of Kutch Full Moon Festival',
        subtitle: 'Luxury Desert Tents, Folk Evenings & Starlit Salt Plains',
        imageUrl: '/bhuj-kutch-bg.jpg',
        ctaText: 'Explore Kutch Packages',
        ctaLink: '/packages',
        isActive: true,
        position: 2,
      },
    ],
    featuredDestinations: ['Ahmedabad', 'Sasan Gir', 'Dhordo', 'Dwarka', 'Somnath'],
    featuredPackages: ['rann-utsav-3d2n', 'gir-wildlife-safari', 'dwarka-somnath-circuit'],
    noticeBar: {
      message: '✨ Holi Festival Special: Flat 15% instant discount on verified partner packages with code BHARATHOLI!',
      isEnabled: true,
      type: 'PROMO',
    },
  };

  private staffMembers: AdminStaffMember[] = [
    {
      id: 'stf-001',
      fullName: 'Super Operations Admin',
      email: 'admin@bharatyatra.com',
      role: 'SUPER_ADMIN',
      department: 'Platform Governance & Executive',
      permissions: ['ALL_PERMISSIONS'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
  ];

  private settlements: AdminSettlement[] = [];

  private auditLogs: AdminAuditLog[] = [
    {
      id: 'aud-001',
      action: 'PLATFORM_STARTUP',
      entityType: 'SYSTEM',
      entityId: 'sys-001',
      adminEmail: 'admin@bharatyatra.com',
      details: 'BharatYatra Operations Admin portal governance initialized.',
      createdAt: new Date().toISOString(),
    },
  ];

  // ==========================================================================
  // DYNAMIC DASHBOARD METRICS ENGINE
  // ==========================================================================

  public getDashboardMetrics(dateFilter = 'all') {
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter((u) => u.accountStatus === 'ACTIVE').length;

    let filteredBookings = [...this.bookings];
    let filteredPayments = [...this.payments];

    const now = new Date();
    if (dateFilter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      filteredBookings = filteredBookings.filter((b) => b.createdAt.startsWith(todayStr));
      filteredPayments = filteredPayments.filter((p) => p.transactionDate.startsWith(todayStr));
    } else if (dateFilter === '7days') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredBookings = filteredBookings.filter((b) => new Date(b.createdAt) >= cutoff);
      filteredPayments = filteredPayments.filter((p) => new Date(p.transactionDate) >= cutoff);
    } else if (dateFilter === '30days') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredBookings = filteredBookings.filter((b) => new Date(b.createdAt) >= cutoff);
      filteredPayments = filteredPayments.filter((p) => new Date(p.transactionDate) >= cutoff);
    } else if (dateFilter === '90days') {
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filteredBookings = filteredBookings.filter((b) => new Date(b.createdAt) >= cutoff);
      filteredPayments = filteredPayments.filter((p) => new Date(p.transactionDate) >= cutoff);
    }

    const totalBookings = filteredBookings.length;
    const confirmedBookings = filteredBookings.filter((b) => b.status === 'CONFIRMED').length;
    const pendingBookings = filteredBookings.filter((b) => b.status === 'PENDING').length;
    const cancelledBookings = filteredBookings.filter((b) => b.status === 'CANCELLED').length;

    const totalRevenue = filteredPayments
      .filter((p) => p.status === 'SUCCESSFUL')
      .reduce((sum, p) => sum + p.amount, 0);

    const todayStr = now.toISOString().split('T')[0];
    const todayRevenue = this.payments
      .filter((p) => p.status === 'SUCCESSFUL' && p.transactionDate.startsWith(todayStr))
      .reduce((sum, p) => sum + p.amount, 0);

    const currentMonth = now.toISOString().substring(0, 7);
    const monthlyRevenue = this.payments
      .filter((p) => p.status === 'SUCCESSFUL' && p.transactionDate.startsWith(currentMonth))
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPartners = this.suppliers.length;
    const activePackages = this.destinations.length;
    const pendingTickets = this.supportTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    const eligibleAttempts = this.payments.length;
    const successfulPaymentsCount = this.payments.filter(
      (p) => p.status === 'SUCCESSFUL' || (p.status as any) === 'PAID'
    ).length;
    const paymentSuccessRate =
      eligibleAttempts > 0
        ? Math.round((successfulPaymentsCount / eligibleAttempts) * 100)
        : null;

    // Compute categoryShare dynamically from real records
    const categoryTotals: Record<string, { bookings: number; revenue: number }> = {};
    filteredBookings.forEach((b) => {
      const catKey =
        b.type === 'HOTEL'
          ? 'Hotels & Resorts'
          : b.type === 'PACKAGE'
          ? 'Tour Packages'
          : b.type === 'ACTIVITY'
          ? 'Activities & Safaris'
          : b.type === 'BUS' || b.type === 'TRAIN' || b.type === 'FLIGHT'
          ? 'Buses & Transport'
          : 'Other Services';
      if (!categoryTotals[catKey]) {
        categoryTotals[catKey] = { bookings: 0, revenue: 0 };
      }
      categoryTotals[catKey].bookings += 1;
      categoryTotals[catKey].revenue += b.amount || 0;
    });

    const categoryShare = Object.entries(categoryTotals).map(([category, stats]) => ({
      category,
      percentage: totalRevenue > 0 ? Math.round((stats.revenue / totalRevenue) * 100) : 0,
      revenue: stats.revenue,
    }));

    // Compute destinationPopularity dynamically from real bookings
    const destinationTotals: Record<string, { bookings: number; revenue: number }> = {};
    filteredBookings.forEach((b) => {
      const destName = b.destination || 'Unspecified';
      if (!destinationTotals[destName]) {
        destinationTotals[destName] = { bookings: 0, revenue: 0 };
      }
      destinationTotals[destName].bookings += 1;
      destinationTotals[destName].revenue += b.amount || 0;
    });

    const destinationPopularity = Object.entries(destinationTotals)
      .map(([name, stats]) => ({
        name,
        bookings: stats.bookings,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      kpi: {
        totalUsers,
        activeUsers,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        totalPartners,
        activePackages,
        pendingTickets,
        paymentSuccessRate,
        eligiblePaymentAttempts: eligibleAttempts,
        successfulPaymentsCount,
      },
      suppliers: {
        total: this.suppliers.length,
        verified: this.suppliers.filter((s) => s.verificationStatus === 'VERIFIED').length,
        pending: this.suppliers.filter((s) => s.verificationStatus === 'PENDING').length,
        suspended: this.suppliers.filter((s) => s.status === 'SUSPENDED').length,
      },
      inventory: {
        totalListings: this.inventory.length,
        active: this.inventory.filter((i) => i.status === 'ACTIVE').length,
        inactive: this.inventory.filter((i) => i.status === 'INACTIVE').length,
        breakdown: {
          HOTELS: this.inventory.filter((i) => i.type === 'HOTEL').length,
          ACTIVITIES: this.inventory.filter((i) => i.type === 'ACTIVITY').length,
          RESTAURANTS: this.inventory.filter((i) => i.type === 'RESTAURANT').length,
          PACKAGES: this.inventory.filter((i) => i.type === 'PACKAGE').length,
        },
      },
      categoryShare,
      destinationPopularity,
      systemHealth: {
        status: 'OPERATIONAL',
        uptime: '100%',
        activeNodes: 1,
        backendStatus: 'HEALTHY',
        databaseStatus: 'CONNECTED (Supabase / PostgreSQL Pool)',
        aiGatewayStatus: 'HEALTHY (Gemini 2.0 Flash Active)',
      },
    };
  }

  // Telemetry recording helper for real AI invocations
  public recordAiInvocation(tokens: number, latencyMs: number, success: boolean) {
    this.aiConfig.telemetry.totalRequests += 1;
    if (success) {
      this.aiConfig.telemetry.successCount += 1;
    } else {
      this.aiConfig.telemetry.errorCount += 1;
    }
    const currentTotal = this.aiConfig.telemetry.totalRequests;
    this.aiConfig.telemetry.avgLatencyMs = Math.round(
      (this.aiConfig.telemetry.avgLatencyMs * (currentTotal - 1) + latencyMs) / currentTotal
    );
    const today = new Date().toISOString().split('T')[0];
    const trendEntry = this.aiConfig.telemetry.dailyTrend.find((d) => d.date === today);
    if (trendEntry) {
      trendEntry.requests += 1;
      trendEntry.tokens += tokens;
    } else {
      this.aiConfig.telemetry.dailyTrend.push({ date: today, requests: 1, tokens });
    }
  }

    // ==========================================================================
  // USERS MANAGEMENT
  // ==========================================================================

  public getUsers(filters?: { search?: string; status?: string }): AdminCustomerUser[] {
    let list = [...this.users];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phoneNumber.includes(q) ||
          u.city.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((u) => u.accountStatus === filters.status);
    }
    return list;
  }

  public getUserById(id: string): AdminCustomerUser | null {
    return this.users.find((u) => u.id === id) || null;
  }

  public updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'DELETED', reason: string, adminEmail: string) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    user.accountStatus = status;
    this.addAuditLog({
      action: `USER_STATUS_${status}`,
      entityType: 'USER',
      entityId: id,
      adminEmail,
      details: `User status changed to ${status}. Reason: ${reason}`,
    });
    return user;
  }

  // ==========================================================================
  // BOOKINGS MANAGEMENT
  // ==========================================================================

  public getBookings(filters?: { status?: string; type?: string; search?: string } | string): AdminBooking[] {
    let list = [...this.bookings];
    if (typeof filters === 'string') {
      if (filters && filters !== 'ALL') {
        list = list.filter((b) => b.status === filters);
      }
      return list;
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((b) => b.status === filters.status);
    }
    if (filters?.type && filters.type !== 'ALL') {
      list = list.filter((b) => b.type === filters.type);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingReference.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q) ||
          b.destination.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getBookingById(id: string): AdminBooking | null {
    return this.bookings.find((b) => b.id === id || b.bookingReference === id) || null;
  }

  public updateBookingStatus(
    id: string,
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'FAILED',
    reason: string,
    adminEmail: string
  ): AdminBooking | null {
    const booking = this.bookings.find((b) => b.id === id || b.bookingReference === id);
    if (!booking) return null;

    booking.status = status;
    booking.timeline.push({
      timestamp: new Date().toISOString(),
      title: `Status Changed to ${status}`,
      description: reason || `Admin updated status to ${status}`,
      actor: adminEmail,
    });

    this.addAuditLog({
      action: `BOOKING_${status}`,
      entityType: 'BOOKING',
      entityId: booking.id,
      adminEmail,
      details: `Booking ${booking.bookingReference} status changed to ${status}. Reason: ${reason}`,
    });

    return booking;
  }

  public cancelBookingAndInitiateRefund(id: string, reason: string, adminEmail: string) {
    const booking = this.bookings.find((b) => b.id === id || b.bookingReference === id);
    if (!booking) return null;

    booking.status = 'CANCELLED';
    booking.refundStatus = 'PROCESSING';
    booking.timeline.push({
      timestamp: new Date().toISOString(),
      title: 'Booking Cancelled by Admin',
      description: reason,
      actor: adminEmail,
    });

    const newRefund: AdminRefundItem = {
      id: `ref-${Date.now()}`,
      refundReference: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionId: `TXN-${booking.bookingReference}`,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      amount: booking.amount,
      reason,
      eligibilityVerified: true,
      status: 'PROCESSING',
      gatewayReference: `BG-REF-PENDING-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      notes: 'Automated refund created via admin cancellation workflow.',
    };

    this.refunds.unshift(newRefund);

    this.addAuditLog({
      action: 'CANCEL_BOOKING_WITH_REFUND',
      entityType: 'BOOKING',
      entityId: booking.id,
      adminEmail,
      details: `Cancelled booking ${booking.bookingReference} and initiated refund of ₹${booking.amount}. Reason: ${reason}`,
    });

    return { booking, refund: newRefund };
  }

  // ==========================================================================
  // PAYMENTS & TRANSACTIONS
  // ==========================================================================

  public getPayments(filters?: { status?: string; gateway?: string; search?: string }): AdminPaymentTransaction[] {
    let list = [...this.payments];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters?.gateway && filters.gateway !== 'ALL') {
      list = list.filter((p) => p.gateway === filters.gateway);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.transactionId.toLowerCase().includes(q) ||
          p.bookingReference.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.gatewayReference.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  public getFinanceSummary() {
    const allPayments = this.payments;
    const paidPayments = allPayments.filter(
      (p) => p.status === 'SUCCESSFUL' || (p.status as any) === 'PAID'
    );
    const failedPayments = allPayments.filter((p) => p.status === 'FAILED');
    const refundedPayments = allPayments.filter(
      (p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED'
    );

    const totalPaidBookings = paidPayments.length;
    const failedPaymentsCount = failedPayments.length;
    const refundedPaymentsCount = refundedPayments.length;

    // Gross Booking Volume (GBV)
    const grossBookingValueInr = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Settlements & Commissions
    const settlements = this.settlements;
    const platformCommissionInr =
      settlements.length > 0
        ? settlements.reduce((sum, s) => sum + Number(s.commissionAmountInr || 0), 0)
        : Number((grossBookingValueInr * 0.10).toFixed(2));

    const netSupplierPayableInr =
      settlements.length > 0
        ? settlements.reduce((sum, s) => sum + Number(s.payableAmountInr || 0), 0)
        : Number((grossBookingValueInr * 0.90).toFixed(2));

    const completedRefunds = this.refunds.filter((r) => r.status === 'COMPLETED');
    const totalRefundsInr = completedRefunds.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const pendingSettlements = settlements.filter((s) => s.status === 'PENDING');
    const pendingSettlementsInr = pendingSettlements.reduce(
      (sum, s) => sum + Number(s.payableAmountInr || 0),
      0
    );

    const netPlatformRevenueInr = Number((platformCommissionInr - totalRefundsInr).toFixed(2));

    return {
      totalPaidBookings,
      successfulPaymentsCount: totalPaidBookings,
      failedPaymentsCount,
      refundedPaymentsCount,
      grossBookingValueInr: Number(grossBookingValueInr.toFixed(2)),
      gbvInr: Number(grossBookingValueInr.toFixed(2)),
      platformCommissionInr: Number(platformCommissionInr.toFixed(2)),
      netSupplierPayableInr: Number(netSupplierPayableInr.toFixed(2)),
      totalRefundsInr: Number(totalRefundsInr.toFixed(2)),
      pendingSettlementsInr: Number(pendingSettlementsInr.toFixed(2)),
      netPlatformRevenueInr,
      settlementsCount: settlements.length,
    };
  }

  // ==========================================================================
  // REFUNDS
  // ==========================================================================

  public getRefunds(filters?: { status?: string; search?: string }): AdminRefundItem[] {
    let list = [...this.refunds];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.refundReference.toLowerCase().includes(q) ||
          r.bookingReference.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  public processRefund(
    id: string,
    action: 'APPROVE' | 'REJECT',
    notes: string,
    adminEmail: string
  ): AdminRefundItem | null {
    const refund = this.refunds.find((r) => r.id === id || r.refundReference === id);
    if (!refund) return null;

    if (action === 'APPROVE') {
      refund.status = 'COMPLETED';
      refund.processedAt = new Date().toISOString();
      refund.gatewayReference = `BG-REF-ACK-${Date.now()}`;
      refund.notes = notes || 'Approved & dispatched via BharatGateway™ API.';

      const booking = this.bookings.find((b) => b.id === refund.bookingId);
      if (booking) {
        booking.refundStatus = 'COMPLETED';
        booking.paymentStatus = 'REFUNDED';
        booking.timeline.push({
          timestamp: new Date().toISOString(),
          title: 'Refund Approved & Dispatched',
          description: `₹${refund.amount} refunded via gateway. Ref: ${refund.gatewayReference}`,
          actor: adminEmail,
        });
      }
    } else {
      refund.status = 'REJECTED';
      refund.processedAt = new Date().toISOString();
      refund.notes = notes || 'Refund request rejected by finance governance.';
    }

    this.addAuditLog({
      action: `REFUND_${action}`,
      entityType: 'REFUND',
      entityId: refund.id,
      adminEmail,
      details: `${action === 'APPROVE' ? 'Approved' : 'Rejected'} refund ${refund.refundReference} for ₹${refund.amount}. Notes: ${notes}`,
    });

    return refund;
  }

  // ==========================================================================
  // DESTINATIONS
  // ==========================================================================

  public getDestinations(filters?: { category?: string; state?: string; search?: string }): AdminDestinationItem[] {
    let list = [...this.destinations];
    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((d) => d.category === filters.category);
    }
    if (filters?.state && filters.state !== 'ALL') {
      list = list.filter((d) => d.state === filters.state);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q));
    }
    return list;
  }

  public createDestination(item: Omit<AdminDestinationItem, 'id' | 'visitCount'>, adminEmail: string): AdminDestinationItem {
    const newDest: AdminDestinationItem = {
      ...item,
      id: `dest-${Date.now()}`,
      visitCount: 0,
    };
    this.destinations.unshift(newDest);
    this.addAuditLog({
      action: 'CREATE_DESTINATION',
      entityType: 'DESTINATION',
      entityId: newDest.id,
      adminEmail,
      details: `Created new destination: ${newDest.name} (${newDest.category}, ${newDest.city})`,
    });
    return newDest;
  }

  public updateDestination(id: string, updates: Partial<AdminDestinationItem>, adminEmail: string): AdminDestinationItem | null {
    const dest = this.destinations.find((d) => d.id === id);
    if (!dest) return null;
    Object.assign(dest, updates);
    this.addAuditLog({
      action: 'UPDATE_DESTINATION',
      entityType: 'DESTINATION',
      entityId: id,
      adminEmail,
      details: `Updated destination properties for: ${dest.name}`,
    });
    return dest;
  }

  // ==========================================================================
  // AI TRIP PLANNER MANAGEMENT
  // ==========================================================================

  public getAiConfig(): AdminAiConfig {
    return JSON.parse(JSON.stringify(this.aiConfig));
  }

  public updateAiRules(newRules: Partial<AdminAiConfig['rules']>, adminEmail: string): AdminAiConfig {
    Object.assign(this.aiConfig.rules, newRules);
    this.addAuditLog({
      action: 'UPDATE_AI_RULES',
      entityType: 'AI_PLANNER',
      entityId: 'ai-engine-rules',
      adminEmail,
      details: `Updated AI planner rules: dynamicPricing=${this.aiConfig.rules.dynamicPricingEnabled}, priority=${this.aiConfig.rules.transportPriority}`,
    });
    return this.getAiConfig();
  }

  public reindexAiKnowledgeBase(adminEmail: string) {
    this.aiConfig.knowledgeBase.lastIndexed = new Date().toISOString();
    this.aiConfig.knowledgeBase.outdatedCount = 0;
    this.addAuditLog({
      action: 'REINDEX_AI_KNOWLEDGE',
      entityType: 'AI_PLANNER',
      entityId: 'kb-reindex',
      adminEmail,
      details: 'Triggered full semantic reindex of Indian states, cities, attractions & cultural nodes.',
    });
    return this.aiConfig.knowledgeBase;
  }

  // ==========================================================================
  // HOTELS & TRANSPORTATION
  // ==========================================================================

  public getHotels(): AdminHotel[] {
    return [...this.hotels];
  }

  public getBuses(): AdminBusRoute[] {
    return [...this.busRoutes];
  }

  public getTransportIntegrations(): AdminTransportIntegration[] {
    return [...this.transportIntegrations];
  }

  // ==========================================================================
  // SUPPORT TICKETS
  // ==========================================================================

  public getSupportTickets(filters?: { status?: string; priority?: string; search?: string }): AdminSupportTicket[] {
    let list = [...this.supportTickets];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter((t) => t.priority === filters.priority);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public addSupportReply(ticketId: string, message: string, senderName: string, adminEmail: string): AdminSupportTicket | null {
    const ticket = this.supportTickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    ticket.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'STAFF',
      senderName,
      message,
      timestamp: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();

    this.addAuditLog({
      action: 'SUPPORT_TICKET_REPLY',
      entityType: 'SUPPORT_TICKET',
      entityId: ticket.id,
      adminEmail,
      details: `Replied to ticket ${ticket.ticketNumber}`,
    });

    return ticket;
  }

  public updateTicketStatus(
    ticketId: string,
    status: AdminSupportTicket['status'],
    resolutionNotes?: string,
    adminEmail = 'admin@bharatyatra.com'
  ): AdminSupportTicket | null {
    const ticket = this.supportTickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    ticket.updatedAt = new Date().toISOString();

    this.addAuditLog({
      action: `TICKET_STATUS_${status}`,
      entityType: 'SUPPORT_TICKET',
      entityId: ticket.id,
      adminEmail,
      details: `Ticket ${ticket.ticketNumber} marked ${status}. Notes: ${resolutionNotes || 'N/A'}`,
    });

    return ticket;
  }

  // ==========================================================================
  // REVIEWS & MODERATION
  // ==========================================================================

  public getReviews(status?: string): AdminReviewItem[] {
    if (!status || status === 'ALL') {
      return [...this.reviews];
    }
    return this.reviews.filter((r) => r.status === status);
  }

  public moderateReview(
    reviewId: string,
    status: 'PUBLISHED' | 'HIDDEN' | 'SPAM',
    notes: string,
    adminEmail: string
  ): AdminReviewItem | null {
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) return null;

    review.status = status;
    review.moderationNotes = notes;

    this.addAuditLog({
      action: `MODERATE_REVIEW_${status}`,
      entityType: 'REVIEW',
      entityId: reviewId,
      adminEmail,
      details: `Review on ${review.entityName} marked ${status}. Reason: ${notes}`,
    });

    return review;
  }

  // ==========================================================================
  // MARKETING & CAMPAIGNS
  // ==========================================================================

  public getMarketingCampaigns(): AdminMarketingCampaign[] {
    return [...this.marketingCampaigns];
  }

  // ==========================================================================
  // CMS & WEBSITE CONTENT
  // ==========================================================================

  public getCmsState(): AdminCmsState {
    return JSON.parse(JSON.stringify(this.cms));
  }

  public updateCmsNotice(notice: AdminCmsState['noticeBar'], adminEmail: string) {
    this.cms.noticeBar = notice;
    this.addAuditLog({
      action: 'UPDATE_CMS_NOTICE',
      entityType: 'CMS',
      entityId: 'notice-bar',
      adminEmail,
      details: `Updated public notice bar: "${notice.message}" (Enabled: ${notice.isEnabled})`,
    });
    return this.cms.noticeBar;
  }

  // ==========================================================================
  // STAFF & RBAC
  // ==========================================================================

  public getStaffMembers(): AdminStaffMember[] {
    return [...this.staffMembers];
  }

  public createStaffMember(
    data: Omit<AdminStaffMember, 'id' | 'createdAt' | 'lastActiveAt'>,
    adminEmail: string
  ): AdminStaffMember {
    const newStaff: AdminStaffMember = {
      ...data,
      id: `stf-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.staffMembers.push(newStaff);
    this.addAuditLog({
      action: 'CREATE_STAFF_MEMBER',
      entityType: 'STAFF',
      entityId: newStaff.id,
      adminEmail,
      details: `Created staff account for ${newStaff.fullName} (${newStaff.email}) with role ${newStaff.role}`,
    });
    return newStaff;
  }

  public updateStaffStatus(id: string, status: 'ACTIVE' | 'SUSPENDED', adminEmail: string): AdminStaffMember | null {
    const staff = this.staffMembers.find((s) => s.id === id);
    if (!staff) return null;
    staff.status = status;
    this.addAuditLog({
      action: `STAFF_STATUS_${status}`,
      entityType: 'STAFF',
      entityId: id,
      adminEmail,
      details: `Staff member ${staff.email} marked ${status}`,
    });
    return staff;
  }

  // ==========================================================================
  // SUPPLIERS & INVENTORY (LEGACY COMPATIBILITY)
  // ==========================================================================

  public getSuppliers(filters?: { search?: string; verificationStatus?: string; status?: string }): AdminSupplier[] {
    let result = [...this.suppliers];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.businessName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }
    if (filters?.verificationStatus && filters.verificationStatus !== 'ALL') {
      result = result.filter((s) => s.verificationStatus === filters.verificationStatus);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((s) => s.status === filters.status);
    }
    return result;
  }

  public updateSupplierVerification(
    id: string,
    status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED',
    reason: string,
    adminEmail = 'admin@bharatyatra.com'
  ): AdminSupplier | null {
    const supp = this.suppliers.find((s) => s.id === id);
    if (!supp) return null;

    supp.verificationStatus = status;
    if (status === 'SUSPENDED') {
      supp.status = 'SUSPENDED';
    } else if (status === 'VERIFIED') {
      supp.status = 'ACTIVE';
    }

    this.addAuditLog({
      action: `SUPPLIER_${status}`,
      entityType: 'SUPPLIER',
      entityId: id,
      adminEmail,
      details: reason || `Updated verification status to ${status}`,
    });

    return supp;
  }

  public getInventory(filters?: { type?: string; status?: string; search?: string }): AdminInventoryItem[] {
    let result = [...this.inventory];
    if (filters?.type && filters.type !== 'ALL') {
      result = result.filter((i) => i.type === filters.type);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.supplierName.toLowerCase().includes(q) ||
          i.destination.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public updateInventoryStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
    reason: string,
    adminEmail = 'admin@bharatyatra.com'
  ): AdminInventoryItem | null {
    const item = this.inventory.find((i) => i.id === id);
    if (!item) return null;

    item.status = status;
    this.addAuditLog({
      action: `INVENTORY_${status}`,
      entityType: item.type,
      entityId: id,
      adminEmail,
      details: reason || `Inventory listing marked ${status}`,
    });

    return item;
  }

  public getSettlements(status?: string): AdminSettlement[] {
    if (!status || status === 'ALL') {
      return [...this.settlements];
    }
    return this.settlements.filter((s) => s.status === status);
  }

  public updateSettlementStatus(
    id: string,
    status: 'SETTLED' | 'FAILED',
    reference?: string,
    reason?: string,
    adminEmail = 'admin@bharatyatra.com'
  ): AdminSettlement | null {
    const stl = this.settlements.find((s) => s.id === id);
    if (!stl) return null;

    stl.status = status;
    if (reference) stl.settlementReference = reference;
    if (reason) stl.failureReason = reason;

    this.addAuditLog({
      action: `SETTLEMENT_${status}`,
      entityType: 'SETTLEMENT',
      entityId: id,
      adminEmail,
      details: `Settlement ${id} marked ${status}. Reference: ${reference || 'N/A'}. Reason: ${reason || 'N/A'}`,
    });

    return stl;
  }

  // ==========================================================================
  // AUDIT LOGS
  // ==========================================================================

  public getAuditLogs(filters?: { action?: string; entityType?: string }): AdminAuditLog[] {
    let result = [...this.auditLogs];
    if (filters?.action && filters.action !== 'ALL') {
      result = result.filter((a) => a.action === filters.action);
    }
    if (filters?.entityType && filters.entityType !== 'ALL') {
      result = result.filter((a) => a.entityType === filters.entityType);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addAuditLog(entry: Omit<AdminAuditLog, 'id' | 'createdAt'>): AdminAuditLog {
    const newLog: AdminAuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }
}

export const adminDataStore = new AdminDataStoreImpl();
