// ============================================================================
// BHARAT YATRA TRAVEL PARTNER — PRODUCTION DATABASE ADAPTER
// Connects to PostgreSQL / Supabase for Multi-User Production Deployment
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
import { getSupabaseClient, getSupabaseServerClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

export class DatabaseTableMissingError extends Error {
  constructor(public tableName: string, public originalError?: any) {
    super(
      `Database table "${tableName}" does not exist in the configured PostgreSQL/Supabase database. ` +
      `Please execute migration "data/migrations/20261012_travel_partner_ecosystem.sql" against your database.`
    );
    this.name = 'DatabaseTableMissingError';
  }
}

export interface IPartnerDatabaseAdapter {
  getAgencies(status?: AgencyVerificationStatus): Promise<TravelAgency[]>;
  getAgencyById(id: string): Promise<TravelAgency | null>;
  getAgencyByReference(referenceNumber: string): Promise<TravelAgency | null>;
  getAgencyByEmail(email: string): Promise<TravelAgency | null>;
  getAgencyByUserId(userId: string): Promise<TravelAgency | null>;
  createAgency(agency: TravelAgency): Promise<TravelAgency>;
  updateAgency(id: string, updates: Partial<TravelAgency>): Promise<TravelAgency>;

  getPackages(filters?: {
    agencyId?: string;
    publicationStatus?: PackagePublicationStatus;
    onlyPublic?: boolean;
    state?: string;
    category?: string;
  }): Promise<TravelPackage[]>;
  getPackageById(id: string): Promise<TravelPackage | null>;
  getPackageBySlug(slug: string, onlyPublic?: boolean): Promise<TravelPackage | null>;
  createPackage(pkg: TravelPackage): Promise<TravelPackage>;
  updatePackage(id: string, updates: Partial<TravelPackage>): Promise<TravelPackage>;

  getAgreement(agencyId: string): Promise<TravelPartnerAgreement | null>;
  saveAgreement(agreement: TravelPartnerAgreement): Promise<TravelPartnerAgreement>;

  getLedger(agencyId?: string): Promise<TravelCommissionLedgerEntry[]>;
  getLedgerByIdempotency(key: string): Promise<TravelCommissionLedgerEntry | null>;
  recordCommissionAccrual(entry: TravelCommissionLedgerEntry): Promise<TravelCommissionLedgerEntry>;
  settleCommission(id: string, adminId: string, settlementRef: string): Promise<TravelCommissionLedgerEntry>;

  logAudit(log: TravelPartnerAuditLog): Promise<void>;
  getAuditLogs(agencyId?: string): Promise<TravelPartnerAuditLog[]>;

  addNotification(notif: TravelPartnerNotification): Promise<void>;
  getNotifications(agencyId: string): Promise<TravelPartnerNotification[]>;
}

// ----------------------------------------------------------------------------
// 1. PRODUCTION SUPABASE / POSTGRESQL ADAPTER
// ----------------------------------------------------------------------------
export class SupabasePartnerDatabaseAdapter implements IPartnerDatabaseAdapter {
  private client: SupabaseClient;

  constructor(clientOverride?: SupabaseClient) {
    this.client = clientOverride || getSupabaseServerClient();
  }

  private checkDbError(error: any, table: string) {
    if (!error) return;
    if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      throw new DatabaseTableMissingError(table, error);
    }
    throw new Error(`Database operation on "${table}" failed: ${error.message} (code: ${error.code || 'UNKNOWN'})`);
  }

  // Helper mappings: snake_case DB row -> camelCase domain model
  private mapAgencyRow(row: any): TravelAgency {
    return {
      id: row.id,
      userId: row.user_id,
      referenceNumber: row.reference_number,
      businessName: row.business_name,
      businessSlug: row.business_slug,
      businessType: row.business_type,
      representativeName: row.representative_name,
      businessEmail: row.business_email,
      contactPhone: row.contact_phone,
      address: row.address,
      city: row.city,
      stateCode: row.state_code,
      postalCode: row.postal_code,
      websiteUrl: row.website_url,
      yearsInOperation: row.years_in_operation || 0,
      registrationIdentifiers: row.registration_identifiers || {},
      businessDescription: row.business_description,
      serviceCoverage: row.service_coverage || {
        statesServed: [row.state_code || 'Gujarat'],
        citiesServed: [row.city || ''],
        packageCategories: ['Heritage & Pilgrimage'],
        languagesSupported: ['Hindi', 'English'],
      },
      commercialPreferences: row.commercial_preferences || {
        providesGroupTours: true,
        providesPrivateTours: true,
        monthlyBookingCapacity: 50,
        agreedToTerms: true,
      },
      verificationStatus: row.verification_status,
      verifiedAt: row.verified_at,
      verifiedBy: row.verified_by,
      rejectionReason: row.rejection_reason,
      informationRequestNotes: row.information_request_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapPackageRow(row: any, agencyName?: string): TravelPackage {
    return {
      id: row.id,
      agencyId: row.agency_id,
      agencyName: agencyName || row.travel_agencies?.business_name || row.agency_name || 'Verified Operating Partner',
      title: row.title,
      slug: row.slug,
      shortDescription: row.short_description,
      description: row.description,
      category: row.category,
      tourType: row.tour_type,
      origin: row.origin,
      destinationSummary: row.destination_summary,
      destinations: row.destinations || [],
      stateOrRegion: row.state_or_region,
      durationDays: Number(row.duration_days),
      durationNights: Number(row.duration_nights),
      currency: row.currency || 'INR',
      basePrice: Number(row.base_price),
      discountedPrice: row.discounted_price ? Number(row.discounted_price) : undefined,
      minTravellers: Number(row.min_travellers || 1),
      maxTravellers: Number(row.max_travellers || 20),
      coverImageUrl: row.cover_image_url,
      galleryImageUrls: row.gallery_image_urls || [],
      inclusions: row.inclusions || [],
      exclusions: row.exclusions || [],
      cancellationPolicy: row.cancellation_policy,
      bookingNoticeDays: Number(row.booking_notice_days || 2),
      itinerary: row.itinerary || [],
      publicationStatus: row.publication_status,
      availabilityStatus: row.availability_status || 'AVAILABLE',
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      publishedAt: row.published_at,
      pausedAt: row.paused_at,
      adminReviewNotes: row.admin_review_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // --- AGENCIES ---

  async getAgencies(status?: AgencyVerificationStatus): Promise<TravelAgency[]> {
    let query = this.client.from('travel_agencies').select('*').order('created_at', { ascending: false });
    if (status) {
      query = query.eq('verification_status', status);
    }
    const { data, error } = await query;
    this.checkDbError(error, 'travel_agencies');
    return (data || []).map((row) => this.mapAgencyRow(row));
  }

  async getAgencyById(id: string): Promise<TravelAgency | null> {
    const { data, error } = await this.client.from('travel_agencies').select('*').eq('id', id).maybeSingle();
    this.checkDbError(error, 'travel_agencies');
    return data ? this.mapAgencyRow(data) : null;
  }

  async getAgencyByReference(referenceNumber: string): Promise<TravelAgency | null> {
    const { data, error } = await this.client
      .from('travel_agencies')
      .select('*')
      .ilike('reference_number', referenceNumber)
      .maybeSingle();
    this.checkDbError(error, 'travel_agencies');
    return data ? this.mapAgencyRow(data) : null;
  }

  async getAgencyByEmail(email: string): Promise<TravelAgency | null> {
    const { data, error } = await this.client
      .from('travel_agencies')
      .select('*')
      .ilike('business_email', email.trim())
      .maybeSingle();
    this.checkDbError(error, 'travel_agencies');
    return data ? this.mapAgencyRow(data) : null;
  }

  async getAgencyByUserId(userId: string): Promise<TravelAgency | null> {
    const { data, error } = await this.client
      .from('travel_agencies')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    this.checkDbError(error, 'travel_agencies');
    return data ? this.mapAgencyRow(data) : null;
  }

  async createAgency(agency: TravelAgency): Promise<TravelAgency> {
    const row = {
      id: agency.id,
      user_id: agency.userId,
      reference_number: agency.referenceNumber,
      business_name: agency.businessName,
      business_slug: agency.businessSlug,
      business_type: agency.businessType,
      representative_name: agency.representativeName,
      business_email: agency.businessEmail,
      contact_phone: agency.contactPhone,
      address: agency.address,
      city: agency.city,
      state_code: agency.stateCode,
      postal_code: agency.postalCode,
      website_url: agency.websiteUrl,
      years_in_operation: agency.yearsInOperation,
      registration_identifiers: agency.registrationIdentifiers,
      business_description: agency.businessDescription,
      service_coverage: agency.serviceCoverage,
      commercial_preferences: agency.commercialPreferences,
      verification_status: agency.verificationStatus,
      created_at: agency.createdAt,
      updated_at: agency.updatedAt,
    };

    const { data, error } = await this.client.from('travel_agencies').insert(row).select().single();
    this.checkDbError(error, 'travel_agencies');
    return this.mapAgencyRow(data);
  }

  async updateAgency(id: string, updates: Partial<TravelAgency>): Promise<TravelAgency> {
    const rowUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.representativeName !== undefined) rowUpdates.representative_name = updates.representativeName;
    if (updates.contactPhone !== undefined) rowUpdates.contact_phone = updates.contactPhone;
    if (updates.address !== undefined) rowUpdates.address = updates.address;
    if (updates.city !== undefined) rowUpdates.city = updates.city;
    if (updates.stateCode !== undefined) rowUpdates.state_code = updates.stateCode;
    if (updates.postalCode !== undefined) rowUpdates.postal_code = updates.postalCode;
    if (updates.websiteUrl !== undefined) rowUpdates.website_url = updates.websiteUrl;
    if (updates.businessDescription !== undefined) rowUpdates.business_description = updates.businessDescription;
    if (updates.serviceCoverage !== undefined) rowUpdates.service_coverage = updates.serviceCoverage;
    if (updates.commercialPreferences !== undefined) rowUpdates.commercial_preferences = updates.commercialPreferences;
    if (updates.verificationStatus !== undefined) rowUpdates.verification_status = updates.verificationStatus;
    if (updates.verifiedAt !== undefined) rowUpdates.verified_at = updates.verifiedAt;
    if (updates.verifiedBy !== undefined) rowUpdates.verified_by = updates.verifiedBy;
    if (updates.rejectionReason !== undefined) rowUpdates.rejection_reason = updates.rejectionReason;
    if (updates.informationRequestNotes !== undefined) rowUpdates.information_request_notes = updates.informationRequestNotes;

    const { data, error } = await this.client
      .from('travel_agencies')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();
    this.checkDbError(error, 'travel_agencies');
    return this.mapAgencyRow(data);
  }

  // --- PACKAGES ---

  async getPackages(filters?: {
    agencyId?: string;
    publicationStatus?: PackagePublicationStatus;
    onlyPublic?: boolean;
    state?: string;
    category?: string;
  }): Promise<TravelPackage[]> {
    let query = this.client
      .from('travel_packages')
      .select('*, travel_agencies(id, business_name, verification_status)')
      .order('created_at', { ascending: false });

    if (filters?.agencyId) {
      query = query.eq('agency_id', filters.agencyId);
    }
    if (filters?.publicationStatus) {
      query = query.eq('publication_status', filters.publicationStatus);
    }
    if (filters?.state && filters.state !== 'ALL') {
      query = query.ilike('state_or_region', filters.state);
    }
    if (filters?.category && filters.category !== 'ALL') {
      query = query.ilike('category', `%${filters.category}%`);
    }

    const { data, error } = await query;
    this.checkDbError(error, 'travel_packages');

    let packages = (data || []).map((row) => this.mapPackageRow(row));

    // Public query safety rule:
    // Only return packages where publication_status is PUBLISHED AND owning agency is APPROVED
    if (filters?.onlyPublic) {
      packages = packages.filter((p) => {
        if (p.publicationStatus !== 'PUBLISHED') return false;
        const agencyStatus = (data as any)?.find((d: any) => d.id === p.id)?.travel_agencies?.verification_status;
        return agencyStatus === 'APPROVED';
      });
    }

    return packages;
  }

  async getPackageById(id: string): Promise<TravelPackage | null> {
    const { data, error } = await this.client
      .from('travel_packages')
      .select('*, travel_agencies(business_name)')
      .eq('id', id)
      .maybeSingle();
    this.checkDbError(error, 'travel_packages');
    return data ? this.mapPackageRow(data) : null;
  }

  async getPackageBySlug(slug: string, onlyPublic: boolean = false): Promise<TravelPackage | null> {
    const { data, error } = await this.client
      .from('travel_packages')
      .select('*, travel_agencies(business_name, verification_status)')
      .eq('slug', slug)
      .maybeSingle();
    this.checkDbError(error, 'travel_packages');
    if (!data) return null;

    if (onlyPublic) {
      if (data.publication_status !== 'PUBLISHED' || data.travel_agencies?.verification_status !== 'APPROVED') {
        return null;
      }
    }

    return this.mapPackageRow(data);
  }

  async createPackage(pkg: TravelPackage): Promise<TravelPackage> {
    const row = {
      id: pkg.id,
      agency_id: pkg.agencyId,
      title: pkg.title,
      slug: pkg.slug,
      short_description: pkg.shortDescription,
      description: pkg.description,
      category: pkg.category,
      tour_type: pkg.tourType,
      origin: pkg.origin,
      destination_summary: pkg.destinationSummary,
      destinations: pkg.destinations,
      state_or_region: pkg.stateOrRegion,
      duration_days: pkg.durationDays,
      duration_nights: pkg.durationNights,
      currency: pkg.currency,
      base_price: pkg.basePrice,
      discounted_price: pkg.discountedPrice,
      min_travellers: pkg.minTravellers,
      max_travellers: pkg.maxTravellers,
      cover_image_url: pkg.coverImageUrl,
      gallery_image_urls: pkg.galleryImageUrls,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      cancellation_policy: pkg.cancellationPolicy,
      booking_notice_days: pkg.bookingNoticeDays,
      publication_status: pkg.publicationStatus,
      availability_status: pkg.availabilityStatus,
      created_at: pkg.createdAt,
      updated_at: pkg.updatedAt,
    };

    const { data, error } = await this.client.from('travel_packages').insert(row).select().single();
    this.checkDbError(error, 'travel_packages');
    return this.mapPackageRow(data, pkg.agencyName);
  }

  async updatePackage(id: string, updates: Partial<TravelPackage>): Promise<TravelPackage> {
    const rowUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.shortDescription !== undefined) rowUpdates.short_description = updates.shortDescription;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.tourType !== undefined) rowUpdates.tour_type = updates.tourType;
    if (updates.origin !== undefined) rowUpdates.origin = updates.origin;
    if (updates.destinationSummary !== undefined) rowUpdates.destination_summary = updates.destinationSummary;
    if (updates.destinations !== undefined) rowUpdates.destinations = updates.destinations;
    if (updates.stateOrRegion !== undefined) rowUpdates.state_or_region = updates.stateOrRegion;
    if (updates.durationDays !== undefined) rowUpdates.duration_days = updates.durationDays;
    if (updates.durationNights !== undefined) rowUpdates.duration_nights = updates.durationNights;
    if (updates.basePrice !== undefined) rowUpdates.base_price = updates.basePrice;
    if (updates.discountedPrice !== undefined) rowUpdates.discounted_price = updates.discountedPrice;
    if (updates.coverImageUrl !== undefined) rowUpdates.cover_image_url = updates.coverImageUrl;
    if (updates.galleryImageUrls !== undefined) rowUpdates.gallery_image_urls = updates.galleryImageUrls;
    if (updates.inclusions !== undefined) rowUpdates.inclusions = updates.inclusions;
    if (updates.exclusions !== undefined) rowUpdates.exclusions = updates.exclusions;
    if (updates.cancellationPolicy !== undefined) rowUpdates.cancellation_policy = updates.cancellationPolicy;
    if (updates.bookingNoticeDays !== undefined) rowUpdates.booking_notice_days = updates.bookingNoticeDays;
    if (updates.publicationStatus !== undefined) rowUpdates.publication_status = updates.publicationStatus;
    if (updates.submittedAt !== undefined) rowUpdates.submitted_at = updates.submittedAt;
    if (updates.reviewedAt !== undefined) rowUpdates.reviewed_at = updates.reviewedAt;
    if (updates.reviewedBy !== undefined) rowUpdates.reviewed_by = updates.reviewedBy;
    if (updates.publishedAt !== undefined) rowUpdates.published_at = updates.publishedAt;
    if (updates.pausedAt !== undefined) rowUpdates.paused_at = updates.pausedAt;
    if (updates.adminReviewNotes !== undefined) rowUpdates.admin_review_notes = updates.adminReviewNotes;

    const { data, error } = await this.client
      .from('travel_packages')
      .update(rowUpdates)
      .eq('id', id)
      .select('*, travel_agencies(business_name)')
      .single();
    this.checkDbError(error, 'travel_packages');
    return this.mapPackageRow(data);
  }

  // --- AGREEMENTS ---

  async getAgreement(agencyId: string): Promise<TravelPartnerAgreement | null> {
    const { data, error } = await this.client
      .from('travel_partner_agreements')
      .select('*')
      .eq('agency_id', agencyId)
      .maybeSingle();
    this.checkDbError(error, 'travel_partner_agreements');
    if (!data) return null;
    return {
      id: data.id,
      agencyId: data.agency_id,
      agreementVersion: data.agreement_version,
      commissionType: data.commission_type,
      commissionRate: Number(data.commission_rate),
      commissionBasis: data.commission_basis,
      effectiveFrom: data.effective_from,
      effectiveUntil: data.effective_until,
      agreementStatus: data.agreement_status,
      acceptedAt: data.accepted_at,
      approvedBy: data.approved_by,
      createdAt: data.created_at,
    };
  }

  async saveAgreement(agreement: TravelPartnerAgreement): Promise<TravelPartnerAgreement> {
    const row = {
      id: agreement.id,
      agency_id: agreement.agencyId,
      agreement_version: agreement.agreementVersion,
      commission_type: agreement.commissionType,
      commission_rate: agreement.commissionRate,
      commission_basis: agreement.commissionBasis,
      effective_from: agreement.effectiveFrom,
      agreement_status: agreement.agreementStatus,
      accepted_at: agreement.acceptedAt,
      approved_by: agreement.approvedBy,
      created_at: agreement.createdAt,
    };
    const { data, error } = await this.client
      .from('travel_partner_agreements')
      .upsert(row)
      .select()
      .single();
    this.checkDbError(error, 'travel_partner_agreements');
    return {
      ...agreement,
      id: data.id,
    };
  }

  // --- COMMISSION LEDGER ---

  async getLedger(agencyId?: string): Promise<TravelCommissionLedgerEntry[]> {
    let query = this.client.from('travel_commission_ledger').select('*').order('created_at', { ascending: false });
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    const { data, error } = await query;
    this.checkDbError(error, 'travel_commission_ledger');
    return (data || []).map((row) => ({
      id: row.id,
      agencyId: row.agency_id,
      bookingId: row.booking_id,
      packageId: row.package_id,
      packageTitle: row.package_title,
      agreementId: row.agreement_id,
      eventType: row.event_type,
      bookingAmount: Number(row.booking_amount),
      commissionRate: Number(row.commission_rate),
      commissionAmount: Number(row.commission_amount),
      netPayoutAmount: Number(row.net_payout_amount),
      currency: row.currency,
      status: row.status,
      idempotencyKey: row.idempotency_key,
      settlementReference: row.settlement_reference,
      settledAt: row.settled_at,
      createdAt: row.created_at,
    }));
  }

  async getLedgerByIdempotency(key: string): Promise<TravelCommissionLedgerEntry | null> {
    const { data, error } = await this.client
      .from('travel_commission_ledger')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();
    this.checkDbError(error, 'travel_commission_ledger');
    if (!data) return null;
    return {
      id: data.id,
      agencyId: data.agency_id,
      bookingId: data.booking_id,
      packageId: data.package_id,
      packageTitle: data.package_title,
      agreementId: data.agreement_id,
      eventType: data.event_type,
      bookingAmount: Number(data.booking_amount),
      commissionRate: Number(data.commission_rate),
      commissionAmount: Number(data.commission_amount),
      netPayoutAmount: Number(data.net_payout_amount),
      currency: data.currency,
      status: data.status,
      idempotencyKey: data.idempotency_key,
      settlementReference: data.settlement_reference,
      settledAt: data.settled_at,
      createdAt: data.created_at,
    };
  }

  async recordCommissionAccrual(entry: TravelCommissionLedgerEntry): Promise<TravelCommissionLedgerEntry> {
    const row = {
      id: entry.id,
      agency_id: entry.agencyId,
      booking_id: entry.bookingId,
      package_id: entry.packageId,
      package_title: entry.packageTitle,
      agreement_id: entry.agreementId,
      event_type: entry.eventType,
      booking_amount: entry.bookingAmount,
      commission_rate: entry.commissionRate,
      commission_amount: entry.commissionAmount,
      net_payout_amount: entry.netPayoutAmount,
      currency: entry.currency,
      status: entry.status,
      idempotency_key: entry.idempotencyKey,
      created_at: entry.createdAt,
    };
    const { data, error } = await this.client.from('travel_commission_ledger').insert(row).select().single();
    this.checkDbError(error, 'travel_commission_ledger');
    return {
      ...entry,
      id: data.id,
    };
  }

  async settleCommission(id: string, adminId: string, settlementRef: string): Promise<TravelCommissionLedgerEntry> {
    // Attempt atomic RPC if migration procedure is present
    try {
      const { data: rpcData, error: rpcError } = await this.client.rpc('rpc_settle_commission', {
        p_ledger_id: id,
        p_admin_id: adminId,
        p_settlement_ref: settlementRef,
      });
      if (!rpcError && rpcData) {
        return {
          id: rpcData.id,
          agencyId: rpcData.agency_id,
          bookingId: rpcData.booking_id,
          packageId: rpcData.package_id,
          packageTitle: rpcData.package_title,
          agreementId: rpcData.agreement_id,
          eventType: rpcData.event_type,
          bookingAmount: Number(rpcData.booking_amount),
          commissionRate: Number(rpcData.commission_rate),
          commissionAmount: Number(rpcData.commission_amount),
          netPayoutAmount: Number(rpcData.net_payout_amount),
          currency: rpcData.currency,
          status: rpcData.status,
          idempotencyKey: rpcData.idempotency_key,
          settlementReference: rpcData.settlement_reference,
          settledAt: rpcData.settled_at,
          createdAt: rpcData.created_at,
        };
      }
    } catch {
      // Fallback to table-level update below
    }

    const { data, error } = await this.client
      .from('travel_commission_ledger')
      .update({
        status: 'SETTLED',
        settlement_reference: settlementRef,
        settled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    this.checkDbError(error, 'travel_commission_ledger');
    return {
      id: data.id,
      agencyId: data.agency_id,
      bookingId: data.booking_id,
      packageId: data.package_id,
      packageTitle: data.package_title,
      agreementId: data.agreement_id,
      eventType: data.event_type,
      bookingAmount: Number(data.booking_amount),
      commissionRate: Number(data.commission_rate),
      commissionAmount: Number(data.commission_amount),
      netPayoutAmount: Number(data.net_payout_amount),
      currency: data.currency,
      status: data.status,
      idempotencyKey: data.idempotency_key,
      settlementReference: data.settlement_reference,
      settledAt: data.settled_at,
      createdAt: data.created_at,
    };
  }

  // --- AUDIT LOGS ---

  async logAudit(log: TravelPartnerAuditLog): Promise<void> {
    const row = {
      id: log.id,
      actor_user_id: log.actorUserId,
      actor_role: log.actorRole,
      agency_id: log.agencyId,
      entity_type: log.entityType,
      entity_id: log.entityId,
      action: log.action,
      metadata: log.metadata,
      created_at: log.createdAt,
    };
    const { error } = await this.client.from('travel_partner_audit_logs').insert(row);
    this.checkDbError(error, 'travel_partner_audit_logs');
  }

  async getAuditLogs(agencyId?: string): Promise<TravelPartnerAuditLog[]> {
    let query = this.client.from('travel_partner_audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    const { data, error } = await query;
    this.checkDbError(error, 'travel_partner_audit_logs');
    return (data || []).map((row) => ({
      id: row.id,
      actorUserId: row.actor_user_id,
      actorRole: row.actor_role,
      agencyId: row.agency_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }

  // --- NOTIFICATIONS ---

  async addNotification(notif: TravelPartnerNotification): Promise<void> {
    const row = {
      id: notif.id,
      agency_id: notif.agencyId,
      notification_type: notif.notificationType,
      title: notif.title,
      message: notif.message,
      is_read: notif.isRead,
      action_url: notif.actionUrl,
      created_at: notif.createdAt,
    };
    const { error } = await this.client.from('travel_partner_notifications').insert(row);
    this.checkDbError(error, 'travel_partner_notifications');
  }

  async getNotifications(agencyId: string): Promise<TravelPartnerNotification[]> {
    const { data, error } = await this.client
      .from('travel_partner_notifications')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    this.checkDbError(error, 'travel_partner_notifications');
    return (data || []).map((row) => ({
      id: row.id,
      agencyId: row.agency_id,
      notificationType: row.notification_type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      actionUrl: row.action_url,
      createdAt: row.created_at,
    }));
  }
}

// ----------------------------------------------------------------------------
// 2. ISOLATED TEST-ONLY DATABASE ADAPTER
// ----------------------------------------------------------------------------
// Strictly restricted to NODE_ENV === 'test' or explicit test suites.
// Production request paths CANNOT silently select this adapter.
export class TestMemoryPartnerDatabaseAdapter implements IPartnerDatabaseAdapter {
  private agencies = new Map<string, TravelAgency>();
  private packages = new Map<string, TravelPackage>();
  private agreements = new Map<string, TravelPartnerAgreement>();
  private ledger = new Map<string, TravelCommissionLedgerEntry>();
  private auditLogs: TravelPartnerAuditLog[] = [];
  private notifications = new Map<string, TravelPartnerNotification[]>();

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SECURITY VIOLATION: TestMemoryPartnerDatabaseAdapter cannot be instantiated in production environment.'
      );
    }
  }

  public clearAll() {
    this.agencies.clear();
    this.packages.clear();
    this.agreements.clear();
    this.ledger.clear();
    this.auditLogs = [];
    this.notifications.clear();
  }

  async getAgencies(status?: AgencyVerificationStatus): Promise<TravelAgency[]> {
    const list = Array.from(this.agencies.values());
    return status ? list.filter((a) => a.verificationStatus === status) : list;
  }

  async getAgencyById(id: string): Promise<TravelAgency | null> {
    return this.agencies.get(id) || null;
  }

  async getAgencyByReference(referenceNumber: string): Promise<TravelAgency | null> {
    for (const a of Array.from(this.agencies.values())) {
      if (a.referenceNumber.toUpperCase() === referenceNumber.toUpperCase()) return a;
    }
    return null;
  }

  async getAgencyByEmail(email: string): Promise<TravelAgency | null> {
    const lower = email.trim().toLowerCase();
    for (const a of Array.from(this.agencies.values())) {
      if (a.businessEmail.toLowerCase() === lower) return a;
    }
    return null;
  }

  async getAgencyByUserId(userId: string): Promise<TravelAgency | null> {
    for (const a of Array.from(this.agencies.values())) {
      if (a.userId === userId) return a;
    }
    return null;
  }

  async createAgency(agency: TravelAgency): Promise<TravelAgency> {
    this.agencies.set(agency.id, agency);
    return agency;
  }

  async updateAgency(id: string, updates: Partial<TravelAgency>): Promise<TravelAgency> {
    const existing = this.agencies.get(id);
    if (!existing) throw new Error('Agency not found');
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.agencies.set(id, updated);
    return updated;
  }

  async getPackages(filters?: {
    agencyId?: string;
    publicationStatus?: PackagePublicationStatus;
    onlyPublic?: boolean;
    state?: string;
    category?: string;
  }): Promise<TravelPackage[]> {
    let list = Array.from(this.packages.values());
    if (filters?.agencyId) list = list.filter((p) => p.agencyId === filters.agencyId);
    if (filters?.publicationStatus) list = list.filter((p) => p.publicationStatus === filters.publicationStatus);
    if (filters?.onlyPublic) {
      list = list.filter((p) => {
        if (p.publicationStatus !== 'PUBLISHED') return false;
        const owning = this.agencies.get(p.agencyId);
        return owning && owning.verificationStatus === 'APPROVED';
      });
    }
    if (filters?.state && filters.state !== 'ALL') {
      list = list.filter((p) => p.stateOrRegion.toLowerCase() === filters.state?.toLowerCase());
    }
    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((p) => p.category.toLowerCase().includes(filters.category?.toLowerCase() || ''));
    }
    return list;
  }

  async getPackageById(id: string): Promise<TravelPackage | null> {
    return this.packages.get(id) || null;
  }

  async getPackageBySlug(slug: string, onlyPublic: boolean = false): Promise<TravelPackage | null> {
    for (const p of Array.from(this.packages.values())) {
      if (p.slug === slug || p.id === slug) {
        if (onlyPublic) {
          const owning = this.agencies.get(p.agencyId);
          if (p.publicationStatus !== 'PUBLISHED' || !owning || owning.verificationStatus !== 'APPROVED') {
            return null;
          }
        }
        return p;
      }
    }
    return null;
  }

  async createPackage(pkg: TravelPackage): Promise<TravelPackage> {
    this.packages.set(pkg.id, pkg);
    return pkg;
  }

  async updatePackage(id: string, updates: Partial<TravelPackage>): Promise<TravelPackage> {
    const existing = this.packages.get(id);
    if (!existing) throw new Error('Package not found');
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.packages.set(id, updated);
    return updated;
  }

  async getAgreement(agencyId: string): Promise<TravelPartnerAgreement | null> {
    return this.agreements.get(agencyId) || null;
  }

  async saveAgreement(agreement: TravelPartnerAgreement): Promise<TravelPartnerAgreement> {
    this.agreements.set(agreement.agencyId, agreement);
    return agreement;
  }

  async getLedger(agencyId?: string): Promise<TravelCommissionLedgerEntry[]> {
    const list = Array.from(this.ledger.values());
    return agencyId ? list.filter((l) => l.agencyId === agencyId) : list;
  }

  async getLedgerByIdempotency(key: string): Promise<TravelCommissionLedgerEntry | null> {
    for (const entry of Array.from(this.ledger.values())) {
      if (entry.idempotencyKey === key) return entry;
    }
    return null;
  }

  async recordCommissionAccrual(entry: TravelCommissionLedgerEntry): Promise<TravelCommissionLedgerEntry> {
    this.ledger.set(entry.id, entry);
    return entry;
  }

  async settleCommission(id: string, adminId: string, settlementRef: string): Promise<TravelCommissionLedgerEntry> {
    const entry = this.ledger.get(id);
    if (!entry) throw new Error('Ledger entry not found');
    entry.status = 'SETTLED';
    entry.settlementReference = settlementRef;
    entry.settledAt = new Date().toISOString();
    this.ledger.set(id, entry);
    return entry;
  }

  async logAudit(log: TravelPartnerAuditLog): Promise<void> {
    this.auditLogs.unshift(log);
  }

  async getAuditLogs(agencyId?: string): Promise<TravelPartnerAuditLog[]> {
    return agencyId ? this.auditLogs.filter((l) => l.agencyId === agencyId) : this.auditLogs;
  }

  async addNotification(notif: TravelPartnerNotification): Promise<void> {
    const list = this.notifications.get(notif.agencyId) || [];
    list.unshift(notif);
    this.notifications.set(notif.agencyId, list);
  }

  async getNotifications(agencyId: string): Promise<TravelPartnerNotification[]> {
    return this.notifications.get(agencyId) || [];
  }
}

export function createPartnerDatabaseAdapter(): IPartnerDatabaseAdapter {
  if (process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'test' || process.env.USE_TEST_ADAPTER === 'true')) {
    return new TestMemoryPartnerDatabaseAdapter();
  }
  // Production / Staging: Strictly use Supabase / PostgreSQL Adapter
  return new SupabasePartnerDatabaseAdapter();
}

