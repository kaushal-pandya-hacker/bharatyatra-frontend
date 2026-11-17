/**
 * BharatYatra — Community Contributor Reward Service
 * Manages 7% Contributor Reward Coupons (BHARAT7-XXXXXX), generation, verification, and redemption.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ContributorRewardCoupon {
  id: string;
  code: string; // e.g. BHARAT7-A1B2C3
  contributorId: string;
  contributorName: string;
  contributorEmail: string;
  submissionId: string;
  placeName: string;
  discountPercent: number; // 7%
  maxDiscountInr: number; // e.g. 2000
  minBookingInr: number; // e.g. 2500
  status: 'ACTIVE' | 'RESERVED' | 'REDEEMED' | 'EXPIRED' | 'REVOKED';
  validFrom: string;
  validUntil: string;
  reservedAt?: string;
  reservedBookingId?: string;
  redeemedAt?: string;
  redeemedBookingId?: string;
  createdAt: string;
}

export interface RewardSettings {
  discountPercent: number;
  defaultValidityDays: number;
  minBookingInr: number;
  maxDiscountInr: number;
  eligibleCategories: string[];
  autoRewardEnabled: boolean;
}

export interface RewardAuditLog {
  id: string;
  couponId: string;
  adminId: string;
  action: 'ISSUED' | 'RESERVED' | 'REDEEMED' | 'RELEASED' | 'REVOKED' | 'SETTINGS_UPDATED';
  reason?: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const REWARDS_FILE = path.join(DATA_DIR, 'community_rewards.json');

class ContributorRewardService {
  private coupons: Map<string, ContributorRewardCoupon> = new Map();
  private auditLogs: RewardAuditLog[] = [];
  private settings: RewardSettings = {
    discountPercent: 7,
    defaultValidityDays: 90,
    minBookingInr: 2500,
    maxDiscountInr: 2000,
    eligibleCategories: ['HOTEL', 'PACKAGE', 'ROAD_TRIP', 'ACTIVITY'],
    autoRewardEnabled: true,
  };
  private isLoaded = false;

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(REWARDS_FILE)) {
        const raw = fs.readFileSync(REWARDS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.coupons)) {
          parsed.coupons.forEach((c: ContributorRewardCoupon) => this.coupons.set(c.code, c));
        }
        if (Array.isArray(parsed.auditLogs)) {
          this.auditLogs = parsed.auditLogs;
        }
        if (parsed.settings) {
          this.settings = { ...this.settings, ...parsed.settings };
        }
      } else {
        // Initialize default seed coupons for test/demo
        this.seedInitialCoupons();
        this.persist();
      }
    } catch (err) {
      console.error('Failed to load community rewards data, using memory state:', err);
    }
    this.isLoaded = true;
  }

  private seedInitialCoupons(): void {
    const seed: ContributorRewardCoupon[] = [
      {
        id: 'rew-seed-001',
        code: 'BHARAT7-DWARKA',
        contributorId: 'usr-kaushal-01',
        contributorName: 'Kaushal Pandya',
        contributorEmail: 'pandyakaushal294@gmail.com',
        submissionId: 'sub-001',
        placeName: 'Bet Dwarka Marine Heritage',
        discountPercent: 7,
        maxDiscountInr: 2000,
        minBookingInr: 2500,
        status: 'ACTIVE',
        validFrom: new Date(Date.now() - 10 * 86400000).toISOString(),
        validUntil: new Date(Date.now() + 80 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'rew-seed-002',
        code: 'BHARAT7-SAPUTARA',
        contributorId: 'usr-test-02',
        contributorName: 'Aarav Mehta',
        contributorEmail: 'aarav@bharatyatra.in',
        submissionId: 'sub-002',
        placeName: 'Gira Waterfalls Eco Trail',
        discountPercent: 7,
        maxDiscountInr: 2000,
        minBookingInr: 2500,
        status: 'REDEEMED',
        validFrom: new Date(Date.now() - 30 * 86400000).toISOString(),
        validUntil: new Date(Date.now() + 60 * 86400000).toISOString(),
        redeemedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        redeemedBookingId: 'bk-saputara-892',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    ];
    seed.forEach((c) => this.coupons.set(c.code, c));
  }

  private persist(): void {
    try {
      const payload = {
        coupons: Array.from(this.coupons.values()),
        auditLogs: this.auditLogs,
        settings: this.settings,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(REWARDS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist community rewards data:', err);
    }
  }

  public generateCouponCode(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `BHARAT7-${randomHex}`;
  }

  public issueApprovalReward(submission: {
    id: string;
    contributorId: string;
    contributorName: string;
    contributorEmail: string;
    placeName: string;
  }): ContributorRewardCoupon {
    this.ensureLoaded();

    // Idempotency: check if coupon already issued for this submission
    for (const c of Array.from(this.coupons.values())) {
      if (c.submissionId === submission.id) {
        return c;
      }
    }

    const code = this.generateCouponCode();
    const now = new Date();
    const validUntil = new Date(now.getTime() + this.settings.defaultValidityDays * 86400000);

    const coupon: ContributorRewardCoupon = {
      id: `rew-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      code,
      contributorId: submission.contributorId,
      contributorName: submission.contributorName,
      contributorEmail: submission.contributorEmail,
      submissionId: submission.id,
      placeName: submission.placeName,
      discountPercent: this.settings.discountPercent,
      maxDiscountInr: this.settings.maxDiscountInr,
      minBookingInr: this.settings.minBookingInr,
      status: 'ACTIVE',
      validFrom: now.toISOString(),
      validUntil: validUntil.toISOString(),
      createdAt: now.toISOString(),
    };

    this.coupons.set(code, coupon);
    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      couponId: coupon.id,
      adminId: 'SYSTEM_APPROVAL',
      action: 'ISSUED',
      reason: `Approved place contribution: ${submission.placeName}`,
      timestamp: now.toISOString(),
    });

    this.persist();
    return coupon;
  }

  public getContributorCoupons(userId: string): ContributorRewardCoupon[] {
    this.ensureLoaded();
    const now = new Date();
    return Array.from(this.coupons.values())
      .filter((c) => c.contributorId === userId || c.contributorEmail === userId)
      .map((c) => {
        // Auto-check expiry
        if (c.status === 'ACTIVE' && new Date(c.validUntil) < now) {
          c.status = 'EXPIRED';
        }
        return c;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllCoupons(filters?: { status?: string; search?: string }): ContributorRewardCoupon[] {
    this.ensureLoaded();
    const now = new Date();
    let list = Array.from(this.coupons.values()).map((c) => {
      if (c.status === 'ACTIVE' && new Date(c.validUntil) < now) {
        c.status = 'EXPIRED';
      }
      return c;
    });

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((c) => c.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.contributorName.toLowerCase().includes(q) ||
          c.contributorEmail.toLowerCase().includes(q) ||
          c.placeName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRewardStats() {
    this.ensureLoaded();
    const all = Array.from(this.coupons.values());
    const active = all.filter((c) => c.status === 'ACTIVE').length;
    const redeemed = all.filter((c) => c.status === 'REDEEMED').length;
    const expired = all.filter((c) => c.status === 'EXPIRED').length;
    const revoked = all.filter((c) => c.status === 'REVOKED').length;

    return {
      totalGenerated: all.length,
      active,
      redeemed,
      expired,
      revoked,
      redemptionRatePct: all.length > 0 ? Math.round((redeemed / all.length) * 100) : 0,
      totalDiscountGrantedInr: redeemed * 1450, // Real or estimated average savings
    };
  }

  public revokeCoupon(code: string, adminId: string, reason: string): boolean {
    this.ensureLoaded();
    const coupon = this.coupons.get(code);
    if (!coupon) return false;

    coupon.status = 'REVOKED';
    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      couponId: coupon.id,
      adminId,
      action: 'REVOKED',
      reason,
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return true;
  }
}

export const contributorRewardService = new ContributorRewardService();
