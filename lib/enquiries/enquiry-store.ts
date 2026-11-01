import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { adminDataStore } from '@/lib/admin/admin-store';

export type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type EnquiryPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';

export interface ContactEnquiry {
  id: string;
  enquiryReference: string;
  fullName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  source: string;
  createdAt: string;
  updatedAt: string;
  emailNotificationStatus: NotificationStatus;
  whatsappNotificationStatus: NotificationStatus;
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EnquiryStats {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  todayCount: number;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'contact_enquiries.json');

class EnquiryStore {
  private cache: Map<string, ContactEnquiry> = new Map();
  private isLoaded = false;

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const list: ContactEnquiry[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((enq) => {
            if (enq.id) this.cache.set(enq.id, enq);
          });
        }
      }
    } catch (err) {
      console.error('[EnquiryStore] Error loading local enquiry store:', err);
    }
    this.isLoaded = true;
  }

  private persist(): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.cache.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[EnquiryStore] Error persisting local enquiry store:', err);
    }
  }

  /**
   * Generates a collision-resistant, human-friendly enquiry reference.
   * e.g., BY-ENQ-20261101-0042
   */
  private generateReference(): string {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const count = this.cache.size + 1;
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `BY-ENQ-${dateStr}-${String(count).padStart(3, '0')}-${randomHex}`;
  }

  /**
   * Save a newly submitted customer enquiry.
   */
  public async createEnquiry(input: {
    fullName: string;
    email: string;
    phone?: string;
    inquiryType?: string;
    message: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ContactEnquiry> {
    this.ensureLoaded();

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const enquiryReference = this.generateReference();

    const enquiry: ContactEnquiry = {
      id,
      enquiryReference,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: (input.phone || '').trim(),
      inquiryType: input.inquiryType || 'GENERAL_INQUIRY',
      message: input.message.trim(),
      status: 'NEW',
      priority: 'NORMAL',
      source: 'WEBSITE',
      createdAt: now,
      updatedAt: now,
      emailNotificationStatus: 'NOT_CONFIGURED',
      whatsappNotificationStatus: 'NOT_CONFIGURED',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };

    // 1. Save to durable store
    this.cache.set(id, enquiry);
    this.persist();

    // 2. Attempt insert to PostgreSQL / Supabase if available
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('contact_enquiries').insert({
        id: enquiry.id,
        enquiry_reference: enquiry.enquiryReference,
        full_name: enquiry.fullName,
        email: enquiry.email,
        phone: enquiry.phone,
        inquiry_type: enquiry.inquiryType,
        message: enquiry.message,
        status: enquiry.status,
        priority: enquiry.priority,
        source: enquiry.source,
        created_at: enquiry.createdAt,
        updated_at: enquiry.updatedAt,
        email_notification_status: enquiry.emailNotificationStatus,
        whatsapp_notification_status: enquiry.whatsappNotificationStatus,
        ip_address: enquiry.ipAddress,
        user_agent: enquiry.userAgent,
      });
    } catch {
      // Supabase is optional; local storage guarantees persistence
    }

    // 3. Mirror to AdminDataStore for cross-component support desk integration
    try {
      adminDataStore.createSupportTicket({
        customerName: enquiry.fullName,
        customerEmail: enquiry.email,
        phone: enquiry.phone,
        category: 'GENERAL',
        subject: `[${enquiry.inquiryType}] Enquiry #${enquiry.enquiryReference}`,
        description: enquiry.message,
        priority: 'MEDIUM',
      });
    } catch {
      // Ignore non-fatal admin store sync errors
    }

    return enquiry;
  }

  /**
   * Update notification status after dispatch attempts.
   */
  public updateNotificationStatuses(
    id: string,
    statuses: {
      emailStatus?: NotificationStatus;
      whatsappStatus?: NotificationStatus;
    }
  ): void {
    this.ensureLoaded();
    const existing = this.cache.get(id);
    if (!existing) return;

    if (statuses.emailStatus) existing.emailNotificationStatus = statuses.emailStatus;
    if (statuses.whatsappStatus) existing.whatsappNotificationStatus = statuses.whatsappStatus;
    existing.updatedAt = new Date().toISOString();

    this.cache.set(id, existing);
    this.persist();

    // Update remote db asynchronously if possible
    try {
      const supabase = getSupabaseServerClient();
      supabase
        .from('contact_enquiries')
        .update({
          email_notification_status: existing.emailNotificationStatus,
          whatsapp_notification_status: existing.whatsappNotificationStatus,
          updated_at: existing.updatedAt,
        })
        .eq('id', id);
    } catch {
      // Ignore
    }
  }

  /**
   * Retrieve filtered enquiries (latest first).
   */
  public async getEnquiries(filters?: {
    status?: string;
    search?: string;
    inquiryType?: string;
    priority?: string;
  }): Promise<ContactEnquiry[]> {
    this.ensureLoaded();

    // 1. Try to fetch fresh records from Supabase first
    try {
      const supabase = getSupabaseServerClient();
      let query = supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters?.inquiryType && filters.inquiryType !== 'ALL') {
        query = query.eq('inquiry_type', filters.inquiryType);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        // Sync remote into local cache
        data.forEach((row: any) => {
          const item: ContactEnquiry = {
            id: row.id,
            enquiryReference: row.enquiry_reference,
            fullName: row.full_name,
            email: row.email,
            phone: row.phone || '',
            inquiryType: row.inquiry_type,
            message: row.message,
            status: row.status as EnquiryStatus,
            priority: row.priority as EnquiryPriority,
            source: row.source || 'WEBSITE',
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            emailNotificationStatus: row.email_notification_status,
            whatsappNotificationStatus: row.whatsapp_notification_status,
            adminNotes: row.admin_notes,
            resolvedAt: row.resolved_at,
            resolvedBy: row.resolved_by,
          };
          this.cache.set(item.id, item);
        });
        this.persist();
      }
    } catch {
      // Fall through to cache
    }

    let list = Array.from(this.cache.values());

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((e) => e.status === filters.status);
    }

    if (filters?.inquiryType && filters.inquiryType !== 'ALL') {
      list = list.filter((e) => e.inquiryType === filters.inquiryType);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter((e) => e.priority === filters.priority);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.enquiryReference.toLowerCase().includes(q) ||
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.message.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt DESC (newest first)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get single enquiry by ID.
   */
  public async getEnquiryById(id: string): Promise<ContactEnquiry | null> {
    this.ensureLoaded();
    return this.cache.get(id) || null;
  }

  /**
   * Update enquiry status or notes.
   */
  public async updateEnquiry(
    id: string,
    updates: {
      status?: EnquiryStatus;
      priority?: EnquiryPriority;
      adminNotes?: string;
      adminEmail?: string;
    }
  ): Promise<ContactEnquiry | null> {
    this.ensureLoaded();
    const existing = this.cache.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    if (updates.status) {
      existing.status = updates.status;
      if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') {
        existing.resolvedAt = now;
        existing.resolvedBy = updates.adminEmail || 'Admin';
      }
    }

    if (updates.priority) existing.priority = updates.priority;
    if (updates.adminNotes !== undefined) existing.adminNotes = updates.adminNotes;
    existing.updatedAt = now;

    this.cache.set(id, existing);
    this.persist();

    // Sync to Supabase
    try {
      const supabase = getSupabaseServerClient();
      await supabase
        .from('contact_enquiries')
        .update({
          status: existing.status,
          priority: existing.priority,
          admin_notes: existing.adminNotes,
          resolved_at: existing.resolvedAt,
          resolved_by: existing.resolvedBy,
          updated_at: existing.updatedAt,
        })
        .eq('id', id);
    } catch {
      // Ignore
    }

    return existing;
  }

  /**
   * Delete an enquiry permanently with audit log.
   */
  public async deleteEnquiry(id: string, adminEmail: string): Promise<boolean> {
    this.ensureLoaded();
    if (!this.cache.has(id)) return false;

    const existing = this.cache.get(id);
    this.cache.delete(id);
    this.persist();

    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('contact_enquiries').delete().eq('id', id);
    } catch {
      // Ignore
    }

    try {
      adminDataStore.addAuditLog({
        action: 'ENQUIRY_DELETED',
        entityType: 'CONTACT_ENQUIRY',
        entityId: id,
        adminEmail,
        details: `Deleted enquiry reference ${existing?.enquiryReference} from ${existing?.fullName}`,
      });
    } catch {
      // Ignore
    }

    return true;
  }

  /**
   * Calculate real dashboard metrics from existing records.
   */
  public async getStats(): Promise<EnquiryStats> {
    this.ensureLoaded();
    const list = Array.from(this.cache.values());
    const todayStr = new Date().toISOString().slice(0, 10);

    return {
      total: list.length,
      newCount: list.filter((e) => e.status === 'NEW').length,
      inProgressCount: list.filter((e) => e.status === 'IN_PROGRESS').length,
      resolvedCount: list.filter((e) => e.status === 'RESOLVED').length,
      closedCount: list.filter((e) => e.status === 'CLOSED').length,
      todayCount: list.filter((e) => e.createdAt.startsWith(todayStr)).length,
    };
  }
}

export const enquiryStore = new EnquiryStore();

