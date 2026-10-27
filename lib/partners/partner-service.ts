// ============================================================================
// BHARAT YATRA TRAVEL PARTNER & PACKAGE MANAGEMENT SERVICE
// Core Service Engine for Agency Onboarding, Packages, Reviews, & Commissions
// Connected to Production Database Adapter (PostgreSQL / Supabase)
// ============================================================================

import {
  TravelAgency,
  AgencyVerificationDocument,
  TravelPackage,
  TravelPartnerAgreement,
  TravelCommissionLedgerEntry,
  TravelPartnerAuditLog,
  TravelPartnerNotification,
  PackagePublicationStatus,
  AgencyVerificationStatus,
} from '@/types/travel-partner';
import {
  IPartnerDatabaseAdapter,
  createPartnerDatabaseAdapter,
  DatabaseTableMissingError,
} from './partner-db-adapter';

export { DatabaseTableMissingError };

export class PartnerDataStore {
  private adapter: IPartnerDatabaseAdapter;

  constructor(adapterOverride?: IPartnerDatabaseAdapter) {
    this.adapter = adapterOverride || createPartnerDatabaseAdapter();
  }

  public setAdapter(adapter: IPartnerDatabaseAdapter) {
    this.adapter = adapter;
  }

  public async clearAllForTesting(): Promise<void> {
    if ((this.adapter as any).clearAll) {
      (this.adapter as any).clearAll();
    }
  }

  // --- AGENCY MANAGEMENT ---

  public async getAgencies(filterStatus?: AgencyVerificationStatus): Promise<TravelAgency[]> {
    return this.adapter.getAgencies(filterStatus);
  }

  public async getAgencyById(id: string): Promise<TravelAgency | null> {
    return this.adapter.getAgencyById(id);
  }

  public async getAgencyByReference(referenceNumber: string): Promise<TravelAgency | null> {
    return this.adapter.getAgencyByReference(referenceNumber);
  }

  public async getAgencyByEmail(email: string): Promise<TravelAgency | null> {
    return this.adapter.getAgencyByEmail(email);
  }

  public async getAgencyByUserId(userId: string): Promise<TravelAgency | null> {
    return this.adapter.getAgencyByUserId(userId);
  }

