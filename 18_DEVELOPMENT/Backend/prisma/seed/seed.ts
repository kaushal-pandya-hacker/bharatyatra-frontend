import { PrismaClient, GujaratRegion } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Prisma Seed] Starting Gujarat Destinations & Tourism Seed...');

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
        },
        {
          name: 'Rukmini Devi Temple',
          slug: 'rukmini-temple',
          category: 'Heritage Shrine',
          description: 'Intricate 12th-century stone carvings dedicated to Lord Krishna\'s chief queen Rukmini.',
          openingHours: '06:00 AM - 12:00 PM, 01:00 PM - 08:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 45,
          bestTimeToVisit: 'Afternoon',
          latitude: 22.2589,
          longitude: 68.9721,
          isVerified: true
        },
        {
          name: 'Bhadkeshwar Mahadev Temple',
          slug: 'bhadkeshwar-mahadev',
          category: 'Sea Shrine',
          description: 'Sunset sea shrine perched on a rocky ocean outcrop surrounded by Arabian Sea waters.',
          openingHours: '06:00 AM - 08:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 60,
          bestTimeToVisit: 'Sunset',
          latitude: 22.2411,
          longitude: 68.9612,
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
        },
        {
          title: 'Gomti Ghat Holy Dip & Evening Aarti',
          slug: 'gomti-ghat-aarti',
          category: 'Cultural',
          description: 'Take a holy dip in Gomti river mouth and witness river evening lamps.',
          priceInr: 0,
          durationMinutes: 60,
          bestTimeToVisit: '06:30 PM',
          isVerified: true
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
        },
        {
          name: 'Triveni Sangam',
          slug: 'triveni-sangam-somnath',
          category: 'Sacred Confluence',
          description: 'Confluence of three holy rivers (Hiran, Kapila & Saraswati) meeting the Arabian Sea.',
          openingHours: '24 Hours',
          entryFeeInr: 0,
          averageVisitDuration: 60,
          bestTimeToVisit: 'Sunrise / Sunset',
          latitude: 20.8920,
          longitude: 70.4080,
          isVerified: true
        },
        {
          name: 'Bhalka Tirth',
          slug: 'bhalka-tirth',
          category: 'Spiritual Spot',
          description: 'Sacred location where Lord Krishna was struck by a hunter\'s arrow before ascending to Vaikuntha.',
          openingHours: '06:00 AM - 09:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 45,
          bestTimeToVisit: 'Anytime',
          latitude: 20.9120,
          longitude: 70.3850,
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
        },
        {
          title: 'Triveni Sangam Boat Ride',
          slug: 'triveni-sangam-boat',
          category: 'Boating',
          description: 'Peaceful boat excursion along river confluence waters.',
          priceInr: 50,
          durationMinutes: 45,
          bestTimeToVisit: '05:00 PM',
          isVerified: true
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
        },
        {
          name: 'Adalaj Stepwell (Adalaj ni Vav)',
          slug: 'adalaj-stepwell',
          category: 'Architectural Marvel',
          description: '5-storey deep 15th-century Indo-Islamic carved stepwell displaying exquisite craftsmanship.',
          openingHours: '08:00 AM - 06:00 PM',
          entryFeeInr: 25,
          averageVisitDuration: 75,
          bestTimeToVisit: 'Morning / Afternoon',
          latitude: 23.1667,
          longitude: 72.5802,
          isVerified: true
        },
        {
          name: 'Sidi Saiyyed Mosque (Jali)',
          slug: 'sidi-saiyyed-mosque',
          category: 'Architectural Heritage',
          description: 'World-famous 16th-century stone lattice window depicting the Tree of Life.',
          openingHours: '07:00 AM - 07:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 30,
          bestTimeToVisit: 'Daytime',
          latitude: 23.0269,
          longitude: 72.5815,
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
        },
        {
          title: 'Manek Chowk Night Street Food Tasting',
          slug: 'manek-chowk-food',
          category: 'Food Tour',
          description: 'Iconic street food market in old town famous for Gwalior Dosa, Pineapple Sandwich, and Kulfi.',
          priceInr: 300,
          durationMinutes: 90,
          bestTimeToVisit: '09:00 PM',
          isVerified: true
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
        },
        {
          name: 'Valley of Flowers & Sardar Sarovar Dam Viewpoint',
          slug: 'valley-of-flowers-sou',
          category: 'Botanical Garden',
          description: 'Lush 24-acre floral park stretching along Narmada River bank near dam.',
          openingHours: '08:00 AM - 06:00 PM',
          entryFeeInr: 150,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Afternoon',
          latitude: 21.8340,
          longitude: 73.7220,
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
        },
        {
          title: 'Ekta Cruise on Narmada River',
          slug: 'ekta-river-cruise',
          category: 'Cruising',
          description: '6-kilometer luxury river boat ride with panoramic views of Statue of Unity.',
          priceInr: 400,
          durationMinutes: 60,
          bestTimeToVisit: '05:00 PM',
          isVerified: true
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
        },
        {
          name: 'Prag Mahal & Aina Mahal',
          slug: 'prag-mahal-aina-mahal',
          category: 'Royal Palace',
          description: '18th-century Venetian Gothic clock tower palace and mirror hall museum.',
          openingHours: '09:00 AM - 12:00 PM, 03:00 PM - 06:00 PM',
          entryFeeInr: 40,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Morning',
          latitude: 23.2541,
          longitude: 69.6685,
          isVerified: true
        },
        {
          name: 'Kala Dungar (Black Hill)',
          slug: 'kala-dungar',
          category: 'Panoramic Viewpoint',
          description: 'Highest peak in Kutch (460m) offering 360-degree views of Rann salt flats.',
          openingHours: '06:00 AM - 07:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Sunset',
          latitude: 23.9167,
          longitude: 69.8333,
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
        },
        {
          title: 'Bhujodi Village Weaving & Handicraft Workshop',
          slug: 'bhujodi-craft-tour',
          category: 'Craft Workshop',
          description: 'Interact with master weavers and Ajrakh block printers in artisan hamlet.',
          priceInr: 0,
          durationMinutes: 120,
          bestTimeToVisit: '10:00 AM',
          isVerified: true
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
        },
        {
          name: 'Devalia Safari Park (Gir Interpretation Zone)',
          slug: 'devalia-safari-park',
          category: 'Fenced Wildlife Zone',
          description: 'Fenced interpretation zone providing guaranteed wildlife sighting bus tours.',
          openingHours: '08:00 AM - 11:00 AM, 03:00 PM - 05:00 PM',
          entryFeeInr: 200,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Morning',
          latitude: 21.1500,
          longitude: 70.7500,
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
      ]
    },
    {
      name: 'Saputara Hill Station',
      slug: 'saputara',
      region: GujaratRegion.South_Gujarat,
      category: 'Hill Station',
      description: 'Nestled in the Sahyadri mountains surrounded by lush forests, waterfalls, ropeways, and tribal heritage in Dang district.',
      shortDescription: 'Gujarat\'s sole hill resort located at 1,000m altitude in Dang forest.',
      tagline: 'Gujarat\'s Only Hill Station in the Western Ghats',
      overview: 'Saputara is a picturesque hill resort situated at an altitude of 1,000 meters in the Dang district of southern Gujarat. Known for mist-covered hills, Saputara Lake boating, Sunset Point, Gira Waterfalls, and rich tribal heritage of the Dang community.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80',
      heroColor: 'from-emerald-600 to-teal-900',
      rating: 4.78,
      totalReviews: 1650,
      recommendedDays: 2,
      estimatedBudget: 11000.00,
      latitude: 20.5755,
      longitude: 73.7486,
      bestTimeToVisit: 'July to March',
      nearestAirport: 'Surat Airport (STV) — 160 km',
      nearestRailway: 'Bilimora Junction — 110 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Saputara Lake & Boating Club',
          slug: 'saputara-lake',
          category: 'Natural Lake',
          description: 'Picturesque hill lake offering row boating and pedal boating surrounded by gardens.',
          openingHours: '09:00 AM - 07:00 PM',
          entryFeeInr: 100,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Late Afternoon',
          latitude: 20.5755,
          longitude: 73.7486,
          isVerified: true
        },
        {
          name: 'Pushpak Ropeway & Sunset Point',
          slug: 'pushpak-ropeway',
          category: 'Cable Car Viewpoint',
          description: 'Cable car ride ascending to Governor\'s Hill for panoramic sunset views over Sahyadri ranges.',
          openingHours: '09:00 AM - 07:00 PM',
          entryFeeInr: 70,
          averageVisitDuration: 60,
          bestTimeToVisit: 'Sunset',
          latitude: 20.5790,
          longitude: 73.7510,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Saputara Lake Pedal Boating',
          slug: 'saputara-pedal-boating',
          category: 'Boating',
          description: '45-minute pedal boating ride across mountain lake waters.',
          priceInr: 100,
          durationMinutes: 60,
          bestTimeToVisit: '04:30 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Vadodara',
      slug: 'vadodara',
      region: GujaratRegion.Central_Gujarat,
      category: 'Royal Cultural City',
      description: 'The cultural capital of Gujarat, famous for the palatial Laxmi Vilas Palace, Sayaji Baug, and grand Navratri Garba celebrations.',
      shortDescription: 'Cultural capital of Gujarat famous for Laxmi Vilas Palace and Gaekwad heritage.',
      tagline: 'The Cultural Capital of Gujarat & Gaekwad Heritage',
      overview: 'Vadodara (Baroda) is the cultural capital of Gujarat, shaped by the vision of Maharaja Sayajirao Gaekwad III. Home to Laxmi Vilas Palace (four times larger than Buckingham Palace), Baroda Museum, and MS University.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-700 to-yellow-950',
      rating: 4.82,
      totalReviews: 2100,
      recommendedDays: 2,
      estimatedBudget: 13000.00,
      latitude: 22.3072,
      longitude: 73.1812,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Vadodara Airport (BDQ) — 6 km',
      nearestRailway: 'Vadodara Junction (BRC) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Laxmi Vilas Palace',
          slug: 'laxmi-vilas-palace',
          category: 'Royal Palace',
          description: 'Extravagant 1890 Indo-Saracenic palace four times larger than Buckingham Palace.',
          openingHours: '09:30 AM - 05:00 PM (Closed Mondays)',
          entryFeeInr: 250,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Morning',
          latitude: 22.2936,
          longitude: 73.1917,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Laxmi Vilas Palace Audio-Guided Heritage Tour',
          slug: 'laxmi-vilas-audio-tour',
          category: 'Heritage Tour',
          description: 'Explore royal Durbar Hall, Armoury, and Italianate gardens with official headset guide.',
          priceInr: 250,
          durationMinutes: 120,
          bestTimeToVisit: '10:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Junagadh',
      slug: 'junagadh',
      region: GujaratRegion.Saurashtra,
      category: 'Historical & Mountain Pilgrimage',
      description: 'Ancient city situated at the foot of sacred Mount Girnar, featuring Uparkot Fort, Mahabat Maqbara, and Ashokan Rock Edicts.',
      shortDescription: 'Ancient city at Mount Girnar foot featuring Uparkot Fort and Mahabat Maqbara.',
      tagline: 'City of Ancient Forts & Sacred Mount Girnar',
      overview: 'Junagadh is a historic city nestled at the base of Mount Girnar. It boasts 2,300-year-old Uparkot Fort, Ashoka\'s 3rd-century BC rock edicts, the stunning Gothic-Islamic Mahabat Maqbara mausoleum, and Girnar Ropeway.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-stone-700 to-neutral-900',
      rating: 4.80,
      totalReviews: 1840,
      recommendedDays: 2,
      estimatedBudget: 11000.00,
      latitude: 21.5222,
      longitude: 70.4579,
      bestTimeToVisit: 'November to February',
      nearestAirport: 'Keshod Airport (IXK) — 40 km',
      nearestRailway: 'Junagadh Junction (JND) — 1 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Uparkot Fort',
          slug: 'uparkot-fort',
          category: 'Ancient Citadel',
          description: '2,300-year-old fort featuring Buddhist caves, Adi Kadi Vav stepwell, and massive cannons.',
          openingHours: '08:00 AM - 06:00 PM',
          entryFeeInr: 50,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Morning',
          latitude: 21.5255,
          longitude: 70.4650,
          isVerified: true
        },
        {
          name: 'Mahabat Maqbara',
          slug: 'mahabat-maqbara',
          category: 'Mausoleum',
          description: 'Awe-inspiring 19th-century royal tomb with spiral minarets blending Indo-Islamic and Gothic styles.',
          openingHours: '24 Hours (Exterior)',
          entryFeeInr: 0,
          averageVisitDuration: 45,
          bestTimeToVisit: 'Afternoon',
          latitude: 21.5200,
          longitude: 70.4560,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Girnar Ropeway Ride to Ambaji Temple',
          slug: 'girnar-ropeway-ride',
          category: 'Ropeway',
          description: 'Asia\'s longest ropeway ascending 2.3km up sacred Mount Girnar.',
          priceInr: 700,
          durationMinutes: 90,
          bestTimeToVisit: '07:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Diu',
      slug: 'diu',
      region: GujaratRegion.Saurashtra,
      category: 'Coastal Island & Fort',
      description: 'Former Portuguese island colony featuring 16th-century sea forts, pristine beaches, St. Paul\'s Church, and relaxed coastal vibes.',
      shortDescription: 'Scenic Portuguese coastal island featuring Diu Fort, Naida Caves, and sea beaches.',
      tagline: 'Coastal Island Resort & Portuguese Fort Fortress',
      overview: 'Diu is a serene island off the southern coast of Kathiawar. Ruled by the Portuguese for over 400 years until 1961, Diu offers tranquil beaches like Ghoghla and Nagoa, historic sea fortresses, and Naida Caves.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
      heroColor: 'from-blue-600 to-sky-900',
      rating: 4.86,
      totalReviews: 2400,
      recommendedDays: 2,
      estimatedBudget: 14000.00,
      latitude: 20.7144,
      longitude: 70.9874,
      bestTimeToVisit: 'October to April',
      nearestAirport: 'Diu Airport (DIU) — 5 km',
      nearestRailway: 'Veraval Junction (VRL) — 90 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Diu Fort',
          slug: 'diu-fort',
          category: 'Sea Fort',
          description: '16th-century Portuguese coastal fortress surrounded by sea on three sides.',
          openingHours: '08:00 AM - 06:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Afternoon',
          latitude: 20.7144,
          longitude: 70.9874,
          isVerified: true
        },
        {
          name: 'Naida Caves',
          slug: 'naida-caves',
          category: 'Geological Wonder',
          description: 'Labyrinthine rock caves with sunlight filtering through natural openings.',
          openingHours: '08:00 AM - 05:30 PM',
          entryFeeInr: 0,
          averageVisitDuration: 60,
          bestTimeToVisit: 'Midday',
          latitude: 20.7100,
          longitude: 70.9800,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Nagoa Beach Water Sports',
          slug: 'nagoa-beach-water-sports',
          category: 'Water Sports',
          description: 'Parasailing, jet-skiing, and banana boat rides on horseshoe-shaped Nagoa beach.',
          priceInr: 500,
          durationMinutes: 120,
          bestTimeToVisit: '03:00 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Champaner-Pavagadh',
      slug: 'champaner',
      region: GujaratRegion.Central_Gujarat,
      category: 'UNESCO World Heritage',
      description: 'UNESCO World Heritage Site combining pre-Mughal Islamic architecture, Pavagadh hill fortress, and Kalika Mata temple.',
      shortDescription: 'UNESCO World Heritage city with ancient mosques and Pavagadh hill shrine.',
      tagline: 'UNESCO World Heritage Sacred Hill & Citadel',
      overview: 'Champaner-Pavagadh is an extraordinary archaeological park featuring untouched 15th-century Indo-Islamic architecture, Jama Masjid, Kevada Masjid, and the sacred Kalika Mata temple atop Pavagadh Hill.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-800 to-stone-900',
      rating: 4.84,
      totalReviews: 1720,
      recommendedDays: 2,
      estimatedBudget: 10000.00,
      latitude: 22.4862,
      longitude: 73.5312,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Vadodara Airport (BDQ) — 45 km',
      nearestRailway: 'Champaner Road Station — 15 km / Vadodara — 45 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Jama Masjid Champaner',
          slug: 'jama-masjid-champaner',
          category: 'Islamic Architecture',
          description: 'Magnificent 15th-century mosque featuring 172 pillars and 30-meter high minarets.',
          openingHours: '08:00 AM - 06:00 PM',
          entryFeeInr: 25,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Morning',
          latitude: 22.4862,
          longitude: 73.5312,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Pavagadh Ropeway to Kalika Mata Temple',
          slug: 'pavagadh-ropeway',
          category: 'Ropeway',
          description: 'Cable car ascent up Pavagadh hill to 800-meter high Shakti Peeth shrine.',
          priceInr: 170,
          durationMinutes: 90,
          bestTimeToVisit: '08:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Patan',
      slug: 'patan',
      region: GujaratRegion.North_Gujarat,
      category: 'UNESCO World Heritage',
      description: 'Home to the magnificent UNESCO World Heritage Rani Ki Vav stepwell and world-famous double-ikat Patola silk weavers.',
      shortDescription: 'Famed for UNESCO Rani Ki Vav stepwell and double-ikat Patola weaving.',
      tagline: 'UNESCO Rani Ki Vav Stepwell & Double-Ikat Patola Silk',
      overview: 'Patan was the medieval capital of Solanki kings. It is celebrated worldwide for Rani Ki Vav (11th-century queen\'s stepwell designed as an inverted temple with 500+ major sculptures) and Salvi family\'s double-ikat Patola weaving.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-700 to-orange-950',
      rating: 4.89,
      totalReviews: 2310,
      recommendedDays: 1,
      estimatedBudget: 8000.00,
      latitude: 23.8493,
      longitude: 72.1266,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Ahmedabad International Airport (AMD) — 125 km',
      nearestRailway: 'Patan Railway Station (PTN) — 3 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Rani Ki Vav (Queen\'s Stepwell)',
          slug: 'rani-ki-vav',
          category: 'UNESCO Heritage Stepwell',
          description: '7-storey deep 11th-century subterranean stepwell featuring 500+ intricate Lord Vishnu sculptures.',
          openingHours: '08:00 AM - 06:00 PM',
          entryFeeInr: 40,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Morning',
          latitude: 23.8589,
          longitude: 72.1018,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Patan Patola Silk Weaving Heritage Tour',
          slug: 'patola-weaving-tour',
          category: 'Heritage Craft',
          description: 'Live demonstration of 900-year-old double-ikat silk weaving process at Patola House.',
          priceInr: 0,
          durationMinutes: 60,
          bestTimeToVisit: '11:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Modhera',
      slug: 'modhera',
      region: GujaratRegion.North_Gujarat,
      category: 'Solar Temple Heritage',
      description: 'Famous for the breathtaking 11th-century Sun Temple built by King Bhimdev I along the Pushpavati river.',
      shortDescription: '11th-century Sun Temple masterpiece featuring Surya Kund water tank.',
      tagline: 'The 11th-Century Solar Temple Masterpiece',
      overview: 'Modhera is home to Gujarat\'s most magnificent Sun Temple, built in 1026 AD during Solanki rule. Designed so that the first rays of the equinox sun illuminate the inner sanctum, it features Surya Kund with 108 miniature shrines.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-orange-600 to-amber-900',
      rating: 4.88,
      totalReviews: 1950,
      recommendedDays: 1,
      estimatedBudget: 7000.00,
      latitude: 23.5835,
      longitude: 72.1331,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Ahmedabad Airport (AMD) — 100 km',
      nearestRailway: 'Mehsana Junction — 25 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Modhera Sun Temple & Surya Kund',
          slug: 'modhera-sun-temple',
          category: 'Solanki Architecture',
          description: '11th-century temple complex dedicated to Sun God Surya with 108 carved water tank shrines.',
          openingHours: '07:00 AM - 06:00 PM',
          entryFeeInr: 25,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Sunrise',
          latitude: 23.5835,
          longitude: 72.1331,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Modhera 3D Heritage Light & Sound Show',
          slug: 'modhera-light-show',
          category: 'Laser Show',
          description: 'Night 3D projection mapping on Sun Temple facade powered by 100% solar energy.',
          priceInr: 20,
          durationMinutes: 45,
          bestTimeToVisit: '07:00 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Gandhinagar',
      slug: 'gandhinagar',
      region: GujaratRegion.North_Gujarat,
      category: 'Capital & Spiritual Complex',
      description: 'Capital city of Gujarat, known as India\'s greenest city, featuring Akshardham Temple complex and Mahatma Mandir.',
      shortDescription: 'Gujarat\'s green capital city featuring Akshardham Temple and Indroda Nature Park.',
      tagline: 'Green Capital City & Akshardham Cultural Complex',
      overview: 'Gandhinagar, planned along the banks of Sabarmati River, is Gujarat\'s capital. Known for sprawling green tree cover, the grand pink sandstone Akshardham Temple, Indroda Dinosaur & Fossil Park, and Sarita Udyan.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-emerald-700 to-green-950',
      rating: 4.79,
      totalReviews: 1890,
      recommendedDays: 1,
      estimatedBudget: 9000.00,
      latitude: 23.2156,
      longitude: 72.6369,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Ahmedabad Airport (AMD) — 18 km',
      nearestRailway: 'Gandhinagar Capital (GNC) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Akshardham Temple Gandhinagar',
          slug: 'akshardham-gandhinagar',
          category: 'Cultural Temple Complex',
          description: '23-acre pink sandstone monument featuring Sat-Chit-Anand water show and exhibitions.',
          openingHours: '09:30 AM - 07:30 PM (Closed Mondays)',
          entryFeeInr: 0,
          averageVisitDuration: 180,
          bestTimeToVisit: 'Afternoon / Evening',
          latitude: 23.2294,
          longitude: 72.6742,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Akshardham Sat-Chit-Anand Musical Water Show',
          slug: 'akshardham-water-show',
          category: 'Laser & Fountain Show',
          description: 'Multi-media water fountain and laser show illustrating Upanishadic parable.',
          priceInr: 100,
          durationMinutes: 45,
          bestTimeToVisit: '07:00 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Porbandar',
      slug: 'porbandar',
      region: GujaratRegion.Saurashtra,
      category: 'Coastal Freedom Heritage',
      description: 'Birthplace of Mahatma Gandhi, historic coastal port featuring Kirti Mandir, Chowpatty beach, and Sudama Temple.',
      shortDescription: 'Coastal birthplace of Mahatma Gandhi featuring Kirti Mandir and Chowpatty beach.',
      tagline: 'Coastal Birthplace of Mahatma Gandhi',
      overview: 'Porbandar is an ancient port city on the Arabian Sea coast of Saurashtra, world-renowned as the birthplace of Mahatma Gandhi (1869). It features Kirti Mandir memorial, 3-storey ancestral Gandhi home, and Sudama Temple.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
      heroColor: 'from-amber-600 to-sky-900',
      rating: 4.77,
      totalReviews: 1420,
      recommendedDays: 1,
      estimatedBudget: 8500.00,
      latitude: 21.6417,
      longitude: 69.6293,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Porbandar Airport (PBD) — 5 km',
      nearestRailway: 'Porbandar Railway Station (PBR) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Kirti Mandir (Gandhi Birthplace)',
          slug: 'kirti-mandir',
          category: 'Freedom Heritage',
          description: 'Memorial temple built adjacent to the 3-storey ancestral home where Mahatma Gandhi was born.',
          openingHours: '07:30 AM - 07:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 75,
          bestTimeToVisit: 'Morning',
          latitude: 21.6417,
          longitude: 69.6293,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Porbandar Chowpatty Beach Evening Sunset Walk',
          slug: 'porbandar-beach-walk',
          category: 'Coastal Walk',
          description: 'Relaxed sunset walk along pristine Arabian Sea beach promenade.',
          priceInr: 0,
          durationMinutes: 60,
          bestTimeToVisit: '05:30 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Palitana',
      slug: 'palitana',
      region: GujaratRegion.Saurashtra,
      category: 'Sacred Mountain Pilgrimage',
      description: 'World\'s premier Jain pilgrimage destination featuring over 863 marble temples crowning Shatrunjaya Hill.',
      shortDescription: 'World\'s greatest Jain temple complex featuring 863 marble shrines atop Shatrunjaya Hill.',
      tagline: 'World\'s Premier Mountain of 863 Marble Temples',
      overview: 'Palitana is the holiest pilgrimage destination in Jainism. Located on Shatrunjaya Hill, it features 863 meticulously carved white marble temples constructed over 900 years, requiring a 3,500-step ascent to Adishwar Temple.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-600 to-yellow-950',
      rating: 4.92,
      totalReviews: 2650,
      recommendedDays: 2,
      estimatedBudget: 10000.00,
      latitude: 21.5244,
      longitude: 71.8624,
      bestTimeToVisit: 'November to February',
      nearestAirport: 'Bhavnagar Airport (BHU) — 50 km',
      nearestRailway: 'Palitana Railway Station (PIT) — 4 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Shatrunjaya Hill Temples (Adishwar Temple)',
          slug: 'shatrunjaya-hill-temples',
          category: 'Jain Temple Complex',
          description: 'Complex of 863 marble Jain temples atop hill dedicated to Lord Rishabhanatha.',
          openingHours: '06:00 AM - 06:00 PM (No night stay permitted)',
          entryFeeInr: 0,
          averageVisitDuration: 240,
          bestTimeToVisit: 'Early Morning Climb',
          latitude: 21.5244,
          longitude: 71.8624,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Shatrunjaya Hill 3,500-Step Morning Climb',
          slug: 'shatrunjaya-hill-climb',
          category: 'Trekking',
          description: 'Early morning pilgrimage climb up 3,500 stone steps with stunning panoramic views.',
          priceInr: 0,
          durationMinutes: 240,
          bestTimeToVisit: '05:30 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Bhavnagar',
      slug: 'bhavnagar',
      region: GujaratRegion.Saurashtra,
      category: 'Royal Heritage & Wildlife',
      description: 'Historic royal maritime capital, gateway to Velavadar Blackbuck National Park and Nishkalank Mahadev ocean shrine.',
      shortDescription: 'Royal maritime city gateway to Velavadar Blackbuck National Park.',
      tagline: 'Royal Maritime Heritage & Blackbuck Sanctuary',
      overview: 'Bhavnagar is a historic princely port city founded in 1723. It serves as base for Velavadar Blackbuck National Park, Takhteshwar Temple on hillock, and Koliyak Nishkalank Mahadev ocean temple.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-700 to-stone-900',
      rating: 4.76,
      totalReviews: 1350,
      recommendedDays: 2,
      estimatedBudget: 11500.00,
      latitude: 21.7645,
      longitude: 72.1519,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Bhavnagar Airport (BHU) — 5 km',
      nearestRailway: 'Bhavnagar Terminus (BVC) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Velavadar Blackbuck National Park',
          slug: 'velavadar-blackbuck-park',
          category: 'Savannah Wildlife Sanctuary',
          description: 'Open grassland park famous for thousands of galloping blackbucks and striped hyenas.',
          openingHours: '06:00 AM - 12:00 PM, 03:00 PM - 06:00 PM',
          entryFeeInr: 500,
          averageVisitDuration: 180,
          bestTimeToVisit: 'Early Morning',
          latitude: 21.9333,
          longitude: 72.0333,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Velavadar Open Grassland Wildlife Safari',
          slug: 'velavadar-safari',
          category: 'Wildlife Safari',
          description: 'Open jeep safari across flat savannah grassland tracking blackbuck herds.',
          priceInr: 1000,
          durationMinutes: 180,
          bestTimeToVisit: '06:30 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Jamnagar',
      slug: 'jamnagar',
      region: GujaratRegion.Saurashtra,
      category: 'Jewel of Kathiawar',
      description: 'Known as the Jewel of Kathiawar, famous for Lakhota Fort in lake, Marine National Park coral reefs, and brass industry.',
      shortDescription: 'Jewel of Kathiawar featuring Lakhota Lake Palace and Marine National Park.',
      tagline: 'Jewel of Kathiawar & Marine Sanctuary',
      overview: 'Jamnagar was founded by Jam Rawal in 1540 AD. Perched on the Gulf of Kutch, it is famous for Lakhota Fort island museum, Bala Hanuman Temple (continuous Ram Dhun chanting since 1964), and Narara Marine National Park.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-600 to-indigo-900',
      rating: 4.81,
      totalReviews: 1780,
      recommendedDays: 2,
      estimatedBudget: 12000.00,
      latitude: 22.4707,
      longitude: 70.0577,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Jamnagar Airport (JGA) — 8 km',
      nearestRailway: 'Jamnagar Railway Station (JAM) — 3 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Lakhota Palace & Museum (Lakhota Lake)',
          slug: 'lakhota-palace-lake',
          category: 'Island Fort Museum',
          description: '19th-century royal palace island in Lakhota Lake housing medieval weapons and pottery.',
          openingHours: '10:30 AM - 02:00 PM, 03:30 PM - 07:30 PM (Closed Wednesdays)',
          entryFeeInr: 20,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Evening',
          latitude: 22.4707,
          longitude: 70.0577,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Narara Reef Low-Tide Marine Coral Walk',
          slug: 'narara-marine-walk',
          category: 'Marine Trekking',
          description: 'Walk on ocean floor during low tide to spot wild corals, octopus, puffers, and crabs.',
          priceInr: 100,
          durationMinutes: 180,
          bestTimeToVisit: 'Low Tide Hours',
          isVerified: true
        }
      ]
    },
    {
      name: 'Gondal',
      slug: 'gondal',
      region: GujaratRegion.Saurashtra,
      category: 'Royal Heritage & Vintage Cars',
      description: 'Heritage princely state famous for Naulakha Palace, Orchard Palace, and private collection of royal vintage cars.',
      shortDescription: 'Heritage royal town famous for Naulakha Palace and Vintage Car collection.',
      tagline: 'Royal Palaces & World-Class Vintage Car Collection',
      overview: 'Gondal was an enlightened princely state ruled by the progressive Jadejas. It features 17th-century Naulakha Palace along Gondali river and the Royal Vintage Car Museum holding Cadillac, Rolls-Royce, and Packard automobiles.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-700 to-yellow-950',
      rating: 4.80,
      totalReviews: 1210,
      recommendedDays: 1,
      estimatedBudget: 9000.00,
      latitude: 21.9619,
      longitude: 70.7923,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Rajkot International Airport (HSR) — 40 km',
      nearestRailway: 'Gondal Railway Station (GDL) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Naulakha Palace & Royal Vintage Car Museum',
          slug: 'naulakha-palace-gondal',
          category: 'Royal Palace & Car Museum',
          description: '17th-century palace complex with carved stone balconies and private royal vintage automobile garage.',
          openingHours: '09:00 AM - 01:00 PM, 03:00 PM - 06:00 PM',
          entryFeeInr: 300,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Morning',
          latitude: 21.9619,
          longitude: 70.7923,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Royal Vintage Car Collection Guided Tour',
          slug: 'gondal-vintage-car-tour',
          category: 'Museum Tour',
          description: 'Explore 30+ mint-condition royal vintage cars including 1935 Packard and 1955 Cadillac.',
          priceInr: 300,
          durationMinutes: 60,
          bestTimeToVisit: '10:30 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Mandvi',
      slug: 'mandvi',
      region: GujaratRegion.Kutch,
      category: 'Royal Beach & Shipbuilding',
      description: 'Historic port town featuring Vijay Vilas Palace, 400-year-old wooden shipbuilding yards, and Windfarm Beach.',
      shortDescription: 'Coastal Kutch destination famous for Vijay Vilas Palace and wooden shipbuilding yards.',
      tagline: 'Royal Palace Beach Resort & Traditional Shipbuilding Yard',
      overview: 'Mandvi was established in 1580 as a major seaport. It features the grand Vijay Vilas Palace (setting for Bollywood movies), pristine Windfarm beach, and 400-year-old manual wooden dhow shipbuilding yards on Rukmavati river.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
      heroColor: 'from-amber-600 to-sky-900',
      rating: 4.85,
      totalReviews: 2150,
      recommendedDays: 2,
      estimatedBudget: 13000.00,
      latitude: 22.8328,
      longitude: 69.3524,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Bhuj Airport (BHJ) — 60 km',
      nearestRailway: 'Bhuj Railway Station (BHJ) — 60 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Vijay Vilas Palace & Private Beach',
          slug: 'vijay-vilas-palace',
          category: 'Royal Palace',
          description: '1929 Rajput royal summer palace set in 450-acre estate with private sea beach.',
          openingHours: '09:00 AM - 01:00 PM, 03:00 PM - 06:00 PM',
          entryFeeInr: 70,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Afternoon',
          latitude: 22.8328,
          longitude: 69.3524,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Mandvi Rukmavati River Shipbuilding Yard Walk',
          slug: 'mandvi-shipbuilding-walk',
          category: 'Heritage Craft',
          description: 'Observe master artisans constructing giant wooden ocean cargo ships by hand.',
          priceInr: 0,
          durationMinutes: 60,
          bestTimeToVisit: '10:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Dholavira',
      slug: 'dholavira',
      region: GujaratRegion.Kutch,
      category: 'UNESCO Harappan Metropolis',
      description: 'UNESCO World Heritage 4,500-year-old Indus Valley Civilization city featuring world\'s earliest water reservoirs.',
      shortDescription: '4,500-year-old UNESCO Harappan metropolis on Khadir Bet in the Rann of Kutch.',
      tagline: '4,500-Year-Old UNESCO Harappan Metropolis',
      overview: 'Dholavira is one of the five largest Harappan metropolises of the Indus Valley Civilization. Located on Khadir Bet island in the Great Rann of Kutch, Dholavira displays sophisticated 3000 BC urban planning, stone fort citadel, underground drains, and giant rock-cut reservoirs.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600&q=80',
      heroColor: 'from-amber-800 to-stone-900',
      rating: 4.91,
      totalReviews: 1540,
      recommendedDays: 2,
      estimatedBudget: 15000.00,
      latitude: 23.8864,
      longitude: 70.2178,
      bestTimeToVisit: 'November to February',
      nearestAirport: 'Bhuj Airport (BHJ) — 210 km',
      nearestRailway: 'Bhuj Railway Station (BHJ) — 210 km / Samakhiali — 135 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Dholavira Archaeological Site & Citadel',
          slug: 'dholavira-archaeological-site',
          category: 'Harappan Excavation',
          description: 'Excavated 3rd millennium BC Harappan city showing citadel, stadium, and stone reservoirs.',
          openingHours: '06:00 AM - 06:00 PM',
          entryFeeInr: 25,
          averageVisitDuration: 180,
          bestTimeToVisit: 'Morning',
          latitude: 23.8864,
          longitude: 70.2178,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Road to Heaven Scenic Drive across Salt Rann',
          slug: 'road-to-heaven-drive',
          category: 'Scenic Drive',
          description: 'Drive along 30-km straight highway cutting through white salt waters of Great Rann of Kutch.',
          priceInr: 0,
          durationMinutes: 45,
          bestTimeToVisit: '04:00 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Ambaji',
      slug: 'ambaji',
      region: GujaratRegion.North_Gujarat,
      category: 'Sacred Shakti Peeth',
      description: 'Major Shakti Peeth pilgrimage shrine located on Gabbar Hill in the Aravalli mountain range.',
      shortDescription: 'Revered Shakti Peeth pilgrimage center on Gabbar Hill in Aravalli range.',
      tagline: 'Sacred Shakti Peeth Shrine in the Aravalli Hills',
      overview: 'Ambaji is one of the 51 sacred Shakti Peeths where the heart of Goddess Sati fell. Situated in Banaskantha district near Rajasthan border, the temple contains no idol but worships the sacred Visra Yantra.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=1600&q=80',
      heroColor: 'from-orange-600 to-red-950',
      rating: 4.88,
      totalReviews: 2900,
      recommendedDays: 2,
      estimatedBudget: 9500.00,
      latitude: 24.3314,
      longitude: 72.8466,
      bestTimeToVisit: 'September to March (Bhadarvi Poonam fair)',
      nearestAirport: 'Ahmedabad International Airport (AMD) — 180 km',
      nearestRailway: 'Abu Road Railway Station (ABR) — 20 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Ambaji Main Temple & Visra Yantra',
          slug: 'ambaji-main-temple',
          category: 'Shakti Peeth Shrine',
          description: 'Holy shrine housing gold-plated Visra Yantra visited by millions during Bhadarvi Poonam.',
          openingHours: '07:00 AM - 11:30 AM, 12:30 PM - 04:30 PM, 06:30 PM - 09:00 PM',
          entryFeeInr: 0,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Morning Aarti',
          latitude: 24.3314,
          longitude: 72.8466,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Gabbar Hill Ropeway Pilgrimage Ascent',
          slug: 'gabbar-hill-ropeway',
          category: 'Ropeway',
          description: 'Cable car ride up Gabbar Hill to the original spot where Goddess Sati\'s heart descended.',
          priceInr: 120,
          durationMinutes: 60,
          bestTimeToVisit: '08:00 AM',
          isVerified: true
        }
      ]
    }
  ];

  console.log(`[Prisma Seed] Seeding ${destinations.length} Gujarat destinations...`);

  let destCount = 0;
  let attrCount = 0;
  let actCount = 0;

  for (const destData of destinations) {
    const { attractions, activities, ...destFields } = destData;

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
          data: {
            ...attr,
            destinationId: createdDest.id
          }
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
          data: {
            ...act,
            destinationId: createdDest.id
          }
        });
        actCount++;
      }
    }
  }

  console.log(`[Prisma Seed] SUCCESS! Seeded ${destCount} Destinations, ${attrCount} Attractions, and ${actCount} Activities.`);
}

main()
  .catch((e) => {
    console.error('[Prisma Seed] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
