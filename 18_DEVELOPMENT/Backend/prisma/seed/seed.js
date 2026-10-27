const { PrismaClient, GujaratRegion } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('[Prisma Seed] Starting Phase 2C Travel Inventory (Hotels + Restaurants + Activities) Seed...');

  const destinations = [
    {
      name: 'Dwarka',
      slug: 'dwarka',
      region: GujaratRegion.Saurashtra,
      category: 'Spiritual Heritage',
      description: 'One of the four sacred Char Dham pilgrimage sites, ancient coastal kingdom with 2,500-year-old temples and pristine sea beaches.',
      shortDescription: 'Sacred Char Dham city of Lord Krishna situated on the Arabian Sea coast.',
      tagline: 'Ancient Capital of Lord Krishna on the Arabian Sea',
      overview: 'Dwarka is one of India\'s most revered ancient cities and one of the four sacred Char Dham pilgrimage sites. Situated at the western tip of the Kathiawar peninsula where the Gomti River meets the Arabian Sea, Dwarka boasts the majestic Dwarkadhish Temple (Jagat Mandir), the sacred Bet Dwarka island, Nageshwar Jyotirlinga, and pristine coastal promenades.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=1600&q=80',
      heroColor: 'from-amber-600 to-amber-900',
      rating: 4.95,
      totalReviews: 3420,
      recommendedDays: 3,
      estimatedBudget: 15000.00,
      latitude: 22.2442,
      longitude: 68.9685,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Jamnagar Airport (JGA) — 137 km',
      nearestRailway: 'Dwarka Railway Station (DWK) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Dwarkadhish Temple',
          slug: 'dwarkadhish-temple',
          category: 'Spiritual Shrine',
          description: '5-storey 16th-century temple spire built on 72 pillars dedicated to Lord Krishna.',
          openingHours: '06:30 AM - 01:00 PM, 05:00 PM - 09:30 PM',
          entryFeeInr: 0,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Morning / Evening Aarti',
          latitude: 22.2378,
          longitude: 68.9678,
          isVerified: true
        },
        {
          name: 'Bet Dwarka Island',
          slug: 'bet-dwarka',
          category: 'Island Sanctuary',
          description: 'Sacred island residence of Lord Krishna accessed via scenic ferry boat ride.',
          openingHours: '07:00 AM - 05:30 PM',
          entryFeeInr: 30,
          averageVisitDuration: 240,
          bestTimeToVisit: 'Morning',
          latitude: 22.4578,
          longitude: 69.1023,
          isVerified: true
        },
        {
          name: 'Nageshwar Jyotirlinga',
          slug: 'nageshwar-jyotirlinga',
          category: 'Jyotirlinga Temple',
          description: 'One of the 12 sacred Shiva Jyotirlingas featuring a colossal 85ft Lord Shiva statue.',
          openingHours: '06:00 AM - 09:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Anytime',
          latitude: 22.3364,
          longitude: 69.0534,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Dwarkadhish Temple Morning Mangla Aarti',
          slug: 'dwarka-mangla-aarti',
          category: 'Spiritual',
          description: 'Attend the sacred 6:30 AM morning prayer ceremony at Jagat Mandir.',
          priceInr: 0,
          durationMinutes: 90,
          bestTimeToVisit: '06:30 AM',
          isVerified: true
        },
        {
          title: 'Bet Dwarka Island Boat Ferry Trip',
          slug: 'bet-dwarka-ferry',
          category: 'Boating',
          description: 'Scenic 30-minute passenger ferry boat across Okha port waters.',
          priceInr: 30,
          durationMinutes: 240,
          bestTimeToVisit: '08:30 AM',
          isVerified: true
        }
      ],
      hotels: [
        {
          name: 'Hawthorn Suites by Wyndham Dwarka',
          slug: 'hawthorn-suites-dwarka',
          description: 'Luxury eco-friendly resort set in lush gardens near Dwarkadhish temple.',
          address: 'Jamnagar-Dwarka Highway, Dwarka, Gujarat 361335',
          latitude: 22.2480,
          longitude: 68.9750,
          category: 'Luxury Resort',
          starRating: 5,
          pricePerNight: 7500.00,
          currency: 'INR',
          amenities: ['Free WiFi', 'Swimming Pool', 'Pure Veg Restaurant', 'Spa', 'Valet Parking'],
          isVerified: false
        },
        {
          name: 'Mercure Dwarka',
          slug: 'mercure-dwarka',
          description: 'Modern international hotel featuring comfortable rooms and authentic Gujarati dining.',
          address: 'Porbandar-Dwarka Highway, Dwarka, Gujarat 361335',
          latitude: 22.2410,
          longitude: 68.9710,
          category: 'Heritage Hotel',
          starRating: 4,
          pricePerNight: 4500.00,
          currency: 'INR',
          amenities: ['Free Breakfast', 'Fitness Center', 'Pure Veg Restaurant', 'Airport Shuttle'],
          isVerified: false
        },
        {
          name: 'Hotel Goverdhan Greens Dwarka',
          slug: 'hotel-goverdhan-greens',
          description: 'Charming pilgrim-friendly resort with spacious family suites and organic gardens.',
          address: 'National Highway 8E, Dwarka, Gujarat 361335',
          latitude: 22.2500,
          longitude: 68.9800,
          category: 'Family Resort',
          starRating: 3,
          pricePerNight: 2800.00,
          currency: 'INR',
          amenities: ['Free WiFi', 'Garden Restaurant', 'Children Play Area', 'Travel Desk'],
          isVerified: false
        }
      ],
      restaurants: [
        {
          name: 'Shrimad Bhavan Pure Veg Restaurant',
          slug: 'shrimad-bhavan-restaurant',
          description: 'Authentic Kathiyawadi & Gujarati Thali prepared with traditional ghee.',
          address: 'Near Temple Gate 2, Dwarka, Gujarat',
          latitude: 22.2380,
          longitude: 68.9680,
          cuisineType: 'Gujarati Kathiyawadi',
          priceRange: 'BUDGET',
          averageCost: 300.00,
          currency: 'INR',
          openingTime: '07:00 AM',
          closingTime: '10:30 PM',
          rating: 4.8,
          isVerified: false
        },
        {
          name: 'Chappan Bhog Dining Hall',
          slug: 'chappan-bhog-dwarka',
          description: 'Unlimited traditional Gujarati Thali with 56 special prasadam items.',
          address: 'Station Road, Dwarka, Gujarat',
          latitude: 22.2430,
          longitude: 68.9690,
          cuisineType: 'Unlimited Gujarati Thali',
          priceRange: 'MODERATE',
          averageCost: 450.00,
          currency: 'INR',
          openingTime: '11:00 AM',
          closingTime: '10:00 PM',
          rating: 4.7,
          isVerified: false
        },
        {
          name: 'Atithi Restaurant Dwarka',
          slug: 'atithi-restaurant-dwarka',
          description: 'Multi-cuisine vegetarian dining serving North Indian, South Indian, and Jain meals.',
          address: 'Main Bazaar Road, Dwarka, Gujarat',
          latitude: 22.2390,
          longitude: 68.9675,
          cuisineType: 'Multi-Cuisine Vegetarian',
          priceRange: 'MODERATE',
          averageCost: 400.00,
          currency: 'INR',
          openingTime: '08:00 AM',
          closingTime: '11:00 PM',
          rating: 4.6,
          isVerified: false
        }
      ]
    },
    {
      name: 'Somnath',
      slug: 'somnath',
      region: GujaratRegion.Saurashtra,
      category: 'Spiritual Heritage',
      description: 'First among the 12 holy Jyotirlinga shrines of Lord Shiva, rebuilt seven times on the pristine shores of the Arabian Sea.',
      shortDescription: 'First of the twelve sacred Jyotirlinga shrines on the coastal edge of Kathiawar.',
      tagline: 'The Eternal Shrine on the Arabian Sea Coast',
      overview: 'Somnath, located at Prabhas Patan near Veraval, is one of the most sacred pilgrimage destinations in Hinduism. The main Somnath Temple stands right on the shore of the ocean, offering awe-inspiring ocean views, daily sound & light shows, and deep spiritual heritage dating back thousands of years.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=1600&q=80',
      heroColor: 'from-orange-600 to-amber-900',
      rating: 4.90,
      totalReviews: 3100,
      recommendedDays: 2,
      estimatedBudget: 12000.00,
      latitude: 20.8880,
      longitude: 70.4012,
      bestTimeToVisit: 'November to February',
      nearestAirport: 'Keshod Airport (IXK) — 55 km / Diu — 85 km',
      nearestRailway: 'Veraval Junction (VRL) — 7 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Somnath Jyotirlinga Main Temple',
          slug: 'somnath-main-temple',
          category: 'Jyotirlinga Temple',
          description: 'Majestic Chalukya-style beachfront temple holding the first sacred Jyotirlinga.',
          openingHours: '06:00 AM - 09:30 PM',
          entryFeeInr: 0,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Morning / Evening',
          latitude: 20.8880,
          longitude: 70.4012,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Somnath Beach Promenade & Evening Sound & Light Show',
          slug: 'somnath-sound-light-show',
          category: 'Laser Show',
          description: '3D light projection show mapping the history of Somnath on temple walls.',
          priceInr: 30,
          durationMinutes: 60,
          bestTimeToVisit: '08:00 PM',
          isVerified: true
        }
      ],
      hotels: [
        {
          name: 'Lords Inn Somnath',
          slug: 'lords-inn-somnath',
          description: 'Boutique hotel with sea views and proximity to Somnath temple.',
          address: 'Bypass Road, Prabhas Patan, Somnath, Gujarat',
          latitude: 20.8900,
          longitude: 70.4030,
          category: 'Boutique Hotel',
          starRating: 4,
          pricePerNight: 3800.00,
          currency: 'INR',
          amenities: ['Free WiFi', 'Multi-Cuisine Veg Restaurant', 'Sea View Rooms', 'Parking'],
          isVerified: false
        },
        {
          name: 'The Fern Residency Somnath',
          slug: 'fern-residency-somnath',
          description: 'Eco-friendly hotel featuring modern amenities and fine dining.',
          address: 'Veraval-Somnath Highway, Somnath, Gujarat',
          latitude: 20.8950,
          longitude: 70.4050,
          category: 'Luxury Hotel',
          starRating: 4,
          pricePerNight: 4200.00,
          currency: 'INR',
          amenities: ['Free WiFi', 'Swimming Pool', 'Veg Dining', 'Banquet Hall'],
          isVerified: false
        },
        {
          name: 'Somnath Trust VIP Atithi Bhavan',
          slug: 'somnath-trust-atithi-bhavan',
          description: 'Official pilgrim guest house managed by Somnath Temple Trust.',
          address: 'Temple Bypass Road, Somnath, Gujarat',
          latitude: 20.8870,
          longitude: 70.4000,
          category: 'Pilgrim Bhavan',
          starRating: 3,
          pricePerNight: 1800.00,
          currency: 'INR',
          amenities: ['AC Rooms', 'Pure Veg Canteen', '24/7 Security', 'Temple Shuttle'],
          isVerified: false
        }
      ],
      restaurants: [
        {
          name: 'Somnath Trust Prasadam Dining Hall',
          slug: 'somnath-prasadam-hall',
          description: 'Sanctified pure vegetarian Mahaprasad thali served right near temple entrance.',
          address: 'Somnath Temple Complex, Gujarat',
          latitude: 20.8882,
          longitude: 70.4015,
          cuisineType: 'Temple Prasadam',
          priceRange: 'BUDGET',
          averageCost: 150.00,
          currency: 'INR',
          openingTime: '11:30 AM',
          closingTime: '09:00 PM',
          rating: 4.9,
          isVerified: false
        },
        {
          name: 'Blue Coriander Restaurant',
          slug: 'blue-coriander-somnath',
          description: 'Air-conditioned multi-cuisine dining with North Indian curries and Kathiyawadi flavors.',
          address: 'Lords Inn, Bypass Road, Somnath, Gujarat',
          latitude: 20.8902,
          longitude: 70.4032,
          cuisineType: 'Multi-Cuisine Veg',
          priceRange: 'MODERATE',
          averageCost: 500.00,
          currency: 'INR',
          openingTime: '07:30 AM',
          closingTime: '10:30 PM',
          rating: 4.6,
          isVerified: false
        }
      ]
    },
    {
      name: 'Ahmedabad',
      slug: 'ahmedabad',
      region: GujaratRegion.Central_Gujarat,
      category: 'World Heritage City',
      description: 'India\'s first UNESCO World Heritage City, famous for Sabarmati Ashram, intricate stone lattice pols, street food, and modern textiles.',
      shortDescription: 'UNESCO World Heritage city famous for Gandhi Ashram, historic Pols, and vibrant culture.',
      tagline: 'India\'s First UNESCO World Heritage City',
      overview: 'Ahmedabad is Gujarat\'s largest city and cultural heart. Founded in 1411 AD, it features UNESCO-recognized heritage pols, Mahatma Gandhi\'s historic Sabarmati Ashram, Adalaj Stepwell, Kankaria Lake, and world-class textiles.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-rose-700 to-red-950',
      rating: 4.85,
      totalReviews: 4200,
      recommendedDays: 3,
      estimatedBudget: 18000.00,
      latitude: 23.0225,
      longitude: 72.5714,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Sardar Vallabhbhai Patel International Airport (AMD) — 10 km',
      nearestRailway: 'Ahmedabad Junction (ADI) — 3 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Sabarmati Ashram',
          slug: 'sabarmati-ashram',
          category: 'Historical Heritage',
          description: 'Headquarters of Mahatma Gandhi during India\'s freedom struggle and Dandi March origin.',
          openingHours: '08:30 AM - 06:30 PM',
          entryFeeInr: 0,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Morning',
          latitude: 23.0605,
          longitude: 72.5808,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Heritage Walk through Old City Pols',
          slug: 'ahmedabad-heritage-walk',
          category: 'Walking Tour',
          description: 'Guided morning walk through historic wood-carved residential pol neighborhoods.',
          priceInr: 200,
          durationMinutes: 150,
          bestTimeToVisit: '07:30 AM',
          isVerified: true
        }
      ],
      hotels: [
        {
          name: 'ITC Narmada Luxury Hotel Ahmedabad',
          slug: 'itc-narmada-ahmedabad',
          description: '5-star luxury hotel celebrating Gujarat architecture and fine dining.',
          address: 'Judges Bungalow Road, Vastrapur, Ahmedabad, Gujarat',
          latitude: 23.0380,
          longitude: 72.5280,
          category: '5-Star Luxury',
          starRating: 5,
          pricePerNight: 9500.00,
          currency: 'INR',
          amenities: ['Free WiFi', 'Outdoor Pool', 'Royal Spa', 'Fine Dining Restaurants', 'Valet'],
          isVerified: false
        },
        {
          name: 'The House of MG (Heritage Hotel)',
          slug: 'house-of-mg-ahmedabad',
          description: '1924 restored royal mansion in old city opposite Sidi Saiyyed Mosque.',
          address: 'Opposite Sidi Saiyyed Mosque, Lal Darwaja, Ahmedabad, Gujarat',
          latitude: 23.0270,
          longitude: 72.5818,
          category: 'Heritage Mansion',
          starRating: 4,
          pricePerNight: 6200.00,
          currency: 'INR',
          amenities: ['Agashiye Terrace Dining', 'Indoor Pool', 'Heritage Walk Center', 'Art Gallery'],
          isVerified: false
        },
        {
          name: 'Lemon Tree Hotel CG Road',
          slug: 'lemon-tree-cg-road',
          description: 'Vibrant upscale business hotel located on bustling CG Road.',
          address: 'Mithakhali Six Roads, Navrangpura, Ahmedabad, Gujarat',
          latitude: 23.0320,
          longitude: 72.5610,
          category: 'Business Hotel',
          starRating: 4,
          pricePerNight: 3800.00,
          currency: 'INR',
          amenities: ['Free WiFi', 'Fitness Center', 'Citrus Cafe', 'Meeting Rooms'],
          isVerified: false
        }
      ],
      restaurants: [
        {
          name: 'Agashiye Terrace Thali Restaurant',
          slug: 'agashiye-ahmedabad',
          description: 'Iconic rooftop Gujarati Thali served in traditional brass thalis under starry sky.',
          address: 'The House of MG, Lal Darwaja, Ahmedabad, Gujarat',
          latitude: 23.0271,
          longitude: 72.5820,
          cuisineType: 'Royal Gujarati Thali',
          priceRange: 'LUXURY',
          averageCost: 1100.00,
          currency: 'INR',
          openingTime: '12:00 PM',
          closingTime: '10:30 PM',
          rating: 4.9,
          isVerified: false
        },
        {
          name: 'Swati Snacks Law Garden',
          slug: 'swati-snacks-ahmedabad',
          description: 'Legendary Gujarati street snacks cafe serving Panki, Handvo, and Jalebi.',
          address: 'Near Law Garden, Ellisbridge, Ahmedabad, Gujarat',
          latitude: 23.0250,
          longitude: 72.5580,
          cuisineType: 'Gujarati Street Snacks',
          priceRange: 'MODERATE',
          averageCost: 450.00,
          currency: 'INR',
          openingTime: '11:00 AM',
          closingTime: '10:00 PM',
          rating: 4.8,
          isVerified: false
        },
        {
          name: 'Vishalla Village Restaurant',
          slug: 'vishalla-ahmedabad',
          description: 'Open-air village-themed cultural dining serving authentic Kathiyawadi cuisine.',
          address: 'Vasna APMC Market Road, Ahmedabad, Gujarat',
          latitude: 22.9980,
          longitude: 72.5400,
          cuisineType: 'Traditional Kathiyawadi',
          priceRange: 'MODERATE',
          averageCost: 750.00,
          currency: 'INR',
          openingTime: '07:00 PM',
          closingTime: '11:00 PM',
          rating: 4.7,
          isVerified: false
        }
      ]
    },
    {
      name: 'Statue of Unity',
      slug: 'statue-of-unity',
      region: GujaratRegion.Central_Gujarat,
      category: 'Modern Landmark',
      description: 'Colossal 182-meter statue of Sardar Vallabhbhai Patel surrounded by Narmada dam, valley of flowers, jungle safari, and laser light shows.',
      shortDescription: 'World\'s tallest 182-meter statue set along the Narmada River in Ekta Nagar.',
      tagline: 'World\'s Tallest Monument (182 Meters) in Ekta Nagar',
      overview: 'Rising 182 meters above the Narmada River facing the Sardar Sarovar Dam, the Statue of Unity is the world\'s tallest statue. Developed as a world-class eco-tourism destination in Kevadia (Ekta Nagar), it features a viewing gallery at 153m, Valley of Flowers, Butterfly Garden, Cactus Garden, Glow Garden, and Narmada River Cruise.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1600&q=80',
      heroColor: 'from-cyan-700 to-slate-900',
      rating: 4.90,
      totalReviews: 2800,
      recommendedDays: 2,
      estimatedBudget: 16000.00,
      latitude: 21.8380,
      longitude: 73.7191,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Vadodara Airport (BDQ) — 90 km',
      nearestRailway: 'Ekta Nagar Railway Station (EKNR) — 5 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Statue of Unity Viewing Gallery',
          slug: 'statue-viewing-gallery',
          category: 'Observation Deck',
          description: 'High-speed elevators ascending to 153-meter high chest viewing gallery inside statue.',
          openingHours: '08:00 AM - 06:00 PM (Closed Mondays)',
          entryFeeInr: 380,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Morning',
          latitude: 21.8380,
          longitude: 73.7191,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Night Laser Projection Show on Statue Surface',
          slug: 'sou-laser-show',
          category: 'Laser Show',
          description: 'World-class 3D laser projection show mapping story of Sardar Patel.',
          priceInr: 0,
          durationMinutes: 45,
          bestTimeToVisit: '07:15 PM',
          isVerified: true
        }
      ],
      hotels: [
        {
          name: 'Tent City 1 Statue of Unity (Luxury River Tents)',
          slug: 'tent-city-1-sou',
          description: 'Ultra-luxury glamping resort facing Narmada dam with private pool villas.',
          address: 'Dyke 4, Sardar Sarovar Dam, Ekta Nagar, Gujarat',
          latitude: 21.8400,
          longitude: 73.7250,
          category: 'Luxury Glamping Resort',
          starRating: 5,
          pricePerNight: 12000.00,
          currency: 'INR',
          amenities: ['All-Inclusive Dining', 'Cultural Performances', 'Swimming Pool', 'Dam View'],
          isVerified: false
        },
        {
          name: 'Ramada Encore by Wyndham Statue of Unity',
          slug: 'ramada-encore-sou',
          description: 'Contemporary star hotel offering river views and modern amenities.',
          address: 'Ekta Nagar Main Road, Kevadia, Gujarat',
          latitude: 21.8300,
          longitude: 73.7150,
          category: 'Modern Hotel',
          starRating: 4,
          pricePerNight: 6500.00,
          currency: 'INR',
          amenities: ['Free Breakfast', 'Fitness Center', 'Pure Veg Dining', 'Shuttle Service'],
          isVerified: false
        }
      ],
      restaurants: [
        {
          name: 'Ekta Food Court SOU',
          slug: 'ekta-food-court',
          description: 'Massive multi-cuisine food court serving regional dishes from 28 Indian states.',
          address: 'Statue of Unity Parking Complex, Ekta Nagar, Gujarat',
          latitude: 21.8350,
          longitude: 73.7180,
          cuisineType: 'Multi-State Indian',
          priceRange: 'MODERATE',
          averageCost: 350.00,
          currency: 'INR',
          openingTime: '08:00 AM',
          closingTime: '09:00 PM',
          rating: 4.5,
          isVerified: false
        }
      ]
    },
    {
      name: 'Bhuj & Kutch',
      slug: 'bhuj',
      region: GujaratRegion.Kutch,
      category: 'Desert & Cultural Heritage',
      description: 'Cultural heart of Kutch, gateway to the endless White Rann salt desert, ancient palaces, Ajrakh block printing, and vibrant handicraft villages.',
      shortDescription: 'Gateway to the Great Rann of Kutch white salt desert, palaces, and artisan crafts.',
      tagline: 'Cultural Gateway to the White Rann Salt Desert',
      overview: 'Bhuj is the historic capital of the former Kutch State, renowned for its resilient spirit, 18th-century Prag Mahal and Aina Mahal palaces, and world-famous artisan hamlets. It serves as the primary base for exploring the Great Rann of Kutch, Dholavira Harappan metropolis, and Banni handicraft villages.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-blue-600 to-indigo-900',
      rating: 4.88,
      totalReviews: 2890,
      recommendedDays: 4,
      estimatedBudget: 22000.00,
      latitude: 23.2420,
      longitude: 69.6669,
      bestTimeToVisit: 'November to February',
      nearestAirport: 'Bhuj Airport (BHJ) — 4 km',
      nearestRailway: 'Bhuj Railway Station (BHJ) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'White Rann of Kutch',
          slug: 'white-rann-kutch',
          category: 'Natural Wonders',
          description: 'Vast white salt marsh desert famous for Rann Utsav cultural celebration.',
          openingHours: '06:00 AM - 08:00 PM',
          entryFeeInr: 100,
          averageVisitDuration: 240,
          bestTimeToVisit: 'Full Moon Sunset',
          latitude: 23.7820,
          longitude: 69.8520,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'White Rann Full Moon Sunset Experience',
          slug: 'white-rann-sunset',
          category: 'Desert Tour',
          description: 'Watch the sun dip below salt horizon followed by moonlit desert walk.',
          priceInr: 100,
          durationMinutes: 180,
          bestTimeToVisit: '05:30 PM',
          isVerified: true
        }
      ],
      hotels: [
        {
          name: 'Rann Utsav Tent City Dhordo (Glamping Resort)',
          slug: 'rann-utsav-tent-city-dhordo',
          description: 'World-famous glamping resort in the heart of White Rann with 350+ AC bhungas & tents.',
          address: 'Dhordo Village, Great Rann of Kutch, Gujarat 370510',
          latitude: 23.7780,
          longitude: 69.8450,
          category: 'Desert Glamping Resort',
          starRating: 5,
          pricePerNight: 11000.00,
          currency: 'INR',
          amenities: ['Cultural Folk Dance', 'All Meals Included', 'Golf Carts', 'Handicraft Bazaar'],
          isVerified: false
        },
        {
          name: 'Regenta Resort Bhuj',
          slug: 'regenta-resort-bhuj',
          description: 'Heritage-style resort featuring traditional Kutchi bhunga architecture.',
          address: 'Mirzapar Highway, Bhuj, Kutch, Gujarat 370001',
          latitude: 23.2450,
          longitude: 69.6550,
          category: 'Heritage Resort',
          starRating: 4,
          pricePerNight: 5200.00,
          currency: 'INR',
          amenities: ['Free WiFi', 'Swimming Pool', 'Kutchi Restaurant', 'Fitness Center'],
          isVerified: false
        }
      ],
      restaurants: [
        {
          name: 'Green Rock Restaurant Bhuj',
          slug: 'green-rock-bhuj',
          description: 'Popular downtown restaurant serving rich Kutchi Thali with Bajra Roti & White Butter.',
          address: 'Station Road, Bhuj, Kutch, Gujarat',
          latitude: 23.2430,
          longitude: 69.6670,
          cuisineType: 'Authentic Kutchi Thali',
          priceRange: 'MODERATE',
          averageCost: 350.00,
          currency: 'INR',
          openingTime: '11:30 AM',
          closingTime: '10:30 PM',
          rating: 4.8,
          isVerified: false
        }
      ]
    },
    {
      name: 'Sasan Gir Wildlife',
      slug: 'sasan-gir',
      region: GujaratRegion.Saurashtra,
      category: 'Wildlife Sanctuary',
      description: 'The world\'s only natural habitat of the endangered Asiatic Lion, boasting dense teak forests, riverine habitats, and rich wildlife safaris.',
      shortDescription: 'Sole natural habitat of Asiatic Lions featuring open-top jeep safaris.',
      tagline: 'The Exclusive Sanctuary of the Asiatic Lion',
      overview: 'Sasan Gir (Gir National Park) is the sole wildlife sanctuary in the world where the majestic Asiatic Lion roams free. Spanning over 1,412 sq km of dry deciduous forests and rocky hills, Gir is also home to leopards, hyenas, sambar deer, chousingha (four-horned antelope), and over 300 bird species.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1600&q=80',
      heroColor: 'from-emerald-700 to-green-950',
      rating: 4.85,
      totalReviews: 1980,
      recommendedDays: 2,
      estimatedBudget: 14000.00,
      latitude: 21.1243,
      longitude: 70.8242,
      bestTimeToVisit: 'December to March',
      nearestAirport: 'Keshod Airport (IXK) — 60 km',
      nearestRailway: 'Junagadh Railway Station (JND) — 55 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Gir National Park Jungle Trail',
          slug: 'gir-jungle-trail',
          category: 'Wildlife Trail',
          description: 'Protected teak forest habitat of 600+ Asiatic Lions.',
          openingHours: '06:00 AM - 12:00 PM, 03:00 PM - 06:00 PM',
          entryFeeInr: 1000,
          averageVisitDuration: 180,
          bestTimeToVisit: 'Early Morning Safari',
          latitude: 21.1243,
          longitude: 70.8242,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Morning Open-Top Jeep Jungle Safari',
          slug: 'gir-jeep-safari',
          category: 'Jeep Safari',
          description: 'Guided 3-hour open 4x4 safari with certified forest tracker.',
          priceInr: 1500,
          durationMinutes: 180,
          bestTimeToVisit: '06:00 AM',
          isVerified: true
        }
      ],
      hotels: [
        {
          name: 'Woods at Sasan (Luxury Eco Resort)',
          slug: 'woods-at-sasan',
          description: 'Sustainable luxury biophilic forest retreat bordering Gir national park.',
          address: 'Sasan Gir, Junagadh District, Gujarat 362135',
          latitude: 21.1280,
          longitude: 70.8150,
          category: 'Luxury Jungle Lodge',
          starRating: 5,
          pricePerNight: 13500.00,
          currency: 'INR',
          amenities: ['Organic Farm Dining', 'Sattvic Spa', 'Nature Trails', 'Pool'],
          isVerified: false
        },
        {
          name: 'The Fern Gir Forest Resort',
          slug: 'fern-gir-forest-resort',
          description: '5-star eco-resort nestled on the banks of Hiran river in Sasan Gir.',
          address: 'Sasan Gir, Junagadh District, Gujarat 362135',
          latitude: 21.1250,
          longitude: 70.8200,
          category: 'Jungle Resort',
          starRating: 5,
          pricePerNight: 8500.00,
          currency: 'INR',
          amenities: ['Safari Desk', 'Riverside Restaurant', 'Spa', 'Swimming Pool'],
          isVerified: false
        }
      ],
      restaurants: [
        {
          name: 'Swadesh Organic Farm Restaurant Gir',
          slug: 'swadesh-farm-gir',
          description: 'Farm-to-table Kathiyawadi wood-fire cooking inside mango orchards.',
          address: 'Sasan-Talala Road, Sasan Gir, Gujarat',
          latitude: 21.1200,
          longitude: 70.8100,
          cuisineType: 'Organic Kathiyawadi',
          priceRange: 'MODERATE',
          averageCost: 400.00,
          currency: 'INR',
          openingTime: '12:00 PM',
          closingTime: '10:00 PM',
          rating: 4.8,
          isVerified: false
        }
      ]
    }
  ];

  console.log(`[Prisma Seed] Seeding ${destinations.length} destinations with inventory...`);

  let destCount = 0;
  let attrCount = 0;
  let actCount = 0;
  let hotelCount = 0;
  let restCount = 0;

  for (const destData of destinations) {
    const { attractions, activities, hotels, restaurants, ...destFields } = destData;

    const createdDest = await prisma.destination.upsert({
      where: { slug: destFields.slug },
      update: destFields,
      create: destFields
    });
    destCount++;

    if (attractions && attractions.length > 0) {
      for (const attr of attractions) {
        await prisma.attraction.deleteMany({
          where: { destinationId: createdDest.id, name: attr.name }
        });
        await prisma.attraction.create({
          data: { ...attr, destinationId: createdDest.id }
        });
        attrCount++;
      }
    }

    if (activities && activities.length > 0) {
      for (const act of activities) {
        await prisma.activity.deleteMany({
          where: { destinationId: createdDest.id, title: act.title }
        });
        await prisma.activity.create({
          data: { ...act, destinationId: createdDest.id }
        });
        actCount++;
      }
    }

    if (hotels && hotels.length > 0) {
      for (const hotel of hotels) {
        await prisma.hotel.deleteMany({
          where: { destinationId: createdDest.id, name: hotel.name }
        });
        await prisma.hotel.create({
          data: { ...hotel, destinationId: createdDest.id }
        });
        hotelCount++;
      }
    }

    if (restaurants && restaurants.length > 0) {
      for (const rest of restaurants) {
        await prisma.restaurant.deleteMany({
          where: { destinationId: createdDest.id, name: rest.name }
        });
        await prisma.restaurant.create({
          data: { ...rest, destinationId: createdDest.id }
        });
        restCount++;
      }
    }
  }

  console.log(`[Prisma Seed] SUCCESS! Seeded ${destCount} Destinations, ${attrCount} Attractions, ${actCount} Activities, ${hotelCount} Hotels, and ${restCount} Restaurants.`);
}

main()
  .catch((e) => {
    console.error('[Prisma Seed] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
