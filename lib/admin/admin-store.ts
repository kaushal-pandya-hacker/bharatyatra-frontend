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
  private suppliers: AdminSupplier[] = [
    {
      id: 'supp-001',
      businessName: 'Heritage Haveli Stays & Resorts',
      businessType: 'HOTEL',
      email: 'partnerships@heritagehaveli.in',
      phone: '+91 98250 11223',
      city: 'Ahmedabad',
      totalInventoryCount: 8,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      createdAt: '2026-01-15T09:30:00Z',
    },
    {
      id: 'supp-002',
      businessName: 'Gir Wild Safari Expeditions',
      businessType: 'ACTIVITY',
      email: 'bookings@girwildsafari.in',
      phone: '+91 94280 44556',
      city: 'Sasan Gir',
      totalInventoryCount: 4,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      createdAt: '2026-01-20T11:15:00Z',
    },
    {
      id: 'supp-003',
      businessName: 'Kathiyawadi Thaal Dining Heritage',
      businessType: 'RESTAURANT',
      email: 'manager@kathiyawadithaal.in',
      phone: '+91 97120 77889',
      city: 'Rajkot',
      totalInventoryCount: 2,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      createdAt: '2026-02-01T14:45:00Z',
    },
    {
      id: 'supp-004',
      businessName: 'Kutch White Desert Eco Tents',
      businessType: 'HOTEL',
      email: 'ecotents@kutchrann.org',
      phone: '+91 99090 33221',
      city: 'Bhuj',
      totalInventoryCount: 12,
      verificationStatus: 'PENDING',
      status: 'ACTIVE',
      createdAt: '2026-02-28T16:00:00Z',
    },
    {
      id: 'supp-005',
      businessName: 'Dwarka Seafront Pilgrimage Suites',
      businessType: 'HOTEL',
      email: 'stay@dwarkasuites.com',
      phone: '+91 96380 99887',
      city: 'Dwarka',
      totalInventoryCount: 6,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      createdAt: '2026-03-02T10:00:00Z',
    },
  ];

  private inventory: AdminInventoryItem[] = [
    {
      id: 'inv-001',
      name: 'The Ummed Ahmedabad Luxury Stay',
      type: 'HOTEL',
      supplierId: 'supp-001',
      supplierName: 'Heritage Haveli Stays & Resorts',
      destination: 'Ahmedabad, Gujarat',
      price: 5500,
      status: 'ACTIVE',
      createdAt: '2026-01-16T10:00:00Z',
    },
    {
      id: 'inv-002',
      name: 'Gir Lion Morning Safari Trail',
      type: 'ACTIVITY',
      supplierId: 'supp-002',
      supplierName: 'Gir Wild Safari Expeditions',
      destination: 'Sasan Gir, Gujarat',
      price: 2400,
      status: 'ACTIVE',
      createdAt: '2026-01-21T12:00:00Z',
    },
    {
      id: 'inv-003',
      name: 'Royal Heritage Gujarati Thali Experience',
      type: 'RESTAURANT',
      supplierId: 'supp-003',
      supplierName: 'Kathiyawadi Thaal Dining Heritage',
      destination: 'Rajkot, Gujarat',
      price: 650,
      status: 'ACTIVE',
      createdAt: '2026-02-02T15:00:00Z',
    },
    {
      id: 'inv-004',
      name: 'White Rann Desert Glamping Tent',
      type: 'HOTEL',
      supplierId: 'supp-004',
      supplierName: 'Kutch White Desert Eco Tents',
      destination: 'Dhordo, Kutch',
      price: 8500,
      status: 'ACTIVE',
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'inv-005',
      name: 'Dwarka Temple View Deluxe Suite',
      type: 'HOTEL',
      supplierId: 'supp-005',
      supplierName: 'Dwarka Seafront Pilgrimage Suites',
      destination: 'Dwarka, Gujarat',
      price: 3800,
      status: 'ACTIVE',
      createdAt: '2026-03-03T11:00:00Z',
    },
  ];

  private bookings: AdminBooking[] = [
    {
      id: 'bk-001',
      bookingReference: 'BY-2026-AHM-9102',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      customerPhone: '+91 98200 12345',
      type: 'HOTEL',
      supplierId: 'supp-001',
      supplierName: 'Heritage Haveli Stays & Resorts',
      travelDate: '2026-03-15',
      destination: 'Ahmedabad, Gujarat',
      amount: 11000,
      paymentStatus: 'SUCCESSFUL',
      status: 'CONFIRMED',
      confirmationReference: 'CONF-HH-9102',
      refundStatus: 'NONE',
      timeline: [
        { timestamp: '2026-03-01T10:15:00Z', title: 'Booking Created', description: 'Customer initiated checkout for 2 nights stay.', actor: 'Rahul Sharma' },
        { timestamp: '2026-03-01T10:17:30Z', title: 'Payment Captured', description: 'Captured ₹11,000 via UPI (TXN-9102).', actor: 'BharatGateway™' },
        { timestamp: '2026-03-01T10:18:00Z', title: 'Supplier Confirmed', description: 'Heritage Haveli allocated Deluxe Heritage Room.', actor: 'Supplier Adapter' },
      ],
      createdAt: '2026-03-01T10:15:00Z',
      details: { nights: 2, guests: 2, roomType: 'Deluxe Heritage Room' },
    },
    {
      id: 'bk-002',
      bookingReference: 'BY-2026-GIR-4411',
      customerName: 'Priya Patel',
      customerEmail: 'priya.patel@example.com',
      customerPhone: '+91 97123 45678',
      type: 'ACTIVITY',
      supplierId: 'supp-002',
      supplierName: 'Gir Wild Safari Expeditions',
      travelDate: '2026-03-20',
      destination: 'Sasan Gir, Gujarat',
      amount: 4800,
      paymentStatus: 'SUCCESSFUL',
      status: 'CONFIRMED',
      confirmationReference: 'CONF-GIR-4411',
      refundStatus: 'NONE',
      timeline: [
        { timestamp: '2026-03-02T14:30:00Z', title: 'Booking Created', description: 'Gir Lion Morning Safari Trail (2 Pax)', actor: 'Priya Patel' },
        { timestamp: '2026-03-02T14:32:00Z', title: 'Payment Captured', description: 'Captured ₹4,800 via Card (TXN-4411)', actor: 'BharatGateway™' },
        { timestamp: '2026-03-02T14:33:00Z', title: 'Permit Issued', description: 'Gujarat Forest Dept entry permit generated.', actor: 'Gir Safari System' },
      ],
      createdAt: '2026-03-02T14:30:00Z',
      details: { participants: 2, slot: 'Morning 6:00 AM - 9:00 AM' },
    },
    {
      id: 'bk-003',
      bookingReference: 'BY-2026-KUT-7729',
      customerName: 'Amit Verma',
      customerEmail: 'amit.verma@example.com',
      customerPhone: '+91 99887 66554',
      type: 'PACKAGE',
      supplierId: 'supp-004',
      supplierName: 'Kutch White Desert Eco Tents',
      travelDate: '2026-03-25',
      destination: 'Dhordo, Kutch',
      amount: 17000,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      confirmationReference: 'PENDING-SUPPLIER-VERIFICATION',
      refundStatus: 'NONE',
      timeline: [
        { timestamp: '2026-03-04T08:45:00Z', title: 'Booking Initiated', description: 'Rann Utsav Glamping 3D2N Tour Package', actor: 'Amit Verma' },
        { timestamp: '2026-03-04T08:46:00Z', title: 'Awaiting Gateway Callback', description: 'Order created, awaiting user payment completion.', actor: 'BharatGateway™' },
      ],
      createdAt: '2026-03-04T08:45:00Z',
      details: { packageType: '3D2N Full Moon Glamping', pax: 2 },
    },
    {
      id: 'bk-004',
      bookingReference: 'BY-2026-BUS-1082',
      customerName: 'Sunita Joshi',
      customerEmail: 'sunita.joshi@example.com',
      customerPhone: '+91 98450 99112',
      type: 'BUS',
      supplierId: 'supp-bus-01',
      supplierName: 'GSRTC Volvo Premier',
      travelDate: '2026-03-18',
      destination: 'Ahmedabad to Somnath',
      amount: 1650,
      paymentStatus: 'SUCCESSFUL',
      status: 'CONFIRMED',
      confirmationReference: 'PNR-GSRTC-88910',
      refundStatus: 'NONE',
      timeline: [
        { timestamp: '2026-03-03T11:00:00Z', title: 'Seat Reserved', description: 'Seat 14 (Window, Lower Berth)', actor: 'Sunita Joshi' },
        { timestamp: '2026-03-03T11:02:00Z', title: 'Payment Success', description: 'Captured ₹1,650 via UPI.', actor: 'BharatGateway™' },
        { timestamp: '2026-03-03T11:03:00Z', title: 'e-Ticket Dispatched', description: 'Sent via SMS and WhatsApp.', actor: 'eTravelSmart Hub' },
      ],
      createdAt: '2026-03-03T11:00:00Z',
      details: { seatNumber: '14', busType: 'Volvo AC Multi-Axle Sleeper' },
    },
    {
      id: 'bk-005',
      bookingReference: 'BY-2026-DWR-3301',
      customerName: 'Anand Kulkarni',
      customerEmail: 'anand.k@example.com',
      customerPhone: '+91 94000 88221',
      type: 'HOTEL',
      supplierId: 'supp-005',
      supplierName: 'Dwarka Seafront Pilgrimage Suites',
      travelDate: '2026-03-10',
      destination: 'Dwarka, Gujarat',
      amount: 7600,
      paymentStatus: 'REFUNDED',
      status: 'CANCELLED',
      confirmationReference: 'CAN-DWR-3301',
      refundStatus: 'COMPLETED',
      timeline: [
        { timestamp: '2026-02-25T15:20:00Z', title: 'Booking Confirmed', description: '2 nights stay booked.', actor: 'Anand Kulkarni' },
        { timestamp: '2026-02-28T09:10:00Z', title: 'Cancellation Requested', description: 'Customer emergency travel postponement.', actor: 'Anand Kulkarni' },
        { timestamp: '2026-02-28T09:15:00Z', title: 'Refund Dispatched', description: 'Processed ₹7,600 refund via BharatGateway™ API (REF-8821).', actor: 'Admin Desk' },
      ],
      createdAt: '2026-02-25T15:20:00Z',
      details: { nights: 2, refundAmount: 7600 },
    },
  ];

  private users: AdminCustomerUser[] = [
    {
      id: 'usr-001',
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phoneNumber: '+91 98200 12345',
      accountStatus: 'ACTIVE',
      totalBookings: 4,
      totalSpent: 42500,
      city: 'Mumbai',
      state: 'Maharashtra',
      registrationDate: '2025-11-12T10:00:00Z',
      lastLogin: '2026-03-01T10:14:00Z',
      kycVerified: true,
    },
    {
      id: 'usr-002',
      fullName: 'Priya Patel',
      email: 'priya.patel@example.com',
      phoneNumber: '+91 97123 45678',
      accountStatus: 'ACTIVE',
      totalBookings: 2,
      totalSpent: 18200,
      city: 'Ahmedabad',
      state: 'Gujarat',
      registrationDate: '2026-01-05T14:20:00Z',
      lastLogin: '2026-03-02T14:25:00Z',
      kycVerified: true,
    },
    {
      id: 'usr-003',
      fullName: 'Amit Verma',
      email: 'amit.verma@example.com',
      phoneNumber: '+91 99887 66554',
      accountStatus: 'ACTIVE',
      totalBookings: 1,
      totalSpent: 17000,
      city: 'New Delhi',
      state: 'Delhi',
      registrationDate: '2026-02-18T18:00:00Z',
      lastLogin: '2026-03-04T08:40:00Z',
      kycVerified: false,
    },
    {
      id: 'usr-004',
      fullName: 'Sunita Joshi',
      email: 'sunita.joshi@example.com',
      phoneNumber: '+91 98450 99112',
      accountStatus: 'ACTIVE',
      totalBookings: 3,
      totalSpent: 11450,
      city: 'Pune',
      state: 'Maharashtra',
      registrationDate: '2025-12-01T11:30:00Z',
      lastLogin: '2026-03-03T10:55:00Z',
      kycVerified: true,
    },
    {
      id: 'usr-005',
      fullName: 'Anand Kulkarni',
      email: 'anand.k@example.com',
      phoneNumber: '+91 94000 88221',
      accountStatus: 'ACTIVE',
      totalBookings: 2,
      totalSpent: 15200,
      city: 'Bengaluru',
      state: 'Karnataka',
      registrationDate: '2026-01-20T09:10:00Z',
      lastLogin: '2026-02-28T09:05:00Z',
      kycVerified: true,
    },
    {
      id: 'usr-006',
      fullName: 'Suspicious Bot Account',
      email: 'bot-auto-99@fakemail.org',
      phoneNumber: '+91 90000 00000',
      accountStatus: 'SUSPENDED',
      totalBookings: 0,
      totalSpent: 0,
      city: 'Unknown',
      state: 'Unknown',
      registrationDate: '2026-02-26T03:15:00Z',
      lastLogin: '2026-02-26T03:16:00Z',
      kycVerified: false,
    },
  ];

  private payments: AdminPaymentTransaction[] = [
    {
      id: 'pay-001',
      transactionId: 'TXN-9102-BG',
      bookingId: 'bk-001',
      bookingReference: 'BY-2026-AHM-9102',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      gateway: 'BharatGateway™',
      method: 'UPI',
      amount: 11000,
      gatewayReference: 'BG-UPI-99182746',
      status: 'SUCCESSFUL',
      transactionDate: '2026-03-01T10:17:30Z',
      rawGatewayResponseRedacted: { orderId: 'ord_9102', code: 'SUCCESS', authCode: 'AUTH_8820' },
    },
    {
      id: 'pay-002',
      transactionId: 'TXN-4411-BG',
      bookingId: 'bk-002',
      bookingReference: 'BY-2026-GIR-4411',
      customerName: 'Priya Patel',
      customerEmail: 'priya.patel@example.com',
      gateway: 'BharatGateway™',
      method: 'CREDIT_CARD',
      amount: 4800,
      gatewayReference: 'BG-CC-10293847',
      status: 'SUCCESSFUL',
      transactionDate: '2026-03-02T14:32:00Z',
      rawGatewayResponseRedacted: { orderId: 'ord_4411', code: 'SUCCESS', maskedCard: '•••• 4242' },
    },
    {
      id: 'pay-003',
      transactionId: 'TXN-1082-BG',
      bookingId: 'bk-004',
      bookingReference: 'BY-2026-BUS-1082',
      customerName: 'Sunita Joshi',
      customerEmail: 'sunita.joshi@example.com',
      gateway: 'UPI AutoPay',
      method: 'UPI',
      amount: 1650,
      gatewayReference: 'UPI-REF-88912',
      status: 'SUCCESSFUL',
      transactionDate: '2026-03-03T11:02:00Z',
      rawGatewayResponseRedacted: { orderId: 'ord_1082', code: 'SUCCESS', vpa: 'su****@okhdfcbank' },
    },
    {
      id: 'pay-004',
      transactionId: 'TXN-3301-BG',
      bookingId: 'bk-005',
      bookingReference: 'BY-2026-DWR-3301',
      customerName: 'Anand Kulkarni',
      customerEmail: 'anand.k@example.com',
      gateway: 'BharatGateway™',
      method: 'NETBANKING',
      amount: 7600,
      gatewayReference: 'BG-NB-55443322',
      status: 'REFUNDED',
      transactionDate: '2026-02-25T15:22:00Z',
      rawGatewayResponseRedacted: { orderId: 'ord_3301', code: 'REFUNDED', refundRef: 'REF-8821' },
    },
    {
      id: 'pay-005',
      transactionId: 'TXN-9999-FAIL',
      bookingId: 'bk-fail-01',
      bookingReference: 'BY-2026-FAIL-9999',
      customerName: 'Neha Kapoor',
      customerEmail: 'neha.k@example.com',
      gateway: 'Razorpay',
      method: 'CREDIT_CARD',
      amount: 14500,
      gatewayReference: 'RZP-ERR-8892',
      status: 'FAILED',
      failureReason: 'Bank 3DS OTP Authentication Timed Out',
      transactionDate: '2026-03-04T07:15:00Z',
      rawGatewayResponseRedacted: { code: 'BAD_REQUEST_ERROR', reason: 'PAYMENT_TIMED_OUT' },
    },
  ];

  private refunds: AdminRefundItem[] = [
    {
      id: 'ref-001',
      refundReference: 'REF-8821',
      transactionId: 'TXN-3301-BG',
      bookingId: 'bk-005',
      bookingReference: 'BY-2026-DWR-3301',
      customerName: 'Anand Kulkarni',
      customerEmail: 'anand.k@example.com',
      amount: 7600,
      reason: 'Trip cancelled within 48-hour free cancellation window.',
      eligibilityVerified: true,
      status: 'COMPLETED',
      gatewayReference: 'BG-REF-ACK-9921',
      requestedAt: '2026-02-28T09:10:00Z',
      processedAt: '2026-02-28T09:15:00Z',
      notes: 'Full refund credited to source payment method.',
    },
    {
      id: 'ref-002',
      refundReference: 'REF-9940',
      transactionId: 'TXN-9102-BG',
      bookingId: 'bk-001',
      bookingReference: 'BY-2026-AHM-9102',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      amount: 2500,
      reason: 'Partial cancellation of add-on activity service.',
      eligibilityVerified: true,
      status: 'PROCESSING',
      gatewayReference: 'BG-REF-PENDING-441',
      requestedAt: '2026-03-04T06:00:00Z',
      notes: 'Under review by finance desk.',
    },
  ];

  private destinations: AdminDestinationItem[] = [
    {
      id: 'dest-001',
      name: 'Sabarmati & Old Ahmedabad Circuit',
      state: 'Gujarat',
      city: 'Ahmedabad',
      category: 'Historical',
      description: 'UNESCO World Heritage city featuring 15th-century Solanki architecture, pols, and Gandhi Ashram.',
      attractions: ['Sabarmati Ashram', 'Adalaj Stepwell', 'Sidi Saiyyed Mosque', 'Atal Pedestrian Bridge'],
      bestSeason: 'October to March',
      suggestedDuration: '2 to 3 Days',
      estimatedBudget: '₹6,000 - ₹12,000',
      travelTips: ['Take early morning heritage walk in the old walled city.', 'Try authentic Gujarati thali at Agashiye.'],
      seoTitle: 'Ahmedabad Heritage Tour — Historic Pols & Stepwells',
      seoDescription: 'Explore Ahmedabad UNESCO World Heritage city, Gandhi Sabarmati Ashram, and Solanki architecture.',
      isPublished: true,
      image: '/landmarks/sabarmati-ashram.jpg',
      visitCount: 18450,
    },
    {
      id: 'dest-002',
      name: 'Gir National Park Lion Safari',
      state: 'Gujarat',
      city: 'Sasan Gir',
      category: 'Wildlife',
      description: 'The sole global sanctuary for the wild Asiatic Lion across 1,412 sq km of dry deciduous forest.',
      attractions: ['Gir Jungle Trail', 'Devalia Safari Park', 'Kamleshwar Dam', 'Crocodile Breeding Farm'],
      bestSeason: 'December to April',
      suggestedDuration: '2 Days',
      estimatedBudget: '₹8,000 - ₹15,000',
      travelTips: ['Book forest entry permits 60 days in advance.', 'Early morning 6 AM safari has highest lion sighting rate.'],
      seoTitle: 'Gir National Park Asiatic Lion Safari — Tour Packages & Permits',
      seoDescription: 'Book Asiatic Lion safaris in Gir National Park, Gujarat. Forest permits, eco-resorts, and guides.',
      isPublished: true,
      image: '/sasan-gir-bg.jpg',
      visitCount: 14200,
    },
    {
      id: 'dest-003',
      name: 'White Rann of Kutch Desert Glamping',
      state: 'Gujarat',
      city: 'Bhuj / Dhordo',
      category: 'Adventure',
      description: 'Vast shimmering salt desert famous for full moon illumination and the vibrant Rann Utsav cultural festival.',
      attractions: ['White Desert Dhordo', 'Kala Dungar (Black Hill)', 'Dholavira Harappan Metropolis', 'Mandvi Beach'],
      bestSeason: 'November to February',
      suggestedDuration: '3 to 4 Days',
      estimatedBudget: '₹12,000 - ₹24,000',
      travelTips: ['Plan around full-moon dates for surreal night desert views.', 'Carry warm clothing as night temperature drops sharply.'],
      seoTitle: 'Rann of Kutch Tour — White Desert Glamping & Rann Utsav',
      seoDescription: 'Experience the world-famous White Rann of Kutch. Desert tents, cultural performances, and full moon tours.',
      isPublished: true,
      image: '/bhuj-kutch-bg.jpg',
      visitCount: 22100,
    },
    {
      id: 'dest-004',
      name: 'Dwarkadhish & Somnath Jyotirlinga Circuit',
      state: 'Gujarat',
      city: 'Dwarka / Somnath',
      category: 'Religious',
      description: 'Sacred Char Dham shrine of Lord Krishna and the first holy Jyotirlinga of Lord Shiva on the Arabian Sea.',
      attractions: ['Dwarkadhish Temple', 'Bet Dwarka', 'Nageshwar Jyotirlinga', 'Somnath Sea Temple', 'Triveni Sangam'],
      bestSeason: 'September to March',
      suggestedDuration: '4 to 5 Days',
      estimatedBudget: '₹9,000 - ₹16,000',
      travelTips: ['Attend evening Somnath Temple Light & Sound show.', 'Take ferry to Bet Dwarka early morning to avoid queues.'],
      seoTitle: 'Dwarka Somnath Pilgrimage Tour — Holy Shrines & Darshan',
      seoDescription: 'Complete spiritual pilgrimage circuit covering Dwarkadhish, Bet Dwarka, Nageshwar, and Somnath Jyotirlinga.',
      isPublished: true,
      image: '/dwarka-temple-bg.jpg',
      visitCount: 29800,
    },
  ];

  private aiConfig: AdminAiConfig = {
    providers: [
      {
        id: 'p-gemini-2',
        name: 'Google Gemini 2.0 Flash / Pro',
        model: 'gemini-2.0-flash-exp',
        status: 'ACTIVE',
        latencyMs: 340,
        tokenCount: 1428500,
        costEstimateUsd: 1.42,
        rateLimitPerMin: 120,
      },
      {
        id: 'p-claude-35',
        name: 'Anthropic Claude 3.5 Sonnet',
        model: 'claude-3-5-sonnet-20241022',
        status: 'STANDBY',
        latencyMs: 820,
        tokenCount: 240000,
        costEstimateUsd: 3.60,
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
      totalEntities: 126,
      lastIndexed: '2026-03-01T04:00:00Z',
      indexedCategories: ['Heritage & Forts', 'Nature & Wildlife', 'Pilgrimage & Temples', 'Beaches & Coast', 'Cuisine & Thali'],
      outdatedCount: 0,
    },
    telemetry: {
      totalRequests: 8420,
      successCount: 8395,
      errorCount: 25,
      avgLatencyMs: 385,
      dailyTrend: [
        { date: '2026-02-26', requests: 1100, tokens: 195000 },
        { date: '2026-02-27', requests: 1240, tokens: 215000 },
        { date: '2026-02-28', requests: 1410, tokens: 248000 },
        { date: '2026-03-01', requests: 1580, tokens: 285000 },
        { date: '2026-03-02', requests: 1490, tokens: 260000 },
        { date: '2026-03-03', requests: 1620, tokens: 290000 },
      ],
    },
  };

  private hotels: AdminHotel[] = [
    {
      id: 'htl-001',
      name: 'The Ummed Ahmedabad Luxury Stay',
      supplierName: 'Heritage Haveli Stays & Resorts',
      city: 'Ahmedabad',
      state: 'Gujarat',
      starRating: 5,
      basePrice: 5500,
      roomsAvailable: 14,
      integration: 'Hotelbeds',
      status: 'ACTIVE',
      syncStatus: 'OPTIMAL',
      lastSyncedAt: '2026-03-04T07:30:00Z',
    },
    {
      id: 'htl-002',
      name: 'Gir Birding Lodge & Forest Cottages',
      supplierName: 'Gir Wild Safari Expeditions',
      city: 'Sasan Gir',
      state: 'Gujarat',
      starRating: 4,
      basePrice: 4200,
      roomsAvailable: 8,
      integration: 'SelfContracted',
      status: 'ACTIVE',
      syncStatus: 'OPTIMAL',
      lastSyncedAt: '2026-03-04T07:00:00Z',
    },
    {
      id: 'htl-003',
      name: 'White Rann Gateway Eco Tents',
      supplierName: 'Kutch White Desert Eco Tents',
      city: 'Dhordo, Kutch',
      state: 'Gujarat',
      starRating: 4,
      basePrice: 8500,
      roomsAvailable: 22,
      integration: 'SelfContracted',
      status: 'ACTIVE',
      syncStatus: 'OPTIMAL',
      lastSyncedAt: '2026-03-04T06:45:00Z',
    },
  ];

  private busRoutes: AdminBusRoute[] = [
    {
      id: 'bus-001',
      operatorName: 'GSRTC Volvo Premier',
      sourceCity: 'Ahmedabad',
      destinationCity: 'Somnath',
      busType: 'Volvo Multi-Axle AC',
      departureTime: '21:00',
      arrivalTime: '06:30',
      fare: 1650,
      seatsAvailable: 18,
      status: 'ACTIVE',
      provider: 'eTravelSmart',
    },
    {
      id: 'bus-002',
      operatorName: 'Patel Travels Luxury Fleet',
      sourceCity: 'Ahmedabad',
      destinationCity: 'Bhuj',
      busType: 'AC Sleeper (2+1)',
      departureTime: '22:30',
      arrivalTime: '06:00',
      fare: 1200,
      seatsAvailable: 12,
      status: 'ACTIVE',
      provider: 'eTravelSmart',
    },
  ];

  private transportIntegrations: AdminTransportIntegration[] = [
    {
      id: 'int-001',
      name: 'Hotelbeds Booking API Suite',
      category: 'CAB', // stay/hotel adapter
      provider: 'Hotelbeds APItude',
      status: 'SANDBOX',
      description: 'Real-time multi-property inventory and dynamic rate distribution.',
      lastPing: '2026-03-04T07:35:00Z',
    },
    {
      id: 'int-002',
      name: 'eTravelSmart Bus Operator Distribution',
      category: 'CAB',
      provider: 'eTravelSmart Network',
      status: 'CONNECTED',
      description: 'Pan-Gujarat bus inventory, live seat maps, and PNR ticketing.',
      lastPing: '2026-03-04T07:35:00Z',
    },
    {
      id: 'int-003',
      name: 'IRCTC Rail API Adapter',
      category: 'TRAIN',
      provider: 'IRCTC Enterprise Gateway',
      status: 'CONFIGURATION_REQUIRED',
      description: 'Official train schedules, availability lookup, and PNR tracking.',
      lastPing: '2026-03-01T00:00:00Z',
    },
    {
      id: 'int-004',
      name: 'Amadeus / Sabre Global GDS Adapter',
      category: 'FLIGHT',
      provider: 'Amadeus Travel Innovation API',
      status: 'CONFIGURATION_REQUIRED',
      description: 'Domestic & international flight search, fare calendar, and ticketing.',
      lastPing: '2026-03-01T00:00:00Z',
    },
    {
      id: 'int-005',
      name: 'BharatCab Inter-City & Local Taxi Dispatch',
      category: 'CAB',
      provider: 'Local Fleet Network (Sedan, SUV, Innova)',
      status: 'CONNECTED',
      description: 'Airport transfers, point-to-point sightseeing cabs with GPS telemetry.',
      lastPing: '2026-03-04T07:35:00Z',
    },
  ];

  private supportTickets: AdminSupportTicket[] = [
    {
      id: 'tkt-001',
      ticketNumber: 'TKT-2026-8801',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      category: 'BOOKING',
      subject: 'Early check-in request for Heritage Haveli',
      description: 'Arriving in Ahmedabad at 9:00 AM on March 15th. Requesting early room check-in.',
      priority: 'MEDIUM',
      assignedStaff: 'Pooja Mehta (Support)',
      status: 'OPEN',
      createdAt: '2026-03-03T09:30:00Z',
      updatedAt: '2026-03-03T10:00:00Z',
      messages: [
        {
          id: 'msg-01',
          sender: 'CUSTOMER',
          senderName: 'Rahul Sharma',
          message: 'Hello, our train reaches Ahmedabad at 8:30 AM. Can we get our room by 9:30 AM instead of 2:00 PM?',
          timestamp: '2026-03-03T09:30:00Z',
        },
        {
          id: 'msg-02',
          sender: 'STAFF',
          senderName: 'Pooja Mehta',
          message: 'Namaste Rahul! We have coordinated with Heritage Haveli. Early check-in is subject to availability, but complimentary luggage holding and welcome tea will be ready.',
          timestamp: '2026-03-03T10:00:00Z',
        },
      ],
    },
    {
      id: 'tkt-002',
      ticketNumber: 'TKT-2026-8802',
      customerName: 'Anand Kulkarni',
      customerEmail: 'anand.k@example.com',
      category: 'PAYMENT',
      subject: 'Refund confirmation acknowledgment for Dwarka stay',
      description: 'Cancelled booking BK-005. Requesting refund ARN reference for bank tracking.',
      priority: 'HIGH',
      assignedStaff: 'Vikram Desai (Finance)',
      status: 'RESOLVED',
      createdAt: '2026-02-28T09:30:00Z',
      updatedAt: '2026-02-28T11:00:00Z',
      resolutionNotes: 'Refund completed via BharatGateway™ with reference REF-8821. Bank ARN sent to customer.',
      messages: [
        {
          id: 'msg-03',
          sender: 'CUSTOMER',
          senderName: 'Anand Kulkarni',
          message: 'Please share bank ARN for ₹7,600 refund.',
          timestamp: '2026-02-28T09:30:00Z',
        },
        {
          id: 'msg-04',
          sender: 'STAFF',
          senderName: 'Vikram Desai',
          message: 'The refund has been successfully credited with Gateway ARN: BG-REF-ACK-9921.',
          timestamp: '2026-02-28T11:00:00Z',
        },
      ],
    },
  ];

  private reviews: AdminReviewItem[] = [
    {
      id: 'rev-001',
      entityType: 'HOTEL',
      entityName: 'The Ummed Ahmedabad Luxury Stay',
      customerName: 'Kunal Trivedi',
      rating: 5,
      title: 'Exquisite heritage hospitality near airport',
      comment: 'Superb ambiance, traditional Gujarati welcoming with saffron tea, and immaculate cleanliness.',
      status: 'PUBLISHED',
      createdAt: '2026-02-20T12:00:00Z',
    },
    {
      id: 'rev-002',
      entityType: 'PACKAGE',
      entityName: 'Gir Lion Morning Safari Trail',
      customerName: 'Sneha Rao',
      rating: 5,
      title: 'Spotted a pride of 4 lions within 20 minutes!',
      comment: 'The open jeep safari guide was extremely knowledgeable. A bucket list experience!',
      status: 'PUBLISHED',
      createdAt: '2026-02-25T17:30:00Z',
    },
    {
      id: 'rev-003',
      entityType: 'HOTEL',
      entityName: 'Fake Resort Promotion',
      customerName: 'Bot spammer',
      rating: 1,
      title: 'Visit my external scam site for discounts',
      comment: 'Click this external url bit.ly/spam to get 90% discount on fake tickets.',
      status: 'SPAM',
      reportedReason: 'Automated spam & external suspicious links',
      moderationNotes: 'Blocked by automated heuristic scanner.',
      createdAt: '2026-03-01T02:00:00Z',
    },
  ];

  private marketingCampaigns: AdminMarketingCampaign[] = [
    {
      id: 'camp-001',
      title: 'Summer Heritage Escapes — Gujarat Festival Promo',
      channel: 'EMAIL',
      targetAudience: 'All Registered Travelers (8,400+ Users)',
      status: 'ACTIVE',
      scheduledDate: '2026-03-01T08:00:00Z',
      sentCount: 6850,
      openRate: '38.4%',
      conversionRate: '6.2%',
    },
    {
      id: 'camp-002',
      title: 'WhatsApp Instant Booking Confirmation & Itinerary Pass',
      channel: 'WHATSAPP',
      targetAudience: 'Active Travelers with Confirmed Bookings',
      status: 'ACTIVE',
      scheduledDate: '2026-03-01T00:00:00Z',
      sentCount: 2410,
      openRate: '94.2%',
      conversionRate: '18.5%',
    },
    {
      id: 'camp-003',
      title: 'Rann Utsav Last Full Moon Special Push Alert',
      channel: 'PUSH',
      targetAudience: 'Users interested in Kutch & Glamping',
      status: 'SCHEDULED',
      scheduledDate: '2026-03-10T18:00:00Z',
      sentCount: 0,
      openRate: '—',
      conversionRate: '—',
    },
  ];

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
      createdAt: '2026-01-01T00:00:00Z',
      lastActiveAt: '2026-03-04T07:40:00Z',
    },
    {
      id: 'stf-002',
      fullName: 'Vikram Desai',
      email: 'vikram.desai@bharatyatra.com',
      role: 'FINANCE_MANAGER',
      department: 'Finance, Payments & Settlements',
      permissions: ['VIEW_FINANCIALS', 'PROCESS_REFUNDS', 'SETTLE_PARTNERS', 'EXPORT_REPORTS'],
      status: 'ACTIVE',
      createdAt: '2026-01-10T09:00:00Z',
      lastActiveAt: '2026-03-04T07:15:00Z',
    },
    {
      id: 'stf-003',
      fullName: 'Ananya Sen',
      email: 'ananya.sen@bharatyatra.com',
      role: 'BOOKING_MANAGER',
      department: 'Booking Operations & Inventory',
      permissions: ['VIEW_BOOKINGS', 'CANCEL_BOOKINGS', 'ALLOCATE_INVENTORY', 'SUPPLIER_COORDINATION'],
      status: 'ACTIVE',
      createdAt: '2026-01-15T11:00:00Z',
      lastActiveAt: '2026-03-04T06:50:00Z',
    },
    {
      id: 'stf-004',
      fullName: 'Pooja Mehta',
      email: 'pooja.mehta@bharatyatra.com',
      role: 'SUPPORT_MANAGER',
      department: 'Customer Delight & Support Desk',
      permissions: ['VIEW_TICKETS', 'RESOLVE_TICKETS', 'ASSIGN_STAFF', 'MODERATE_REVIEWS'],
      status: 'ACTIVE',
      createdAt: '2026-01-20T10:30:00Z',
      lastActiveAt: '2026-03-04T07:22:00Z',
    },
    {
      id: 'stf-005',
      fullName: 'Devendra Rathore',
      email: 'dev.rathore@bharatyatra.com',
      role: 'TECHNICAL_ADMIN',
      department: 'DevOps, Systems & Security',
      permissions: ['SYSTEM_MONITORING', 'API_MANAGEMENT', 'AI_CONFIG', 'AUDIT_TRAILS'],
      status: 'ACTIVE',
      createdAt: '2026-01-05T08:00:00Z',
      lastActiveAt: '2026-03-04T07:38:00Z',
    },
  ];

  private settlements: AdminSettlement[] = [
    {
      id: 'stl-001',
      supplierId: 'supp-001',
      bookingId: 'bk-001',
      grossAmountInr: 11000,
      commissionAmountInr: 1100,
      payableAmountInr: 9900,
      status: 'PENDING',
      settlementReference: 'STL-REF-9102',
      createdAt: '2026-03-02T11:00:00Z',
      supplier: {
        businessName: 'Heritage Haveli Stays & Resorts',
        email: 'partnerships@heritagehaveli.in',
      },
    },
    {
      id: 'stl-002',
      supplierId: 'supp-002',
      bookingId: 'bk-002',
      grossAmountInr: 4800,
      commissionAmountInr: 480,
      payableAmountInr: 4320,
      status: 'SETTLED',
      settlementReference: 'STL-REF-4411',
      createdAt: '2026-03-03T16:00:00Z',
      supplier: {
        businessName: 'Gir Wild Safari Expeditions',
        email: 'bookings@girwildsafari.in',
      },
    },
  ];

  private auditLogs: AdminAuditLog[] = [
    {
      id: 'aud-001',
      action: 'PLATFORM_STARTUP',
      entityType: 'SYSTEM',
      entityId: 'sys-001',
      adminEmail: 'admin@bharatyatra.com',
      details: 'BharatYatra Operations Admin portal governance initialized.',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'aud-002',
      action: 'VERIFY_SUPPLIER',
      entityType: 'SUPPLIER',
      entityId: 'supp-001',
      adminEmail: 'admin@bharatyatra.com',
      details: 'Verified KYC documents and GST registration for Heritage Haveli Stays & Resorts.',
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'aud-003',
      action: 'PROCESS_REFUND',
      entityType: 'REFUND',
      entityId: 'ref-001',
      adminEmail: 'vikram.desai@bharatyatra.com',
      details: 'Approved ₹7,600 gateway refund for booking BK-005. Gateway reference: BG-REF-ACK-9921.',
      createdAt: '2026-02-28T09:15:00Z',
    },
    {
      id: 'aud-004',
      action: 'AI_CONFIG_UPDATE',
      entityType: 'AI_PLANNER',
      entityId: 'p-gemini-2',
      adminEmail: 'dev.rathore@bharatyatra.com',
      details: 'Updated AI model weighting and verified pricing engine decoupling.',
      createdAt: '2026-03-01T12:00:00Z',
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

    const successfulPaymentsCount = this.payments.filter((p) => p.status === 'SUCCESSFUL').length;
    const paymentSuccessRate =
      this.payments.length > 0
        ? Math.round((successfulPaymentsCount / this.payments.length) * 100)
        : 100;

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
      categoryShare: [
        { category: 'Hotels & Resorts', percentage: 48, revenue: 18600 },
        { category: 'Tour Packages', percentage: 26, revenue: 17000 },
        { category: 'Activities & Safaris', percentage: 16, revenue: 4800 },
        { category: 'Buses & Transport', percentage: 10, revenue: 1650 },
      ],
      destinationPopularity: [
        { name: 'Ahmedabad Heritage', bookings: 142, revenue: 384000 },
        { name: 'Kutch White Desert', bookings: 128, revenue: 540000 },
        { name: 'Dwarka & Somnath', bookings: 116, revenue: 295000 },
        { name: 'Gir Lion Sanctuary', bookings: 94, revenue: 225600 },
      ],
      systemHealth: {
        status: 'OPERATIONAL',
        uptime: '99.99%',
        activeNodes: 12,
        backendStatus: 'HEALTHY',
        databaseStatus: 'CONNECTED (Supabase / PostgreSQL)',
        aiGatewayStatus: 'HEALTHY (Gemini 2.0 Flash)',
      },
    };
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
