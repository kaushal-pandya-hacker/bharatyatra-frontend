/**
 * Authoritative In-Memory & Database-Aware Admin Store
 * Provides persistent-fallback administrative state for Suppliers, Inventory, Bookings, Settlements, and Audit Logs.
 */

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

export interface AdminBooking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  type: string;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  details?: Record<string, any>;
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

export interface AdminAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminEmail: string;
  details: string;
  createdAt: string;
}

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
      type: 'HOTEL',
      amount: 11000,
      status: 'CONFIRMED',
      createdAt: '2026-03-01T10:15:00Z',
      details: {
        title: 'The Ummed Ahmedabad Luxury Stay',
        nights: 2,
        guests: 2,
      },
    },
    {
      id: 'bk-002',
      bookingReference: 'BY-2026-GIR-4411',
      customerName: 'Priya Patel',
      customerEmail: 'priya.patel@example.com',
      type: 'ACTIVITY',
      amount: 4800,
      status: 'CONFIRMED',
      createdAt: '2026-03-02T14:30:00Z',
      details: {
        title: 'Gir Lion Morning Safari Trail',
        participants: 2,
      },
    },
    {
      id: 'bk-003',
      bookingReference: 'BY-2026-KUT-7729',
      customerName: 'Amit Verma',
      customerEmail: 'amit.verma@example.com',
      type: 'HOTEL',
      amount: 17000,
      status: 'PENDING',
      createdAt: '2026-03-04T08:45:00Z',
      details: {
        title: 'White Rann Desert Glamping Tent',
        nights: 2,
        guests: 2,
      },
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
  ];

  // --- SUPPLIERS ---
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

  // --- INVENTORY ---
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

  // --- BOOKINGS ---
  public getBookings(status?: string): AdminBooking[] {
    if (!status || status === 'ALL') {
      return [...this.bookings];
    }
    return this.bookings.filter((b) => b.status === status);
  }

  // --- SETTLEMENTS ---
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

  // --- AUDIT LOGS ---
  public getAuditLogs(filters?: { action?: string; entityType?: string }): AdminAuditLog[] {
    let result = [...this.auditLogs];
    if (filters?.action) {
      result = result.filter((a) => a.action === filters.action);
    }
    if (filters?.entityType) {
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
