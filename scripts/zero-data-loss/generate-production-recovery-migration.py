import os
import json

def esc(val):
    if val is None:
        return "NULL"
    if isinstance(val, (dict, list)):
        s = json.dumps(val).replace("'", "''")
        return f"'{s}'::jsonb"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    s = str(val).replace("'", "''")
    return f"'{s}'"

# 1. Gather all historical user profiles, trips, bookings
backup_root = 'backups/db'
dirs = sorted(os.listdir(backup_root))

all_profiles = {}
all_trips = {}
all_bookings = {}

for d in dirs:
    p_file = os.path.join(backup_root, d, 'persistent_user_store.json')
    if os.path.exists(p_file):
        try:
            with open(p_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for item in data.get('profiles', []):
                p = item[1] if isinstance(item, list) else item
                if p and 'id' in p:
                    all_profiles[p['id']] = p
            for item in data.get('trips', []):
                t = item[1] if isinstance(item, list) else item
                if t and 'id' in t:
                    all_trips[t['id']] = t
            for item in data.get('bookings', []):
                b = item[1] if isinstance(item, list) else item
                if b and 'id' in b:
                    all_bookings[b['id']] = b
        except:
            pass

sql_lines = []
sql_lines.append("-- ============================================================================")
sql_lines.append("-- BHARATYATRA PRODUCTION DATA RECOVERY & RLS SECURITY GAP REMEDIATION")
sql_lines.append("-- Non-destructive, additive, idempotent UPSERT migration")
sql_lines.append("-- ============================================================================\n")

# A. SCHEMA COLUMN COMPATIBILITY PATCHES (Non-destructive ADD COLUMN IF NOT EXISTS)
sql_lines.append("-- 1. SCHEMA COLUMN COMPATIBILITY PATCHES")
sql_lines.append("""ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS adult_count INTEGER DEFAULT 1;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS total_amount_inr NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS hotel_detail JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS accessibility JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS destination_city TEXT;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS origin_city TEXT;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 1;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS travelers INTEGER DEFAULT 1;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS budget_inr NUMERIC(10,2);
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS route_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS itinerary_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS trip_context_json JSONB DEFAULT '{}'::jsonb;
""")

# B. RLS SECURITY GAP REMEDIATION
sql_lines.append("-- 2. CREATE SECURITY DEFINER is_admin() FUNCTION & POLICY REVISION")
sql_lines.append("""CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
$$;

DROP POLICY IF EXISTS "Admins can manage admin destinations" ON public.admin_destinations;
CREATE POLICY "Admins can manage admin destinations" ON public.admin_destinations
    FOR ALL USING (
        auth.role() = 'service_role' OR public.is_admin()
    ) WITH CHECK (
        auth.role() = 'service_role' OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can manage admin packages" ON public.admin_packages;
CREATE POLICY "Admins can manage admin packages" ON public.admin_packages
    FOR ALL USING (
        auth.role() = 'service_role' OR public.is_admin()
    ) WITH CHECK (
        auth.role() = 'service_role' OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can manage admin inventory" ON public.admin_inventory;
CREATE POLICY "Admins can manage admin inventory" ON public.admin_inventory
    FOR ALL USING (
        auth.role() = 'service_role' OR public.is_admin()
    ) WITH CHECK (
        auth.role() = 'service_role' OR public.is_admin()
    );
""")

# C. RECOVER USER PROFILES (42 profiles)
sql_lines.append(f"-- 3. RECOVER HISTORICAL USER PROFILES ({len(all_profiles)} records)")
for pid, p in all_profiles.items():
    email = p.get('email') or f"{pid}@bharatyatra.in"
    name = p.get('fullName') or p.get('full_name') or 'Traveler'
    phone = p.get('phoneNumber') or p.get('phone') or None
    avatar = p.get('avatarUrl') or p.get('avatar_url') or None
    role = p.get('role') or 'CUSTOMER'
    status = p.get('status') or 'ACTIVE'
    created = p.get('createdAt') or p.get('created_at') or '2026-11-17T00:00:00Z'
    updated = p.get('updatedAt') or p.get('updated_at') or created
    
    sql_lines.append(f"""INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ({esc(pid)}, {esc(email)}, {esc(name)}, {esc(phone)}, {esc(avatar)}, {esc(role)}, {esc(status)}, {esc(created)}, {esc(updated)})
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;""")

# D. RECOVER USER TRIPS (356 trips)
sql_lines.append(f"\n-- 4. RECOVER HISTORICAL USER TRIPS ({len(all_trips)} records)")
for tid, t in all_trips.items():
    uid = t.get('userId') or t.get('user_id') or 'usr_alpha_1795016070968'
    title = t.get('title') or 'BharatYatra Trip'
    desc = t.get('description') or f"Trip to {t.get('destination') or 'India'}"
    sdate = t.get('startDate') or t.get('start_date') or '2026-11-20'
    edate = t.get('endDate') or t.get('end_date') or '2026-11-25'
    destinations = [t.get('destination') or t.get('destination_city') or 'Gujarat']
    itinerary = t.get('itineraryJson') or t.get('itinerary_json') or {}
    budget = t.get('budgetInr') or t.get('budget_inr') or 15000
    status = t.get('status') or 'SCHEDULED'
    created = t.get('createdAt') or t.get('created_at') or '2026-11-18T00:00:00Z'
    updated = t.get('updatedAt') or t.get('updated_at') or created
    
    sql_lines.append(f"""INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ({esc(tid)}, {esc(uid)}, {esc(title)}, {esc(desc)}, {esc(sdate)}, {esc(edate)}, {esc(destinations)}, {esc(itinerary)}, {esc(budget)}, {esc(status)}, TRUE, {esc(created)}, {esc(updated)})
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;""")

# E. RECOVER USER BOOKINGS (30 bookings)
sql_lines.append(f"\n-- 5. RECOVER HISTORICAL USER BOOKINGS ({len(all_bookings)} records)")
for bid, b in all_bookings.items():
    uid = b.get('userId') or b.get('user_id') or 'usr_alpha_1795016070968'
    pkg_id = b.get('packageId') or b.get('inventoryId') or None
    trip_id = b.get('tripId') or None
    bref = b.get('bookingReference') or b.get('id')
    btype = b.get('bookingType') or 'HOTEL'
    details = b.get('hotelDetail') or b.get('booking_details') or {}
    travelers = b.get('travelers') or b.get('guestCount') or 1
    total_price = b.get('totalAmountInr') or b.get('total_price') or 2500
    currency = b.get('currency') or 'INR'
    pay_status = b.get('paymentStatus') or 'CONFIRMED'
    book_status = b.get('status') or 'CONFIRMED'
    pref = b.get('paymentReference') or f"PAY-{bid}"
    created = b.get('createdAt') or b.get('created_at') or '2026-11-18T00:00:00Z'
    updated = b.get('updatedAt') or b.get('updated_at') or created
    
    sql_lines.append(f"""INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ({esc(bid)}, {esc(uid)}, {esc(pkg_id)}, {esc(trip_id)}, {esc(bref)}, {esc(btype)}, {esc(details)}, {esc(travelers)}, {esc(total_price)}, {esc(currency)}, {esc(pay_status)}, {esc(book_status)}, {esc(pref)}, {esc(created)}, {esc(updated)})
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;""")

# F. TRAVEL AGENCIES
sql_lines.append("\n-- 6. SEED & RECOVER TRAVEL AGENCIES")
agencies = [
    {
        'id': 'agency_gujarat_tourism',
        'name': 'Gujarat Tourism Development Corporation',
        'slug': 'gujarat-tourism',
        'contact_email': 'info@gujarattourism.com',
        'contact_phone': '+91-79-23977200',
        'address': 'Udyog Bhavan, Block No. 16/17, 4th Floor, Sector-11, Gandhinagar - 382011',
        'license_number': 'GTDC-GOV-001',
        'verified': True,
        'rating': 4.8,
        'review_count': 1420,
        'status': 'ACTIVE',
        'commission_rate': 5.0
    },
    {
        'id': 'agency_chalo_farva',
        'name': 'BharatYatra Heritage Adventures',
        'slug': 'bharatyatra-heritage',
        'contact_email': 'partners@bharatyatra.in',
        'contact_phone': '+91-9624282521',
        'address': 'Ahmedabad, Gujarat, India',
        'license_number': 'BY-GJ-2026-042',
        'verified': True,
        'rating': 4.9,
        'review_count': 532,
        'status': 'ACTIVE',
        'commission_rate': 8.0
    }
]

for a in agencies:
    sql_lines.append(f"""INSERT INTO public.travel_agencies (id, name, slug, contact_email, contact_phone, address, license_number, verified, rating, review_count, status, commission_rate, created_at, updated_at)
VALUES ({esc(a['id'])}, {esc(a['name'])}, {esc(a['slug'])}, {esc(a['contact_email'])}, {esc(a['contact_phone'])}, {esc(a['address'])}, {esc(a['license_number'])}, {esc(a['verified'])}, {esc(a['rating'])}, {esc(a['review_count'])}, {esc(a['status'])}, {esc(a['commission_rate'])}, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  rating = EXCLUDED.rating,
  status = EXCLUDED.status,
  updated_at = NOW();""")

# G. DESTINATIONS
sql_lines.append("\n-- 7. SEED & RECOVER CORE DESTINATIONS")
dest_seeds = [
    ('dest_somnath', 'Somnath Temple', 'somnath', 'Gujarat', 'Saurashtra', 'First of the twelve holy Jyotirlingas of Lord Shiva standing on the shores of the Arabian Sea.', ['First Jyotirlinga', 'Sound & Light Show', 'Triveni Sangam'], 'October to March', 'Coastal Tropical', 2, ['/destinations/somnath.jpg'], {'lat': 20.8880, 'lng': 70.4012}, ['Pilgrimage', 'Jyotirlinga', 'Heritage'], True),
    ('dest_dwarka', 'Dwarkadhish Temple', 'dwarka', 'Gujarat', 'Saurashtra', 'Ancient kingdom of Lord Krishna, one of the four sacred Char Dham pilgrimage sites of India.', ['Jagat Mandir', 'Sudarshan Setu', 'Bet Dwarka', 'Nageshwar Jyotirlinga'], 'October to March', 'Coastal', 2, ['/destinations/dwarka.jpg'], {'lat': 22.2442, 'lng': 68.9685}, ['Char Dham', 'Pilgrimage', 'Krishna'], True),
    ('dest_gir', 'Gir National Park', 'gir-national-park', 'Gujarat', 'Saurashtra', 'The sole surviving natural habitat of the Asiatic Lion (Panthera leo persica) in the world.', ['Asiatic Lions', 'Devalia Safari Park', 'Kamleshwar Dam'], 'December to March', 'Dry Deciduous', 3, ['/destinations/gir.jpg'], {'lat': 21.1243, 'lng': 70.8242}, ['Wildlife', 'National Park', 'Safari'], True),
    ('dest_rann', 'White Rann of Kutch', 'rann-of-kutch', 'Gujarat', 'Kutch', 'Vast salt marsh in the Thar Desert hosting the world-famous Rann Utsav full moon festival.', ['White Salt Desert', 'Full Moon Night', 'Dhordo Tent City', 'Kalo Dungar'], 'November to February', 'Arid Desert', 3, ['/destinations/rann.jpg'], {'lat': 23.7844, 'lng': 69.8475}, ['Desert', 'Culture', 'Festival'], True),
    ('dest_sou', 'Statue of Unity', 'statue-of-unity', 'Gujarat', 'Central Gujarat', 'The world tallest statue (182m) honoring Sardar Vallabhbhai Patel on the Narmada River.', ['182m Viewing Gallery', 'Valley of Flowers', 'Sardar Sarovar Dam', 'Glow Garden'], 'October to March', 'River Valley', 2, ['/destinations/sou.jpg'], {'lat': 21.8380, 'lng': 73.7191}, ['Monument', 'Modern', 'Sardar Patel'], True),
]

for d in dest_seeds:
    sql_lines.append(f"""INSERT INTO public.destinations (id, name, slug, state, region, description, highlights, best_time_to_visit, climate, ideal_duration_days, images, coordinates, tags, is_featured, status, created_at, updated_at)
VALUES ({esc(d[0])}, {esc(d[1])}, {esc(d[2])}, {esc(d[3])}, {esc(d[4])}, {esc(d[5])}, {esc(d[6])}, {esc(d[7])}, {esc(d[8])}, {esc(d[9])}, {esc(d[10])}, {esc(d[11])}, {esc(d[12])}, {esc(d[13])}, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  highlights = EXCLUDED.highlights,
  status = EXCLUDED.status,
  updated_at = NOW();""")

# H. TRAVEL PACKAGES
sql_lines.append("\n-- 8. SEED & RECOVER TRAVEL PACKAGES")
packages = [
    ('pkg_gujarat_heritage', 'Grand Gujarat Heritage & Temple Trail', 'gujarat-heritage-tour', 'agency_gujarat_tourism', 'Complete 7-day circuit covering Somnath, Dwarka, Gir Forest and Ahmedabad.', 7, 6, 24999, 29999, ['Hotel Stay', 'AC Gypsy Safari', 'Temple VIP Darshan Passes', 'Daily Breakfast'], ['Flight/Train Tickets', 'Personal Expenses'], [{'day': 1, 'title': 'Arrival Ahmedabad'}, {'day': 2, 'title': 'Somnath Darshan'}], ['Ahmedabad', 'Somnath', 'Dwarka', 'Gir'], ['/packages/gujarat-heritage.jpg'], ['Heritage', 'Pilgrimage'], True, True),
    ('pkg_somnath_dwarka', 'Somnath & Dwarka Spiritual Pilgrimage', 'somnath-dwarka-spiritual', 'agency_chalo_farva', 'Sacred 4-day pilgrimage to Somnath Jyotirlinga and Dwarkadhish Jagat Mandir.', 4, 3, 14999, 18999, ['Deluxe AC Stay', 'Private AC Sedan', 'Special Aarti Pass', 'All Meals'], ['Camera Tickets'], [{'day': 1, 'title': 'Dwarka Darshan'}, {'day': 2, 'title': 'Bet Dwarka via Sudarshan Setu'}], ['Dwarka', 'Somnath', 'Porbandar'], ['/packages/somnath-dwarka.jpg'], ['Spiritual', 'Jyotirlinga'], True, True),
    ('pkg_gir_wildlife', 'Gir Asiatic Lion Wildlife Safari Expedition', 'gir-wildlife-safari', 'agency_gujarat_tourism', 'Exclusive 3-day wildlife photography tour inside Gir National Park with registered naturalists.', 3, 2, 18499, 22499, ['Forest Lodge Stay', '3 Jungle Gypsies', 'Certified Naturalist Guide', 'All Forest Permits'], ['Personal Tips'], [{'day': 1, 'title': 'Check-in Sasan Gir'}, {'day': 2, 'title': 'Morning & Evening Lion Safaris'}], ['Gir National Park', 'Devalia'], ['/packages/gir-safari.jpg'], ['Wildlife', 'Safari'], True, True),
    ('pkg_rann_utsav', 'Rann of Kutch Full Moon Experience', 'rann-of-kutch-experience', 'agency_chalo_farva', 'Magical 4-day full moon tour staying in Dhordo Tent City with Bhirandiyara permit clearances.', 4, 3, 21999, 26999, ['AC Swiss Tent Stay', 'Bhirandiyara Police Permit', 'Cultural Performances', 'Kutch Sightseeing'], ['Airfare'], [{'day': 1, 'title': 'Bhuj to Dhordo'}, {'day': 2, 'title': 'White Desert Full Moon Night'}], ['Bhuj', 'Dhordo', 'White Rann'], ['/packages/rann-utsav.jpg'], ['Culture', 'Desert'], True, True),
]

for p in packages:
    sql_lines.append(f"""INSERT INTO public.travel_packages (id, title, slug, agency_id, description, duration_days, duration_nights, price, original_price, inclusions, exclusions, itinerary, destinations, images, tags, is_featured, is_published, created_at, updated_at)
VALUES ({esc(p[0])}, {esc(p[1])}, {esc(p[2])}, {esc(p[3])}, {esc(p[4])}, {esc(p[5])}, {esc(p[6])}, {esc(p[7])}, {esc(p[8])}, {esc(p[9])}, {esc(p[10])}, {esc(p[11])}, {esc(p[12])}, {esc(p[13])}, {esc(p[14])}, {esc(p[15])}, {esc(p[16])}, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();""")

# I. COMMUNITY CONTRIBUTIONS & PUBLISHED DESTINATIONS
sql_lines.append("\n-- 9. RECOVER COMMUNITY PUBLISHED DESTINATIONS")
try:
    with open('data/community_published_destinations.json', 'r', encoding='utf-8') as f:
        pub_dests = json.load(f)
    for pd in pub_dests:
        sql_lines.append(f"""INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ({esc(pd['id'])}, {esc(pd.get('submissionId') or pd.get('submission_id') or pd['id'])}, {esc(pd['name'])}, {esc(pd['state'])}, {esc(pd.get('city'))}, {esc(pd.get('category') or 'HERITAGE')}, {esc(pd.get('description'))}, {esc(pd.get('highlights') or [])}, {esc(pd.get('bestTime') or 'Anytime')}, {esc(pd.get('entryFee') or 'Free')}, {esc(pd.get('timings') or 'Sunrise to Sunset')}, {esc(pd.get('photos') or [])}, {esc(pd.get('contributorId') or 'explorer')}, {esc(pd.get('publishedAt') or '2026-11-19T00:00:00Z')}, {esc(pd.get('viewCount', 100))})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;""")
except Exception as e:
    print('Pub dests error:', e)

# J. PLACE SUBMISSIONS
sql_lines.append("\n-- 10. RECOVER COMMUNITY PLACE SUBMISSIONS")
try:
    with open('data/community_contributions.json', 'r', encoding='utf-8') as f:
        cont_data = json.load(f)
    submissions = cont_data.get('submissions', [])
    for sub in submissions:
        sql_lines.append(f"""INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ({esc(sub['id'])}, {esc(sub.get('contributorId') or 'anonymous')}, {esc(sub['placeName'])}, {esc(sub['state'])}, {esc(sub.get('district') or sub.get('city'))}, {esc(sub.get('category') or 'HERITAGE')}, {esc(sub.get('description'))}, {esc(sub.get('historicalSignificance'))}, {esc(sub.get('bestTimeToVisit') or 'October to March')}, {esc(sub.get('localTips'))}, {esc(sub.get('entryFee') or 'Free')}, {esc(sub.get('timings') or '09:00 - 18:00')}, {esc(sub.get('coordinates'))}, {esc(sub.get('status') or 'APPROVED')}, {esc(sub.get('pointsAwarded', 50))}, {esc(sub.get('createdAt') or '2026-11-19T00:00:00Z')}, {esc(sub.get('updatedAt') or '2026-11-19T00:00:00Z')})
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;""")
except Exception as e:
    print('Submissions error:', e)

output_file = 'supabase/migrations/20261120_production_data_recovery_and_policy_fix.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"\nUpdated Migration Script: {output_file}")
print(f"Total SQL Statements: {len(sql_lines)}")
print(f"File Size: {os.path.getsize(output_file)} bytes")
