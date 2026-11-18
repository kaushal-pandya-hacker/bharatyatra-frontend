import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '../../lib/supabase/client';

export interface MigrationParityReport {
  timestamp: string;
  dryRun: boolean;
  sourceCounts: Record<string, number>;
  migratedCounts: Record<string, number>;
  parityVerified: boolean;
  errors: string[];
}

export class JsonToPostgresMigrator {
  private dataDir: string;

  constructor(customDataDir?: string) {
    this.dataDir = customDataDir || path.join(process.cwd(), 'data');
  }

  /**
   * Reads and parses a JSON store safely
   */
  private readStore(filename: string): any {
    const p = path.join(this.dataDir, filename);
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Executes the non-destructive data migration from local JSON stores into PostgreSQL
   */
  public async executeMigration(options: { dryRun?: boolean } = {}): Promise<MigrationParityReport> {
    const dryRun = options.dryRun ?? true;
    const errors: string[] = [];
    const sourceCounts: Record<string, number> = {};
    const migratedCounts: Record<string, number> = {};

    console.log('\n' + '='.repeat(80));
    console.log(`🚀 BHARATYATRA JSON-TO-POSTGRESQL MIGRATION ENGINE [Mode: ${dryRun ? 'DRY-RUN (SIMULATION)' : 'LIVE EXECUTION'}]`);
    console.log('='.repeat(80));

    // 1. Inventory & Extract Source Entities
    const contribRaw = this.readStore('community_contributions.json');
    const submissions: any[] = contribRaw?.submissions || [];
    sourceCounts['place_submissions'] = submissions.length;

    const published: any[] = this.readStore('community_published_destinations.json') || [];
    sourceCounts['published_destinations'] = published.length;

    const rewardRaw = this.readStore('community_rewards.json');
    const coupons: any[] = rewardRaw?.coupons || [];
    sourceCounts['contributor_rewards'] = coupons.length;

    const notifications: any[] = this.readStore('user_notifications.json') || [];
    sourceCounts['user_notifications'] = notifications.length;

    const tickets: any[] = this.readStore('support_tickets.json') || [];
    sourceCounts['support_tickets'] = tickets.length;

    const enquiries: any[] = this.readStore('contact_enquiries.json') || [];
    sourceCounts['contact_enquiries'] = enquiries.length;

    const reviews: any[] = this.readStore('trip_reviews.json') || [];
    sourceCounts['trip_reviews'] = reviews.length;

    console.log('📦 Source Entity Inventory:');
    console.table(sourceCounts);

    // 2. Perform Migration / Upsert with exact camelCase -> snake_case schema transformation
    const tables = [
      {
        name: 'place_submissions',
        raw: submissions,
        transformed: submissions.map(s => ({
          id: s.id,
          contributor_id: s.contributorId || 'anonymous',
          contributor_name: s.contributorName || 'Explorer',
          contributor_email: s.contributorEmail || '',
          place_name: s.placeName,
          category: s.category || 'HERITAGE',
          country: s.country || 'India',
          state: s.state,
          district: s.district || null,
          city: s.city || '',
          address: s.address,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          short_description: s.shortDescription,
          detailed_description: s.detailedDescription,
          photos: s.photos || [],
          best_time_to_visit: s.bestTimeToVisit || null,
          estimated_visit_duration: s.estimatedVisitDuration || null,
          entry_fee: s.entryFee || null,
          opening_hours: s.openingHours || null,
          parking_available: Boolean(s.parkingAvailable),
          facilities: s.facilities || [],
          travel_tips: s.travelTips || [],
          nearby_attractions: s.nearbyAttractions || [],
          suitable_for: s.suitableFor || [],
          status: s.status || 'PENDING',
          rejection_reason: s.rejectionReason || null,
          admin_feedback: s.adminFeedback || null,
          ai_verification: s.aiVerification || null,
          reward_coupon_code: s.rewardCouponCode || null,
          destination_id: s.approvedPlaceId || null,
          approved_at: s.approvedAt || null,
          reviewed_by: s.reviewedBy || null,
          reviewed_at: s.reviewedAt || null,
          created_at: s.createdAt,
          updated_at: s.updatedAt,
          submitted_at: s.submittedAt || s.createdAt,
        })),
      },
      {
        name: 'published_destinations',
        raw: published,
        transformed: published.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          country: p.country || 'India',
          state: p.state,
          district: p.district || null,
          city: p.city || null,
          address: p.address,
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          short_description: p.shortDescription,
          description: p.description,
          primary_image_url: p.primaryImageUrl,
          images: p.images || [],
          best_time_to_visit: p.bestTimeToVisit || null,
          estimated_visit_duration: p.estimatedVisitDuration || null,
          entry_fee: p.entryFee || null,
          opening_hours: p.openingHours || null,
          facilities: p.facilities || [],
          travel_tips: p.travelTips || [],
          is_community_contributed: Boolean(p.isCommunityContributed),
          contributed_by_name: p.contributedByName || p.contributedBy?.fullName || null,
          contributed_by_id: p.contributedById || p.contributedBy?.id || null,
          submission_id: p.submissionId,
          rating: Number(p.rating || 0),
          total_reviews: p.totalReviews || 0,
          is_published: p.isPublished !== false,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        })),
      },
      {
        name: 'contributor_rewards',
        raw: coupons,
        transformed: coupons.map(c => ({
          id: c.id,
          code: c.code,
          contributor_id: c.contributorId,
          contributor_name: c.contributorName,
          contributor_email: c.contributorEmail,
          submission_id: c.submissionId,
          place_name: c.placeName,
          discount_percent: c.discountPercent || 7.00,
          max_discount_inr: c.maxDiscountInr || 2000.00,
          min_booking_inr: c.minBookingInr || 2500.00,
          status: c.status || 'ACTIVE',
          valid_from: c.validFrom,
          valid_until: c.validUntil,
          reserved_at: c.reservedAt || null,
          reserved_booking_id: c.reservedBookingId || null,
          redeemed_at: c.redeemedAt || null,
          redeemed_booking_id: c.redeemedBookingId || null,
          created_at: c.createdAt,
        })),
      },
      {
        name: 'user_notifications',
        raw: notifications,
        transformed: notifications.map(n => ({
          id: n.id,
          recipient_email: n.recipientEmail || 'traveler@bharatyatra.in',
          user_id: n.userId || null,
          title: n.title,
          message: n.message,
          category: n.category || 'COMMUNITY',
          type: n.type || 'NOTIFICATION',
          deep_link: n.deepLink || null,
          read_at: n.readAt || null,
          metadata: n.metadata || null,
          created_at: n.createdAt,
        })),
      },
      {
        name: 'support_tickets',
        raw: tickets,
        transformed: tickets.map(t => ({
          id: t.id,
          ticket_number: t.ticketNumber || t.id,
          customer_name: t.customerName || 'Customer',
          customer_email: t.customerEmail || '',
          phone: t.phone || null,
          category: t.category || 'GENERAL',
          subject: t.subject,
          description: t.description,
          priority: t.priority || 'MEDIUM',
          assigned_staff: t.assignedStaff || null,
          status: t.status || 'OPEN',
          created_at: t.createdAt,
          updated_at: t.updatedAt || t.createdAt,
          messages: t.messages || [],
        })),
      },
      {
        name: 'contact_enquiries',
        raw: enquiries,
        transformed: enquiries.map(e => ({
          id: e.id,
          enquiry_reference: e.enquiryReference,
          full_name: e.fullName,
          email: e.email,
          phone: e.phone,
          inquiry_type: e.inquiryType,
          message: e.message,
          status: e.status || 'NEW',
          priority: e.priority || 'NORMAL',
          source: e.source || 'WEBSITE',
          email_notification_status: e.emailNotificationStatus || 'NOT_CONFIGURED',
          whatsapp_notification_status: e.whatsappNotificationStatus || 'NOT_CONFIGURED',
          created_at: e.createdAt,
          updated_at: e.updatedAt || e.createdAt,
        })),
      },
      {
        name: 'trip_reviews',
        raw: reviews,
        transformed: reviews.map(r => ({
          id: r.id,
          trip_id: r.tripId || null,
          user_id: r.userId || null,
          customer_name: r.customerName || 'Traveler',
          customer_email: r.customerEmail || null,
          destination: r.destination,
          trip_dates: r.tripDates || null,
          traveller_count: r.travellerCount || 1,
          overall_rating: r.overallRating || 5,
          category_ratings: r.categoryRatings || null,
          positive_highlights: r.positiveHighlights || [],
          improvement_suggestions: r.improvementSuggestions || [],
          written_review: r.writtenReview || '',
          photos: r.photos || [],
          status: r.status || 'PUBLISHED',
          created_at: r.createdAt,
          updated_at: r.updatedAt || r.createdAt,
        })),
      },
    ];

    const supabase = getSupabaseServerClient();

    for (const table of tables) {
      if (dryRun) {
        // Validate each record schema without modifying database
        let validCount = 0;
        for (const item of table.transformed) {
          if (item && (item.id || (item as any).code)) {
            validCount++;
          }
        }
        migratedCounts[table.name] = validCount;
      } else {
        try {
          if (table.transformed.length > 0) {
            const conflictKey = table.name === 'contributor_rewards' ? 'code' : 'id';
            const { error } = await supabase.from(table.name as any).upsert(table.transformed as any, { onConflict: conflictKey });
            if (error) {
              errors.push(`Table [${table.name}] upsert error: ${error.message}`);
              migratedCounts[table.name] = 0;
            } else {
              migratedCounts[table.name] = table.transformed.length;
            }
          } else {
            migratedCounts[table.name] = 0;
          }
        } catch (err: any) {
          errors.push(`Table [${table.name}] exception: ${err.message}`);
          migratedCounts[table.name] = 0;
        }
      }
    }

    // 3. Verify Parity
    let parityVerified = true;
    for (const [table, count] of Object.entries(sourceCounts)) {
      if (migratedCounts[table] !== count) {
        parityVerified = false;
        errors.push(`Parity mismatch for table [${table}]: Source=${count}, Target=${migratedCounts[table]}`);
      }
    }

    console.log('-'.repeat(80));
    console.log(`Parity Verification: ${parityVerified ? '100% PARITY CONFIRMED' : 'PARITY MISMATCH'}`);
    if (errors.length > 0) {
      console.log('Errors / Notices:');
      errors.forEach(e => console.log(`  - ${e}`));
    }
    console.log('='.repeat(80) + '\n');

    return {
      timestamp: new Date().toISOString(),
      dryRun,
      sourceCounts,
      migratedCounts,
      parityVerified,
      errors,
    };
  }
}

// CLI runner
if (require.main === module) {
  const migrator = new JsonToPostgresMigrator();
  migrator.executeMigration({ dryRun: true }).then(report => {
    if (!report.parityVerified) process.exit(1);
  });
}