  public async createAgencyApplication(
    payload: Partial<TravelAgency>
  ): Promise<{ success: boolean; agency?: TravelAgency; error?: string }> {
    // Validate required fields
    if (!payload.businessName || !payload.businessEmail || !payload.contactPhone || !payload.representativeName) {
      return { success: false, error: 'Business name, email, phone, and representative name are mandatory.' };
    }

    // Check duplicate email
    const existing = await this.getAgencyByEmail(payload.businessEmail);
    if (existing) {
      return {
        success: false,
        error: `An agency application with email ${payload.businessEmail} already exists (Reference: ${existing.referenceNumber}).`,
      };
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = `BY-AGY-${randomSuffix}`;
    const slugBase = payload.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const businessSlug = `${slugBase}-${randomSuffix.toString().slice(-4)}`;

    const newAgency: TravelAgency = {
      id: `agy-${Date.now()}-${randomSuffix}`,
      userId: payload.userId || null,
      referenceNumber,
      businessName: payload.businessName.trim(),
      businessSlug,
      businessType: payload.businessType || 'REGISTERED_OPERATOR',
      representativeName: payload.representativeName.trim(),
      businessEmail: payload.businessEmail.trim().toLowerCase(),
      contactPhone: payload.contactPhone.trim(),
      address: payload.address || '',
      city: payload.city || '',
      stateCode: payload.stateCode || 'Gujarat',
      postalCode: payload.postalCode || '',
      websiteUrl: payload.websiteUrl || '',
      yearsInOperation: Number(payload.yearsInOperation || 0),
      registrationIdentifiers: payload.registrationIdentifiers || {},
      businessDescription: payload.businessDescription || '',
      serviceCoverage: payload.serviceCoverage || {
        statesServed: [payload.stateCode || 'Gujarat'],
        citiesServed: [payload.city || ''],
        packageCategories: ['Heritage & Pilgrimage'],
        languagesSupported: ['Hindi', 'English'],
      },
      commercialPreferences: payload.commercialPreferences || {
        providesGroupTours: true,
        providesPrivateTours: true,
        monthlyBookingCapacity: 50,
        agreedToTerms: true,
      },
      verificationStatus: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.adapter.createAgency(newAgency);

    await this.logAudit({
      actorRole: 'PARTNER',
      agencyId: newAgency.id,
      entityType: 'AGENCY',
      entityId: newAgency.id,
      action: 'APPLICATION_SUBMITTED',
      metadata: { referenceNumber, businessName: newAgency.businessName },
    });

    await this.addNotification({
      agencyId: newAgency.id,
      notificationType: 'APPLICATION_SUBMITTED',
      title: 'Application Received',
      message: `Your BharatYatra partner registration application (Ref: ${referenceNumber}) has been submitted for verification.`,
      actionUrl: `/partners/application-status?ref=${referenceNumber}`,
    });

    return { success: true, agency: newAgency };
  }

  public async updateAgencyStatus(
    agencyId: string,
    status: AgencyVerificationStatus,
    adminId: string,
    notes?: string,
    commissionRate: number = 10.0
  ): Promise<{ success: boolean; agency?: TravelAgency; error?: string }> {
    const agency = await this.adapter.getAgencyById(agencyId);
    if (!agency) {
      return { success: false, error: 'Agency not found' };
    }

    agency.verificationStatus = status;
    agency.updatedAt = new Date().toISOString();

    if (status === 'APPROVED') {
      agency.verifiedAt = new Date().toISOString();
      agency.verifiedBy = adminId;
      agency.rejectionReason = null;
      agency.informationRequestNotes = null;

      // Auto-create partner agreement if not already created
      const existingAgr = await this.adapter.getAgreement(agencyId);
      if (!existingAgr) {
        const agreement: TravelPartnerAgreement = {
          id: `agr-${Date.now()}`,
          agencyId,
          agreementVersion: '2026-STANDARD-V1',
          commissionType: 'PERCENTAGE',
          commissionRate: Number(commissionRate) || 10.0,
          commissionBasis: 'GROSS_BOOKING',
          effectiveFrom: new Date().toISOString().slice(0, 10),
          agreementStatus: 'ACTIVE',
          acceptedAt: new Date().toISOString(),
          approvedBy: adminId,
          createdAt: new Date().toISOString(),
        };
        await this.adapter.saveAgreement(agreement);
      }
    } else if (status === 'REJECTED') {
      agency.rejectionReason = notes || 'Does not meet current travel partner verification criteria.';
    } else if (status === 'NEEDS_INFORMATION') {
      agency.informationRequestNotes = notes || 'Additional documents or operational details required.';
    } else if (status === 'SUSPENDED') {
      agency.rejectionReason = notes || 'Agency account suspended by BharatYatra operations admin.';
      // Hide and suppress all published packages of this agency immediately
      const agencyPackages = await this.adapter.getPackages({ agencyId });
      for (const pkg of agencyPackages) {
        if (pkg.publicationStatus === 'PUBLISHED') {
          await this.adapter.updatePackage(pkg.id, {
            publicationStatus: 'PAUSED',
            pausedAt: new Date().toISOString(),
          });
        }
      }
    }

    const updated = await this.adapter.updateAgency(agencyId, agency);

    await this.logAudit({
      actorUserId: adminId,
      actorRole: 'ADMIN',
      agencyId,
      entityType: 'AGENCY',
      entityId: agencyId,
      action: `STATUS_CHANGED_TO_${status}`,
      metadata: { status, notes, commissionRate },
    });

    await this.addNotification({
      agencyId,
      notificationType: `AGENCY_${status}`,
      title: `Agency Application ${status}`,
      message: `Your registration status has been updated to ${status}. ${notes ? 'Note: ' + notes : ''}`,
      actionUrl: status === 'APPROVED' ? '/partner/dashboard' : `/partners/application-status?ref=${agency.referenceNumber}`,
    });

    return { success: true, agency: updated };
  }

  public async updateAgencyProfile(
    agencyId: string,
    updates: Partial<TravelAgency>
  ): Promise<{ success: boolean; agency?: TravelAgency; error?: string }> {
    const agency = await this.adapter.getAgencyById(agencyId);
    if (!agency) {
      return { success: false, error: 'Agency not found' };
    }
    const updated = await this.adapter.updateAgency(agencyId, updates);
    await this.logAudit({
      actorRole: 'PARTNER',
      agencyId,
      entityType: 'AGENCY',
      entityId: agencyId,
      action: 'PROFILE_UPDATED',
      metadata: { updatedFields: Object.keys(updates) },
    });
    return { success: true, agency: updated };
  }

  // --- PACKAGE MANAGEMENT ---

  public async getPackages(filters?: {
    agencyId?: string;
    publicationStatus?: PackagePublicationStatus;
    onlyPublic?: boolean;
    state?: string;
    category?: string;
  }): Promise<TravelPackage[]> {
    return this.adapter.getPackages(filters);
  }

  public async getPackageById(id: string): Promise<TravelPackage | null> {
    return this.adapter.getPackageById(id);
  }

  public async getPackageBySlug(slug: string, onlyPublic: boolean = false): Promise<TravelPackage | null> {
    return this.adapter.getPackageBySlug(slug, onlyPublic);
  }

  public async createPackage(
    agencyId: string,
    payload: Partial<TravelPackage>
  ): Promise<{ success: boolean; package?: TravelPackage; error?: string }> {
    const agency = await this.adapter.getAgencyById(agencyId);
    if (!agency) {
      return { success: false, error: 'Owning agency does not exist.' };
    }
    if (agency.verificationStatus !== 'APPROVED') {
      return { success: false, error: 'Only approved travel agencies can create travel packages.' };
    }

    if (!payload.title || !payload.basePrice || !payload.durationDays) {
      return { success: false, error: 'Package title, duration, and base price are required.' };
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slugBase = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${randomSuffix}`;

    const newPkg: TravelPackage = {
      id: `pkg-${Date.now()}-${randomSuffix}`,
      agencyId,
      agencyName: agency.businessName,
      title: payload.title.trim(),
      slug,
      shortDescription: payload.shortDescription || payload.description?.slice(0, 160) || payload.title,
      description: payload.description || '',
      category: payload.category || 'Heritage & Pilgrimage',
      tourType: payload.tourType || 'BOTH',
      origin: payload.origin || agency.city || 'Ahmedabad',
      destinationSummary: payload.destinationSummary || payload.title,
      destinations: payload.destinations || [agency.city],
      stateOrRegion: payload.stateOrRegion || agency.stateCode || 'Gujarat',
      durationDays: Number(payload.durationDays),
      durationNights: Number(payload.durationNights || Math.max(0, Number(payload.durationDays) - 1)),
      currency: 'INR',
      basePrice: Number(payload.basePrice),
      discountedPrice: payload.discountedPrice ? Number(payload.discountedPrice) : Number(payload.basePrice),
      minTravellers: Number(payload.minTravellers || 1),
      maxTravellers: Number(payload.maxTravellers || 20),
      coverImageUrl: payload.coverImageUrl || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      galleryImageUrls: payload.galleryImageUrls || [],
      inclusions: payload.inclusions || ['Accommodation', 'Guided Transport', 'Breakfast'],
      exclusions: payload.exclusions || ['Airfare', 'Personal Expenses'],
      cancellationPolicy: payload.cancellationPolicy || 'Standard 7-day free cancellation policy applies.',
      bookingNoticeDays: Number(payload.bookingNoticeDays || 2),
      itinerary: payload.itinerary || [
        {
          dayNumber: 1,
          title: `Day 1: Arrival & Sightseeing in ${payload.origin || 'City'}`,
          description: 'Arrival, hotel check-in, and introductory exploration.',
          places: [payload.origin || 'City'],
          activities: ['Orientation', 'Local exploration'],
          meals: ['Dinner'],
        },
      ],
      publicationStatus: 'DRAFT',
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.adapter.createPackage(newPkg);

    await this.logAudit({
      actorRole: 'PARTNER',
      agencyId,
      entityType: 'PACKAGE',
      entityId: newPkg.id,
      action: 'PACKAGE_DRAFT_CREATED',
      metadata: { title: newPkg.title, slug: newPkg.slug },
    });

    return { success: true, package: newPkg };
  }

  public async updatePackage(
    packageId: string,
    agencyId: string,
    payload: Partial<TravelPackage>
  ): Promise<{ success: boolean; package?: TravelPackage; error?: string }> {
    const pkg = await this.adapter.getPackageById(packageId);
    if (!pkg) return { success: false, error: 'Package not found.' };

    // Enforce ownership check
    if (pkg.agencyId !== agencyId) {
      return { success: false, error: 'Access forbidden: You cannot modify packages belonging to another partner.' };
    }

    // If package is currently PUBLISHED, any material update puts it back into PENDING_REVIEW or pauses it
    const wasPublished = pkg.publicationStatus === 'PUBLISHED';

    const updates: Partial<TravelPackage> = {
      ...payload,
      updatedAt: new Date().toISOString(),
      ...(wasPublished ? { publicationStatus: 'PENDING_REVIEW', submittedAt: new Date().toISOString() } : {}),
    };

    const updated = await this.adapter.updatePackage(packageId, updates);

    await this.logAudit({
      actorRole: 'PARTNER',
      agencyId,
      entityType: 'PACKAGE',
      entityId: packageId,
      action: wasPublished ? 'PUBLISHED_PACKAGE_UPDATED_PENDING_REVIEW' : 'PACKAGE_UPDATED',
      metadata: { title: updated.title },
    });

    return { success: true, package: updated };
  }

  public async submitPackageForReview(
    packageId: string,
    agencyId: string
  ): Promise<{ success: boolean; package?: TravelPackage; error?: string }> {
    const pkg = await this.adapter.getPackageById(packageId);
    if (!pkg) return { success: false, error: 'Package not found.' };
    if (pkg.agencyId !== agencyId) return { success: false, error: 'Unauthorized package ownership.' };

    if (!pkg.itinerary || pkg.itinerary.length === 0) {
      return { success: false, error: 'Cannot submit package without at least 1 itinerary day.' };
    }
    if (!pkg.coverImageUrl) {
      return { success: false, error: 'Please upload a cover image before submitting.' };
    }

    const updated = await this.adapter.updatePackage(packageId, {
      publicationStatus: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.logAudit({
      actorRole: 'PARTNER',
      agencyId,
      entityType: 'PACKAGE',
      entityId: packageId,
      action: 'PACKAGE_SUBMITTED_FOR_REVIEW',
      metadata: { title: updated.title },
    });

    return { success: true, package: updated };
  }

  public async reviewPackage(
    packageId: string,
    adminId: string,
    decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'PAUSE',
    reviewNotes?: string
  ): Promise<{ success: boolean; package?: TravelPackage; error?: string }> {
    const pkg = await this.adapter.getPackageById(packageId);
    if (!pkg) return { success: false, error: 'Package not found.' };

    const agency = await this.adapter.getAgencyById(pkg.agencyId);
    if (!agency) return { success: false, error: 'Owning agency not found.' };

    const updates: Partial<TravelPackage> = {
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminId,
      adminReviewNotes: reviewNotes || '',
      updatedAt: new Date().toISOString(),
    };

    if (decision === 'APPROVE') {
      if (agency.verificationStatus !== 'APPROVED') {
        return { success: false, error: 'Cannot approve package for an unapproved agency.' };
      }
      updates.publicationStatus = 'PUBLISHED';
      updates.publishedAt = new Date().toISOString();
      updates.pausedAt = null;

      await this.addNotification({
        agencyId: pkg.agencyId,
        notificationType: 'PACKAGE_PUBLISHED',
        title: 'Package Published Live!',
        message: `Your travel package "${pkg.title}" has been approved and is now live on BharatYatra.`,
        actionUrl: `/packages/${pkg.slug}`,
      });
    } else if (decision === 'REQUEST_CHANGES') {
      updates.publicationStatus = 'CHANGES_REQUESTED';
      await this.addNotification({
        agencyId: pkg.agencyId,
        notificationType: 'PACKAGE_CHANGES_REQUESTED',
        title: 'Corrections Requested on Package',
        message: `Reviewer requested updates for "${pkg.title}": ${reviewNotes || 'See details in portal.'}`,
        actionUrl: `/partner/packages/${pkg.id}/edit`,
      });
    } else if (decision === 'REJECT') {
      updates.publicationStatus = 'REJECTED';
    } else if (decision === 'PAUSE') {
      updates.publicationStatus = 'PAUSED';
      updates.pausedAt = new Date().toISOString();
    }

    const updated = await this.adapter.updatePackage(packageId, updates);

    await this.logAudit({
      actorUserId: adminId,
      actorRole: 'ADMIN',
      agencyId: pkg.agencyId,
      entityType: 'PACKAGE',
      entityId: packageId,
      action: `PACKAGE_${decision}`,
      metadata: { decision, reviewNotes },
    });

    return { success: true, package: updated };
  }

  // --- COMMISSION & BOOKING INTEGRATION ---

  public async processBookingCommission(booking: {
    bookingId: string;
    packageId?: string;
    packageSlug?: string;
    bookingAmount: number;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; ledgerEntry?: TravelCommissionLedgerEntry; error?: string }> {
    let pkg: TravelPackage | null = null;
    if (booking.packageId) {
      pkg = await this.adapter.getPackageById(booking.packageId);
    }
    if (!pkg && booking.packageSlug) {
      pkg = await this.adapter.getPackageBySlug(booking.packageSlug);
    }

    if (!pkg) {
      return { success: false, error: 'Booking not linked to an active partner package.' };
    }

    const idempotencyKey = booking.idempotencyKey || `COMM-${booking.bookingId}-${pkg.id}`;

    // Prevent duplicate entries
    const existing = await this.adapter.getLedgerByIdempotency(idempotencyKey);
    if (existing) {
      return { success: true, ledgerEntry: existing };
    }

    const agreement = await this.adapter.getAgreement(pkg.agencyId);
    const commissionRate = agreement ? Number(agreement.commissionRate) : 10.0;
    const commissionAmount = Math.round((booking.bookingAmount * commissionRate) / 100 * 100) / 100;
    const netPayoutAmount = Math.round((booking.bookingAmount - commissionAmount) * 100) / 100;

    const ledgerEntry: TravelCommissionLedgerEntry = {
      id: `led-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      agencyId: pkg.agencyId,
      bookingId: booking.bookingId,
      packageId: pkg.id,
      packageTitle: pkg.title,
      agreementId: agreement ? agreement.id : null,
      eventType: 'BOOKING_ACCRUAL',
      bookingAmount: booking.bookingAmount,
      commissionRate,
      commissionAmount,
      netPayoutAmount,
      currency: 'INR',
      status: 'PENDING_SETTLEMENT',
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    const saved = await this.adapter.recordCommissionAccrual(ledgerEntry);

    await this.logAudit({
      actorRole: 'SYSTEM',
      agencyId: pkg.agencyId,
      entityType: 'COMMISSION',
      entityId: saved.id,
      action: 'COMMISSION_ACCRUED',
      metadata: { bookingId: booking.bookingId, commissionAmount, netPayoutAmount },
    });

    await this.addNotification({
      agencyId: pkg.agencyId,
      notificationType: 'NEW_BOOKING_COMMISSION',
      title: 'New Booking Accrual',
      message: `Booking ${booking.bookingId} for "${pkg.title}" processed. Net earnings: ₹${netPayoutAmount.toLocaleString('en-IN')}`,
      actionUrl: '/partner/commissions',
    });

    return { success: true, ledgerEntry: saved };
  }

  public async getLedger(agencyId?: string): Promise<TravelCommissionLedgerEntry[]> {
    return this.adapter.getLedger(agencyId);
  }

  public async settleCommission(
    ledgerId: string,
    adminId: string,
    settlementRef: string
  ): Promise<{ success: boolean; entry?: TravelCommissionLedgerEntry; error?: string }> {
    try {
      const entry = await this.adapter.settleCommission(
        ledgerId,
        adminId,
        settlementRef || `STMT-${Date.now()}`
      );

      await this.logAudit({
        actorUserId: adminId,
        actorRole: 'ADMIN',
        agencyId: entry.agencyId,
        entityType: 'COMMISSION',
        entityId: ledgerId,
        action: 'COMMISSION_PAYOUT_SETTLED',
        metadata: { settlementRef: entry.settlementReference, netPayout: entry.netPayoutAmount },
      });

      return { success: true, entry };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to settle commission' };
    }
  }

  // --- TELEMETRY & METRICS ---

  public async getAgencyDashboardMetrics(agencyId: string) {
    const agency = await this.adapter.getAgencyById(agencyId);
    const agencyPackages = await this.adapter.getPackages({ agencyId });
    const agencyLedger = await this.adapter.getLedger(agencyId);

    const publishedCount = agencyPackages.filter((p) => p.publicationStatus === 'PUBLISHED').length;
    const draftCount = agencyPackages.filter((p) => p.publicationStatus === 'DRAFT').length;
    const awaitingReviewCount = agencyPackages.filter((p) => p.publicationStatus === 'PENDING_REVIEW').length;
    const changesRequestedCount = agencyPackages.filter((p) => p.publicationStatus === 'CHANGES_REQUESTED').length;

    let grossBookingValue = 0;
    let estimatedCommissionPayable = 0;
    let netEarningsAccrued = 0;
    let pendingSettlement = 0;
    let settledEarnings = 0;

    agencyLedger.forEach((entry) => {
      grossBookingValue += entry.bookingAmount;
      estimatedCommissionPayable += entry.commissionAmount;
      netEarningsAccrued += entry.netPayoutAmount;
      if (entry.status === 'PENDING_SETTLEMENT') {
        pendingSettlement += entry.netPayoutAmount;
      } else if (entry.status === 'SETTLED') {
        settledEarnings += entry.netPayoutAmount;
      }
    });

    const notifs = await this.adapter.getNotifications(agencyId);

    return {
      verificationStatus: agency?.verificationStatus || 'SUBMITTED',
      totalPackages: agencyPackages.length,
      publishedPackages: publishedCount,
      draftPackages: draftCount,
      awaitingReview: awaitingReviewCount,
      changesRequested: changesRequestedCount,
      totalBookings: agencyLedger.length,
      grossBookingValue,
      estimatedCommissionPayable,
      netEarningsAccrued,
      pendingSettlement,
      settledEarnings,
      recentNotifications: notifs.slice(0, 5),
    };
  }

  public async getAdminOverviewMetrics() {
    const allAgencies = await this.adapter.getAgencies();
    const allPackages = await this.adapter.getPackages();
    const allLedger = await this.adapter.getLedger();

    let totalGrossBookings = 0;
    let totalPlatformCommissions = 0;
    let totalPartnerPayoutsPending = 0;

    allLedger.forEach((l) => {
      totalGrossBookings += l.bookingAmount;
      totalPlatformCommissions += l.commissionAmount;
      if (l.status === 'PENDING_SETTLEMENT') {
        totalPartnerPayoutsPending += l.netPayoutAmount;
      }
    });

    return {
      totalAgencies: allAgencies.length,
      pendingApplications: allAgencies.filter(
        (a) => a.verificationStatus === 'SUBMITTED' || a.verificationStatus === 'PENDING_VERIFICATION'
      ).length,
      approvedAgencies: allAgencies.filter((a) => a.verificationStatus === 'APPROVED').length,
      suspendedAgencies: allAgencies.filter((a) => a.verificationStatus === 'SUSPENDED').length,
      totalPackages: allPackages.length,
      pendingReviewPackages: allPackages.filter((p) => p.publicationStatus === 'PENDING_REVIEW').length,
      publishedPackages: allPackages.filter((p) => p.publicationStatus === 'PUBLISHED').length,
      totalGrossBookings,
      totalPlatformCommissions,
      totalPartnerPayoutsPending,
    };
  }

  // --- AUDIT & NOTIFICATIONS ---

  private async logAudit(entry: Omit<TravelPartnerAuditLog, 'id' | 'createdAt'>) {
    const log: TravelPartnerAuditLog = {
      id: `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    await this.adapter.logAudit(log);
  }

  public async getAuditLogs(agencyId?: string): Promise<TravelPartnerAuditLog[]> {
    return this.adapter.getAuditLogs(agencyId);
  }

  private async addNotification(entry: Omit<TravelPartnerNotification, 'id' | 'createdAt' | 'isRead'>) {
    const notif: TravelPartnerNotification = {
      id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    await this.adapter.addNotification(notif);
  }

  public async getNotifications(agencyId: string): Promise<TravelPartnerNotification[]> {
    return this.adapter.getNotifications(agencyId);
  }
}

// Global Singleton Instance
const globalStore = (global as any).__bharatyatra_partner_store || new PartnerDataStore();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__bharatyatra_partner_store = globalStore;
}

export const partnerService: PartnerDataStore = globalStore;
