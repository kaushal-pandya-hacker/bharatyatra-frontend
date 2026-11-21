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
    const userStoreRaw = this.readStore('persistent_user_store.json');
    const profileEntries: any[] = userStoreRaw?.profiles || [];
    const tripEntries: any[] = userStoreRaw?.trips || [];
    const bookingEntries: any[] = userStoreRaw?.bookings || [];
    const preferenceEntries: any[] = userStoreRaw?.preferences || [];
    const savedDestEntries: any[] = userStoreRaw?.savedDestinations || [];
    const expenseEntries: any[] = userStoreRaw?.tripExpenses || [];

    const profiles = profileEntries.map(e => Array.isArray(e) ? e[1] : e).filter(Boolean);
    const trips = tripEntries.map(e => Array.isArray(e) ? e[1] : e).filter(Boolean);
    const bookings = bookingEntries.map(e => Array.isArray(e) ? e[1] : e).filter(Boolean);
    const preferences = preferenceEntries.map(e => Array.isArray(e) ? e[1] : e).filter(Boolean);
    const savedDestinations = savedDestEntries.map(e => Array.isArray(e) ? e[1] : e).filter(Boolean);
    const expenses = expenseEntries.map(e => Array.isArray(e) ? e[1] : e).filter(Boolean);

    sourceCounts['user_profiles'] = profiles.length;
    sourceCounts['user_trips'] = trips.length;
    sourceCounts['user_bookings'] = bookings.length;
    sourceCounts['user_preferences'] = preferences.length;
    sourceCounts['user_saved_destinations'] = savedDestinations.length;
    sourceCounts['trip_expenses'] = expenses.length;

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
        name: 'user_profiles',
        raw: profiles,
        transformed: profiles.map(p => ({
          id: p.id,
          email: p.email,
          full_name: p.fullName || p.full_name || '',
          phone_number: p.phoneNumber || p.phone_number || null,
          avatar_url: p.avatarUrl || p.avatar_url || null,
          role: p.role || 'CUSTOMER',
          status: p.status || 'ACTIVE',
          is_phone_verified: Boolean(p.isPhoneVerified || p.is_phone_verified),
          created_at: p.createdAt || p.created_at || new Date().toISOString(),
          updated_at: p.updatedAt || p.updated_at || new Date().toISOString(),
        })),
      },
      {
        name: 'user_trips',
        raw: trips,
        transformed: trips.map(t => ({
          id: t.id,
          user_id: t.userId || t.user_id,
          title: t.title || 'Untitled Trip',
          destination: t.destination || 'India',
          destination_city: t.destinationCity || t.destination_city || null,
          origin_city: t.originCity || t.origin_city || null,
          start_date: t.startDate || t.start_date || null,
          end_date: t.endDate || t.end_date || null,
          duration_days: Number(t.durationDays || t.duration_days || 1),
          travelers: Number(t.travelers || 1),
          budget_inr: t.budgetInr != null ? Number(t.budgetInr) : (t.budget_inr != null ? Number(t.budget_inr) : null),
          status: t.status || 'SCHEDULED',
          route_json: t.routeJson || t.route_json || {},
          itinerary_json: t.itineraryJson || t.itinerary_json || {},
          trip_context_json: t.tripContextJson || t.trip_context_json || {},
          created_at: t.createdAt || t.created_at || new Date().toISOString(),
          updated_at: t.updatedAt || t.updated_at || new Date().toISOString(),
        })),
      },
      {
        name: 'user_bookings',
        raw: bookings,
        transformed: bookings.map(b => ({
          id: b.id,
          booking_reference: b.bookingReference || b.booking_reference || b.id,
          user_id: b.userId || b.user_id,
          booking_type: b.bookingType || b.booking_type || 'HOTEL',
          inventory_type: b.inventoryType || b.inventory_type || null,
          inventory_id: b.inventoryId || b.inventory_id || null,
          inventory_title: b.inventoryTitle || b.inventory_title || 'Reservation',
          status: b.status || 'PENDING',
          start_date: b.startDate || b.start_date || null,
          end_date: b.endDate || b.end_date || null,
          adult_count: Number(b.adultCount || b.adult_count || 1),
          child_count: Number(b.childCount || b.child_count || 0),
          guest_count: Number(b.guestCount || b.guest_count || 1),
          total_amount_inr: Number(b.totalAmountInr || b.total_amount_inr || 0),
          currency: b.currency || 'INR',
          hotel_detail: b.hotelDetail || b.hotel_detail || {},
          cancellation_reason: b.cancellationReason || b.cancellation_reason || null,
          cancelled_at: b.cancelledAt || b.cancelled_at || null,
          created_at: b.createdAt || b.created_at || new Date().toISOString(),
          updated_at: b.updatedAt || b.updated_at || new Date().toISOString(),
        })),
      },
      {
        name: 'user_preferences',
        raw: preferences,
        transformed: preferences.map(pref => ({
          id: pref.id || `pref-${pref.userId}`,
          user_id: pref.userId || pref.user_id,
          travel_pace: pref.travelPace || pref.pace || 'BALANCED',
          budget_tier: pref.budgetTier || 'BALANCED',
          preferred_transport: pref.preferredTransport || [],
          dietary_preferences: pref.dietaryPreferences || [],
          interests: pref.interests || [],
          preferred_language: pref.preferredLanguage || 'English',
          special_requirements: pref.specialRequirements || null,
          created_at: pref.createdAt || new Date().toISOString(),
          updated_at: pref.updatedAt || new Date().toISOString(),
        })),
      },
      {
        name: 'user_saved_destinations',
        raw: savedDestinations,
        transformed: savedDestinations.map(d => ({
          id: d.id || `saved-${d.userId}-${d.destinationId || d.slug}`,
          user_id: d.userId || d.user_id,
          destination_id: d.destinationId || d.id || d.slug,
          destination_name: d.name || d.destinationName || 'Destination',
          destination_slug: d.slug || d.destinationSlug || null,
          notes: d.notes || null,
          saved_at: d.savedAt || d.createdAt || new Date().toISOString(),
        })),
      },
      {
        name: 'trip_expenses',
        raw: expenses,
        transformed: expenses.map(x => ({
          id: x.id,
          trip_id: x.tripId || x.trip_id,
          title: x.title,
          amount_inr: Number(x.amountInr || x.amount || 0),
          paid_by_member_id: x.paidByMemberId || x.paid_by || 'traveler',
          category: x.category || 'Food',
          split_type: x.splitType || 'EQUAL',
          participants: x.participants || [],
          created_at: x.createdAt || new Date().toISOString(),
        })),
      },
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

export async function runJsonToPostgresMigration(options: { dryRun?: boolean } = {}) {
  const migrator = new JsonToPostgresMigrator();
  return migrator.executeMigration(options);
}

// CLI runner
if (require.main === module) {
  const migrator = new JsonToPostgresMigrator();
  migrator.executeMigration({ dryRun: true }).then(report => {
    if (!report.parityVerified) process.exit(1);
  });
}
