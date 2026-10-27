import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { TourismImportPipeline } from '../../src/scripts/tourism_import_pipeline';

const prisma = new PrismaClient();

async function main() {
  console.log('[Prisma Seed] Starting Pan-India & Gujarat Tourism Master Data Seeding...');

  // 1. Ingest Master India Dataset (28 States, 8 UTs, Districts, Cities, Destinations)
  const masterJsonPath = path.resolve(__dirname, '../../../../08_TRAVEL_DATA/India/india_master_data.json');
  if (require('fs').existsSync(masterJsonPath)) {
    console.log(`[Prisma Seed] Importing Pan-India Master Dataset from ${masterJsonPath}...`);
    const pipeline = new TourismImportPipeline();
    const importStats = await pipeline.importFromMasterJson(masterJsonPath);
    console.log(`[Prisma Seed] Master Import Complete: ${importStats.statesImported} States/UTs, ${importStats.districtsImported} Districts, ${importStats.citiesImported} Cities, ${importStats.destinationsImported} Master Destinations.`);
  }

  const destinations = [
    {
      name: 'Dwarka',
      slug: 'dwarka',
      region: 'Saurashtra',
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
      region: 'Saurashtra',
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
      region: 'Central_Gujarat',
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
      region: 'Central_Gujarat',
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
      region: 'Kutch',
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
      region: 'Saurashtra',
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
      region: 'South_Gujarat',
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
      region: 'Central_Gujarat',
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
      region: 'Saurashtra',
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
      region: 'Saurashtra',
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
      region: 'Central_Gujarat',
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
      region: 'North_Gujarat',
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
      region: 'North_Gujarat',
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
      region: 'North_Gujarat',
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
      region: 'Saurashtra',
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
      region: 'Saurashtra',
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
      region: 'Saurashtra',
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
      region: 'Saurashtra',
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
      region: 'Saurashtra',
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
      region: 'Kutch',
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
      region: 'Kutch',
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
      region: 'North_Gujarat',
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
    },
    {
      name: 'Jaipur',
      slug: 'jaipur',
      region: 'North India',
      state: 'Rajasthan',
      country: 'India',
      category: 'Royal Heritage & Forts',
      description: 'The iconic Pink City of India, capital of Rajasthan, famous for Amber Fort, Hawa Mahal, City Palace, and vibrant bazaars.',
      shortDescription: 'The Pink City of Rajasthan featuring Amber Fort, Hawa Mahal, and royal palaces.',
      tagline: 'The Regal Pink City of Royalty and Grandeur',
      overview: 'Jaipur is Rajasthan\'s regal capital forming part of India\'s famed Golden Triangle. Known for pink terracotta buildings, majestic hilltop forts, opulent royal palaces, and rich textile handicrafts.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600&q=80',
      heroColor: 'from-pink-600 to-rose-900',
      rating: 4.88,
      totalReviews: 4850,
      recommendedDays: 3,
      estimatedBudget: 18000.00,
      latitude: 26.9124,
      longitude: 75.7873,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Jaipur International Airport (JAI) — 12 km',
      nearestRailway: 'Jaipur Junction (JP) — 3 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Amber Fort & Palace',
          slug: 'amber-fort',
          category: 'Hilltop Fortress',
          description: 'Majestic 16th-century red sandstone and marble fort overlooking Maota Lake.',
          openingHours: '08:00 AM - 05:30 PM',
          entryFeeInr: 100,
          averageVisitDuration: 180,
          bestTimeToVisit: 'Morning',
          latitude: 26.9855,
          longitude: 75.8513,
          isVerified: true
        },
        {
          name: 'Hawa Mahal (Palace of Winds)',
          slug: 'hawa-mahal',
          category: 'Royal Architecture',
          description: '5-storey honeycomb pink facade built in 1799 with 953 intricate jharokha windows.',
          openingHours: '09:00 AM - 05:00 PM',
          entryFeeInr: 50,
          averageVisitDuration: 60,
          bestTimeToVisit: 'Early Morning',
          latitude: 26.9239,
          longitude: 75.8267,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Hot Air Balloon Ride over Amber Fort',
          slug: 'jaipur-hot-air-balloon',
          category: 'Adventure',
          description: 'Soar high above Jaipur\'s royal palaces and Aravalli hills at sunrise.',
          priceInr: 12500,
          durationMinutes: 60,
          bestTimeToVisit: '06:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Udaipur',
      slug: 'udaipur',
      region: 'North India',
      state: 'Rajasthan',
      country: 'India',
      category: 'Lakes & Palaces',
      description: 'The City of Lakes, romantic royal destination surrounded by Lake Pichola, City Palace, and Aravalli hills.',
      shortDescription: 'Venice of the East known for Lake Pichola, City Palace, and romantic sunsets.',
      tagline: 'The Romantic City of Lakes and Floating Palaces',
      overview: 'Udaipur is renowned as India\'s most romantic city, featuring sparkling lakes, white marble palaces, heritage Havelis, and sunset boat cruises.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&q=80',
      heroColor: 'from-blue-600 to-indigo-900',
      rating: 4.92,
      totalReviews: 4120,
      recommendedDays: 3,
      estimatedBudget: 22000.00,
      latitude: 24.5854,
      longitude: 73.7125,
      bestTimeToVisit: 'September to March',
      nearestAirport: 'Maharana Pratap Airport (UDR) — 22 km',
      nearestRailway: 'Udaipur City Railway Station (UDZ) — 2 km',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Udaipur City Palace Complex',
          slug: 'udaipur-city-palace',
          category: 'Royal Palace',
          description: 'Sprawling palace complex built over 400 years with sweeping views of Lake Pichola.',
          openingHours: '09:30 AM - 05:30 PM',
          entryFeeInr: 300,
          averageVisitDuration: 180,
          bestTimeToVisit: 'Morning',
          latitude: 24.5764,
          longitude: 73.6835,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Lake Pichola Sunset Boat Cruise',
          slug: 'lake-pichola-boat-cruise',
          category: 'Boating',
          description: 'Scenic sunset boat ride past Jag Mandir Island Palace and Lake Palace.',
          priceInr: 800,
          durationMinutes: 60,
          bestTimeToVisit: '05:30 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Goa',
      slug: 'goa',
      region: 'West Coast',
      state: 'Goa',
      country: 'India',
      category: 'Beaches & Nightlife',
      description: 'India\'s beach capital, famous for golden sand coastlines, Portuguese heritage churches, water sports, and beach shacks.',
      shortDescription: 'Coastal beach state famous for Calangute, Palolem, Old Goa cathedrals, and water sports.',
      tagline: 'Sun, Sand, Sea and Portuguese Coastal Soul',
      overview: 'Goa blends Portuguese heritage, palm-fringed tropical beaches, vibrant night markets, water adventures, and laid-back susegad lifestyle.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&q=80',
      heroColor: 'from-cyan-600 to-teal-900',
      rating: 4.90,
      totalReviews: 5200,
      recommendedDays: 4,
      estimatedBudget: 25000.00,
      latitude: 15.2993,
      longitude: 74.1240,
      bestTimeToVisit: 'November to February',
      nearestAirport: 'Dabolim Airport (GOI) / Mopa Airport (GOX)',
      nearestRailway: 'Madgaon Junction (MAO) / Thivim (THVM)',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Basilica of Bom Jesus',
          slug: 'basilica-bom-jesus',
          category: 'UNESCO Heritage Church',
          description: '16th-century Baroque Catholic basilica holding the mortal remains of St. Francis Xavier.',
          openingHours: '09:00 AM - 06:30 PM',
          entryFeeInr: 0,
          averageVisitDuration: 60,
          bestTimeToVisit: 'Morning',
          latitude: 15.5009,
          longitude: 73.9116,
          isVerified: true
        },
        {
          name: 'Baga & Calangute Beach',
          slug: 'baga-beach',
          category: 'Beach & Water Sports',
          description: 'Vibrant golden sand beach packed with water sports, beach shacks, and sunset lounges.',
          openingHours: '24 Hours',
          entryFeeInr: 0,
          averageVisitDuration: 180,
          bestTimeToVisit: 'Afternoon / Evening',
          latitude: 15.5553,
          longitude: 73.7517,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Scuba Diving & Water Sports at Grand Island',
          slug: 'goa-scuba-diving',
          category: 'Water Sports',
          description: 'Guided scuba diving with boat ride, parasailing, and jet ski activities.',
          priceInr: 3500,
          durationMinutes: 300,
          bestTimeToVisit: '08:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Mumbai',
      slug: 'mumbai',
      region: 'West Coast',
      state: 'Maharashtra',
      country: 'India',
      category: 'Metropolis & Heritage',
      description: 'The City of Dreams, India\'s financial capital featuring Gateway of India, Marine Drive promenade, Elephanta Caves, and Bollywood.',
      shortDescription: 'Financial capital of India featuring Gateway of India, Marine Drive, and Victorian architecture.',
      tagline: 'The Maximum City of Dreams and Coastal Spirit',
      overview: 'Mumbai is India\'s bustling economic powerhouse and cultural melting pot, combining Victorian Gothic UNESCO landmarks, coastal drives, and rich street food.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&q=80',
      heroColor: 'from-blue-700 to-slate-900',
      rating: 4.86,
      totalReviews: 6100,
      recommendedDays: 3,
      estimatedBudget: 20000.00,
      latitude: 19.0760,
      longitude: 72.8777,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
      nearestRailway: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Gateway of India',
          slug: 'gateway-of-india',
          category: 'Colonial Arch Landmark',
          description: 'Basalt arch monument erected to commemorate King George V\'s 1911 landing.',
          openingHours: '24 Hours',
          entryFeeInr: 0,
          averageVisitDuration: 60,
          bestTimeToVisit: 'Sunrise / Sunset',
          latitude: 18.9220,
          longitude: 72.8347,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Elephanta Island Caves Boat Excursion',
          slug: 'elephanta-caves-tour',
          category: 'Excursion',
          description: 'Ferry trip across Mumbai harbor to UNESCO rock-cut Shiva cave temples.',
          priceInr: 600,
          durationMinutes: 240,
          bestTimeToVisit: '09:00 AM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Delhi',
      slug: 'delhi',
      region: 'North India',
      state: 'Delhi (UT)',
      country: 'India',
      category: 'Capital & Heritage',
      description: 'Capital of India, rich with historical monuments like Qutub Minar, Red Fort, Humayun\'s Tomb, India Gate, and Chandni Chowk.',
      shortDescription: 'National capital combining ancient empires, UNESCO monuments, and vibrant culture.',
      tagline: 'The Historic Capital of Seven Ancient Empires',
      overview: 'Delhi bridges ancient history and modern metropolis, showcasing UNESCO world heritage monuments, bustling bazaars, government avenues, and world-class dining.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80',
      heroColor: 'from-amber-700 to-stone-900',
      rating: 4.85,
      totalReviews: 5400,
      recommendedDays: 3,
      estimatedBudget: 18000.00,
      latitude: 28.6139,
      longitude: 77.2090,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Indira Gandhi International Airport (DEL)',
      nearestRailway: 'New Delhi Railway Station (NDLS)',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Qutub Minar',
          slug: 'qutub-minar',
          category: 'UNESCO Monument',
          description: '73-meter tall UNESCO brick minaret built in 1193 surrounded by ancient ruins.',
          openingHours: '07:00 AM - 05:00 PM',
          entryFeeInr: 50,
          averageVisitDuration: 90,
          bestTimeToVisit: 'Morning',
          latitude: 28.5244,
          longitude: 77.1855,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Old Delhi Chandni Chowk Food & Rickshaw Walking Tour',
          slug: 'old-delhi-rickshaw-tour',
          category: 'Food & Culture',
          description: 'Guided rickshaw exploration of historic spice markets and iconic Mughlai eateries.',
          priceInr: 1200,
          durationMinutes: 180,
          bestTimeToVisit: '04:00 PM',
          isVerified: true
        }
      ]
    },
    {
      name: 'Varanasi',
      slug: 'varanasi',
      region: 'North India',
      state: 'Uttar Pradesh',
      country: 'India',
      category: 'Spiritual Capital',
      description: 'One of the world\'s oldest continuously inhabited cities, sacred spiritual heart on the holy River Ganges featuring Kashi Vishwanath temple and evening Aarti.',
      shortDescription: 'World\'s ancient spiritual capital on the sacred Ganges river with Ganga Aarti.',
      tagline: 'The Eternal Spiritual City on the Sacred Ganges',
      overview: 'Varanasi (Kashi) is India\'s ultimate spiritual capital, where ancient rituals, sacred river ghats, classical music, and the Kashi Vishwanath Jyotirlinga create a divine atmosphere.',
      primaryImageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1600&q=80',
      heroColor: 'from-orange-700 to-red-950',
      rating: 4.95,
      totalReviews: 4900,
      recommendedDays: 3,
      estimatedBudget: 14000.00,
      latitude: 25.3176,
      longitude: 82.9739,
      bestTimeToVisit: 'October to March',
      nearestAirport: 'Lal Bahadur Shastri International Airport (VNS)',
      nearestRailway: 'Varanasi Junction (BSB)',
      status: 'ACTIVE',
      isActive: true,
      attractions: [
        {
          name: 'Dashashwamedh Ghat & Evening Ganga Aarti',
          slug: 'dashashwamedh-ghat',
          category: 'Sacred River Ghat',
          description: 'Main river ghat famous for the grand nightly synchronized musical Ganga Aarti ceremony.',
          openingHours: '24 Hours',
          entryFeeInr: 0,
          averageVisitDuration: 120,
          bestTimeToVisit: 'Sunset',
          latitude: 25.3069,
          longitude: 83.0104,
          isVerified: true
        }
      ],
      activities: [
        {
          title: 'Sunrise Ganges Boat Ride & Ghat Tour',
          slug: 'varanasi-sunrise-boat-ride',
          category: 'Boating & Pilgrimage',
          description: 'Peaceful dawn boat cruise along 84 historic ghats with morning prayers.',
          priceInr: 500,
          durationMinutes: 90,
          bestTimeToVisit: '05:30 AM',
          isVerified: true
        }
      ]
    }
  ];

  console.log(`[Prisma Seed] Seeding ${destinations.length} India-wide destinations...`);

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

  // ==========================================
  // SEED 12 REFERENCE PACKAGES
  // ==========================================
  console.log('[Prisma Seed] Seeding 12 Reference Holiday Packages...');

  const packagesData = [
    {
      slug: 'rann-of-kutch-honeymoon',
      title: 'Rann of Kutch White Desert Honeymoon',
      shortDescription: 'Romantic full moon salt flat walks, luxury Swiss tents in Dhordo, and Kutchi artisan workshops.',
      description: 'Experience the magic of the Great Rann of Kutch with your partner. Stay in premium air-conditioned Swiss Tents at Dhordo Tent City, witness breathtaking sunsets on white salt marshes, explore ancient Kala Dungar, and enjoy private candlelight Kutchi dining.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Bhuj & Kutch',
      country: 'India',
      state: 'Gujarat',
      city: 'Bhuj',
      region: 'Kutch',
      durationDays: 4,
      durationNights: 3,
      category: 'Honeymoon',
      tags: ['Honeymoon', 'Desert', 'Cultural', 'Romantic', 'Rann Utsav'],
      theme: 'Romantic Desert Glamping',
      suitableFor: ['Couples', 'Honeymooners'],
      difficulty: 'Easy',
      startingPrice: 16999,
      originalPrice: 21999,
      discountedPrice: 16999,
      discountPercentage: 23,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 6,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: false,
      enquiryAvailable: true,
      bookingMode: 'request',
      coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80'
      ],
      rating: 4.95,
      totalReviews: 342,
      highlights: [
        { title: 'Luxury Swiss Tent Stay', description: 'AC Royal Tent in Dhordo Tent City with private porch', icon: 'tent', displayOrder: 1 },
        { title: 'Full Moon Desert Walk', description: 'Guided romantic walk across sparkling white salt crust', icon: 'bedtime', displayOrder: 2 },
        { title: 'Artisan Village Tour', description: 'Nirona Rogan painting & copper bell masterclass', icon: 'brush', displayOrder: 3 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Bhuj Arrival & Heritage Walk', description: 'Arrive at Bhuj, check into hotel, visit Aina Mahal and Prag Mahal. Evening at Hamirsar Lake.', activities: ['Bhuj Airport Transfer', 'Aina Mahal Visit', 'Prag Mahal Tour'], meals: ['Dinner'], hotel: 'Regenta Resort Bhuj', transport: 'Private AC Cab' },
        { dayNumber: 2, title: 'Dhordo Tent City & White Desert Sunset', description: 'Drive to Dhordo Tent City. Check into Royal Tent. Sunset on Great Rann salt flats with camel cart ride.', activities: ['Tent City Welcome', 'White Rann Sunset Walk', 'Cultural Folk Dance'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Dhordo Tent City Royal Suite', transport: 'Private AC Cab' },
        { dayNumber: 3, title: 'Kala Dungar & Nirona Artisan Craft', description: 'Sunrise trip to Kala Dungar (Black Hill). Afternoon visit to Nirona village for Rogan Art demonstration.', activities: ['Kala Dungar Panoramic View', 'Nirona Artisan Workshop'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Dhordo Tent City Royal Suite', transport: 'Private AC Cab' },
        { dayNumber: 4, title: 'Mandvi Beach & Return', description: 'Visit Vijay Vilas Palace and Mandvi Windmill Beach. Drop at Bhuj Railway Station/Airport.', activities: ['Vijay Vilas Palace Tour', 'Mandvi Beach Sunset', 'Airport Drop'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private AC Cab' },
      ],
      inclusions: [
        { title: 'Royal Swiss Tent Stay', description: '3 Nights accommodation in 4-Star glamping resort', icon: 'hotel', included: true },
        { title: 'All Daily Meals', description: 'Breakfast, Lunch & Dinner included', icon: 'restaurant', included: true },
        { title: 'Private AC Chauffeur Cab', description: 'Door-to-door dedicated transport', icon: 'directions_car', included: true },
        { title: 'Flight Tickets', description: 'Airfare is not included in base rate', icon: 'flight', included: false },
        { title: 'Personal Shopping Expenses', description: 'Personal shopping and tips excluded', icon: 'shopping_bag', included: false },
      ],
      hotels: [
        { hotelName: 'Regenta Resort Bhuj & Dhordo Tent City', hotelCategory: '4 Star', roomType: 'Royal AC Swiss Tent', nights: 3, upgradePricePerNightInr: 0, isDefault: true },
        { hotelName: 'The Fern Royal Farmstay Bhuj', hotelCategory: '5 Star', roomType: 'Luxury Villa with Private Pool', nights: 3, upgradePricePerNightInr: 4500, isDefault: false },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private Chauffeur Sedan', description: 'Dedicated AC Dzire/Etios for 4 days', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
        { transportType: 'FLIGHT', title: 'Roundtrip Flight Addon (BOM/DEL to BHJ)', description: 'Economy flights with 15kg baggage', isIncluded: false, isOptional: true, additionalPriceInr: 8500 },
      ],
      activities: [
        { title: 'Candlelight Dinner on White Salt Desert', description: 'Special romantic dinner setup under starlight', isIncluded: false, isOptional: true, additionalPriceInr: 3500 },
      ]
    },
    {
      slug: 'gir-lion-safari-family',
      title: 'Gir Lion Safari Family Package',
      shortDescription: 'Guaranteed open-top gypsy jungle safari, Devalia interpretation park, and luxury forest resort.',
      description: 'An unforgettable wildlife adventure into the sole home of the Asiatic Lion. Includes official open-top 4x4 Jeep Safari permits, expert forest guide, Devalia park entry, and Kathiyawadi organic feast.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Sasan Gir Wildlife',
      country: 'India',
      state: 'Gujarat',
      city: 'Sasan Gir',
      region: 'Saurashtra',
      durationDays: 3,
      durationNights: 2,
      category: 'Wildlife',
      tags: ['Family', 'Wildlife', 'Safari', 'Asiatic Lion', 'Nature'],
      theme: 'Wildlife Jungle Safari',
      suitableFor: ['Family', 'Kids', 'Wildlife Enthusiasts'],
      difficulty: 'Easy',
      startingPrice: 12499,
      originalPrice: 15999,
      discountedPrice: 12499,
      discountPercentage: 22,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 10,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: false,
      enquiryAvailable: true,
      bookingMode: 'request',
      coverImage: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=1200&q=80'
      ],
      rating: 4.98,
      totalReviews: 512,
      highlights: [
        { title: 'Open-Top Gypsy Safari Permit', description: 'Confirmed Zone 04 jungle safari with forest ranger', icon: 'directions_car', displayOrder: 1 },
        { title: 'Devalia Park Tour', description: 'Guaranteed Asiatic lion & leopard viewing', icon: 'pets', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Arrival in Sasan Gir & Resort Relaxation', description: 'Check into jungle resort surrounded by mango orchards. Evening nature walk and campfire.', activities: ['Resort Check-in', 'Nature Walk'], meals: ['Lunch', 'Dinner'], hotel: 'Woods at Sasan', transport: 'Private Cab' },
        { dayNumber: 2, title: 'Gir National Park Jeep Safari & Devalia', description: 'Early morning 06:00 AM Gypsy safari in Gir Core Zone. Afternoon Devalia Safari park tour.', activities: ['Morning Jungle Safari', 'Devalia Safari'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Woods at Sasan', transport: 'Open Gypsy 4x4' },
        { dayNumber: 3, title: 'Kamleshwar Dam & Departure', description: 'Visit Kamleshwar Dam crocodile sanctuary. Departure to Rajkot/Junagadh.', activities: ['Kamleshwar Dam Tour'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Cab' },
      ],
      inclusions: [
        { title: 'Jungle Safari Permits', description: 'Confirmed Gir forest safari entry fees', icon: 'confirmation_number', included: true },
        { title: 'Forest Resort Stay', description: '2 Nights stay in 4-Star eco resort', icon: 'hotel', included: true },
      ],
      hotels: [
        { hotelName: 'Woods at Sasan Eco Resort', hotelCategory: '4 Star', roomType: 'Jungle Cottage', nights: 2, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private AC SUV Transfer', description: 'Innova/Ertiga for transfers', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'statue-of-unity-family',
      title: 'Statue of Unity & Narmada Family Tour',
      shortDescription: 'World\'s tallest statue, 153m viewing gallery, sound & light show, and Zarwani waterfall trek.',
      description: 'Explore Ekta Nagar and the world\'s tallest 182-meter Statue of Unity. Includes Viewing Gallery tickets, Valley of Flowers, Cactus Garden, Laser Light Show, and Zarwani waterfall trek.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Statue of Unity',
      country: 'India',
      state: 'Gujarat',
      city: 'Kevadia',
      region: 'Central_Gujarat',
      durationDays: 2,
      durationNights: 1,
      category: 'Family',
      tags: ['Family', 'Statue of Unity', 'Heritage', 'Short Trip'],
      theme: 'Modern Monument & Nature',
      suitableFor: ['Family', 'Seniors', 'Kids'],
      difficulty: 'Easy',
      startingPrice: 7499,
      originalPrice: 9499,
      discountedPrice: 7499,
      discountPercentage: 21,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 1,
      maximumTravellers: 15,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: true,
      enquiryAvailable: true,
      bookingMode: 'instant',
      coverImage: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1609946782109-bf271853843d?w=1200&q=80'],
      rating: 4.89,
      totalReviews: 290,
      highlights: [
        { title: '153m Viewing Gallery Ticket', description: 'Express elevator ride inside Sardar Patel Statue chest', icon: 'visibility', displayOrder: 1 },
        { title: 'Laser Sound & Light Show', description: 'Nightly high-definition projection mapping', icon: 'light', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Statue of Unity & Nightly Laser Show', description: 'Arrive at Ekta Nagar. Express access to Viewing Gallery. Evening Laser Light Show.', activities: ['Viewing Gallery Tour', 'Laser Light Show'], meals: ['Lunch', 'Dinner'], hotel: 'Tent City Narmada Ekta Nagar', transport: 'E-Bus' },
        { dayNumber: 2, title: 'Valley of Flowers & Zarwani Trek', description: 'Visit Valley of Flowers, Cactus Garden, and Zarwani Waterfall. Return journey.', activities: ['Valley of Flowers', 'Zarwani Waterfall Trek'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Cab' },
      ],
      inclusions: [
        { title: 'All Monument Express Tickets', description: 'Viewing gallery & bus pass included', icon: 'confirmation_number', included: true },
      ],
      hotels: [
        { hotelName: 'Tent City Narmada Ekta Nagar', hotelCategory: '4 Star', roomType: 'Premium Cottage', nights: 1, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'CAB', title: 'AC Chauffeur Car', description: 'Vadodara to Ekta Nagar return transfer', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'bali-international-honeymoon',
      title: 'Bali Overwater Villa & Cultural Honeymoon',
      shortDescription: 'Private pool villa in Seminyak, Nusa Penida island cruise, and sacred Ubud rice terrace swings.',
      description: 'An enchanting tropical Indonesian escape. Enjoy 2 nights in a luxury private pool villa in Seminyak, 2 nights in Ubud overlooking rainforest valleys, Nusa Penida speedboat tour, and sunset Tanah Lot Temple.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'INTERNATIONAL',
      destinationName: 'Bali',
      country: 'Indonesia',
      state: 'Bali',
      city: 'Ubud',
      region: 'Southeast Asia',
      durationDays: 6,
      durationNights: 5,
      category: 'Honeymoon',
      tags: ['International', 'Honeymoon', 'Beach', 'Villa', 'Romantic'],
      theme: 'Tropical Luxury Villa Escape',
      suitableFor: ['Couples', 'Honeymooners'],
      difficulty: 'Easy',
      startingPrice: 42999,
      originalPrice: 55999,
      discountedPrice: 42999,
      discountPercentage: 23,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 4,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: false,
      enquiryAvailable: true,
      bookingMode: 'request',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80'],
      rating: 4.96,
      totalReviews: 210,
      highlights: [
        { title: 'Private Pool Villa Stay', description: 'Luxury 1-Bedroom Pool Villa in Seminyak with floating breakfast', icon: 'pool', displayOrder: 1 },
        { title: 'Nusa Penida Island Tour', description: 'Speedboat cruise to Kelingking T-Rex Beach & Angel Billabong', icon: 'sailing', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Denpasar Arrival & Private Villa Check-in', description: 'Arrive at Ngurah Rai Airport. Private transfer to Seminyak luxury pool villa.', activities: ['Airport Pick-up', 'Villa Welcome Drinks'], meals: ['Dinner'], hotel: 'Astana Kunti Private Pool Villa', transport: 'Private AC Van' },
        { dayNumber: 2, title: 'Nusa Penida Speedboat Island Cruise', description: 'Speedboat trip to Nusa Penida. Visit Kelingking Beach, Broken Beach, and Crystal Bay.', activities: ['Nusa Penida Boat Tour', 'Snorkeling'], meals: ['Breakfast', 'Lunch'], hotel: 'Astana Kunti Private Pool Villa', transport: 'Speedboat & Car' },
        { dayNumber: 3, title: 'Tanah Lot Sunset & Transfer to Ubud', description: 'Visit Tanah Lot sea temple. Transfer to Ubud rainforest resort.', activities: ['Tanah Lot Temple Sunset'], meals: ['Breakfast'], hotel: 'Komaneka at Bisma Ubud', transport: 'Private Van' },
        { dayNumber: 4, title: 'Ubud Rice Terrace & Jungle Swing', description: 'Tegalalang Rice Terrace swing, Sacred Monkey Forest, and Ubud Art Market.', activities: ['Jungle Swing Ride', 'Monkey Forest Tour'], meals: ['Breakfast', 'Lunch'], hotel: 'Komaneka at Bisma Ubud', transport: 'Private Van' },
        { dayNumber: 5, title: 'Kintamani Volcano & Spa Day', description: 'Batur volcano view, Luwak coffee plantation, and 2-hour Balinese couple spa.', activities: ['Couples Balinese Spa'], meals: ['Breakfast'], hotel: 'Komaneka at Bisma Ubud', transport: 'Private Van' },
        { dayNumber: 6, title: 'Departure Denpasar', description: 'Souvenir shopping and airport transfer.', activities: ['Airport Drop'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Van' },
      ],
      inclusions: [
        { title: 'Private Pool Villa', description: '5 Nights in 4/5 Star luxury properties', icon: 'hotel', included: true },
        { title: 'Daily Breakfast & Floating Breakfast', description: 'Includes 1 romantic floating breakfast setup', icon: 'free_breakfast', included: true },
        { title: 'International Flights', description: 'Flights available as add-on selection', icon: 'flight', included: false },
      ],
      hotels: [
        { hotelName: 'Astana Kunti Villa Seminyak & Komaneka Ubud', hotelCategory: '4 Star', roomType: 'One Bedroom Pool Villa', nights: 5, upgradePricePerNightInr: 0, isDefault: true },
        { hotelName: 'Ayana Resort & Spa Bali', hotelCategory: '5 Star', roomType: 'Ocean View Pool Villa', nights: 5, upgradePricePerNightInr: 12500, isDefault: false },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private Chauffeur Car in Bali', description: 'Dedicated Balinese English-speaking driver', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
        { transportType: 'FLIGHT', title: 'Roundtrip Flight Addon (BOM/DEL to DPS)', description: 'Direct or 1-stop international flights', isIncluded: false, isOptional: true, additionalPriceInr: 28000 },
      ],
      activities: []
    },
    {
      slug: 'maldives-overwater-villa-honeymoon',
      title: 'Maldives Overwater Villa Honeymoon',
      shortDescription: 'Luxury overwater bungalow with direct ocean access, speedboat transfer, and all-inclusive dining.',
      description: 'The ultimate bucket-list island paradise retreat. Stay in an iconic Overwater Bungalow surrounded by turquoise lagoons, enjoy unlimited premium dining and cocktails, dolphin sunset cruise, and couples spa massage.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'INTERNATIONAL',
      destinationName: 'Maldives',
      country: 'Maldives',
      state: 'Male',
      city: 'Male',
      region: 'Indian Ocean',
      durationDays: 5,
      durationNights: 4,
      category: 'Luxury',
      tags: ['International', 'Luxury', 'Honeymoon', 'Overwater Villa', 'Beach'],
      theme: 'Ultra-Luxury Island Paradise',
      suitableFor: ['Couples', 'Honeymooners'],
      difficulty: 'Easy',
      startingPrice: 89999,
      originalPrice: 115999,
      discountedPrice: 89999,
      discountPercentage: 22,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 2,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: false,
      enquiryAvailable: true,
      bookingMode: 'request',
      coverImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80'],
      rating: 4.99,
      totalReviews: 180,
      highlights: [
        { title: 'Overwater Villa Access', description: 'Glass floor panel & direct lagoon stairs', icon: 'water', displayOrder: 1 },
        { title: 'Sunset Dolphin Cruise', description: 'Champagne boat cruise with spinner dolphins', icon: 'directions_boat', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Speedboat Arrival & Overwater Check-in', description: 'Arrival at Velana International Airport (Male). Speedboat transfer to private island resort.', activities: ['Speedboat Transfer', 'Villa Welcome Champagne'], meals: ['Dinner'], hotel: 'Sun Siyam Olhuveli Maldives', transport: 'Speedboat' },
        { dayNumber: 2, title: 'Lagoon Snorkeling & Sunset Dolphin Cruise', description: 'Snorkeling in coral house reef. Evening dolphin watching cruise.', activities: ['Snorkeling Excursion', 'Dolphin Cruise'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Sun Siyam Olhuveli Maldives', transport: 'Boat' },
        { dayNumber: 3, title: 'Couples Spa & Candlelight Beach Dinner', description: 'Relaxing 60-minute massage at Overwater Spa. Private 3-course dinner on white beach.', activities: ['Couples Spa Massage', 'Candlelight Beach Dinner'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Sun Siyam Olhuveli Maldives', transport: 'None' },
        { dayNumber: 4, title: 'Water Sports & Lagoon Relaxation', description: 'Kayak and paddleboard in calm lagoon. Sunset cocktails at lagoon bar.', activities: ['Kayaking', 'Paddleboarding'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Sun Siyam Olhuveli Maldives', transport: 'None' },
        { dayNumber: 5, title: 'Departure Male', description: 'Speedboat transfer back to Male Airport.', activities: ['Speedboat Drop'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Speedboat' },
      ],
      inclusions: [
        { title: 'Overwater Bungalow Stay', description: '4 Nights in Deluxe Water Villa', icon: 'hotel', included: true },
        { title: 'All-Inclusive Meal Plan', description: 'All meals, snacks, and unlimited drinks', icon: 'restaurant', included: true },
        { title: 'Return Speedboat Transfers', description: 'Airport to resort return speedboat transfers', icon: 'directions_boat', included: true },
      ],
      hotels: [
        { hotelName: 'Sun Siyam Olhuveli Maldives', hotelCategory: '5 Star', roomType: 'Water Villa with Jacuzzi', nights: 4, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'TRANSFER', title: 'Roundtrip Speedboat Transfer', description: 'Airport-Resort-Airport', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'dubai-family-dream',
      title: 'Dubai Family Dream Package',
      shortDescription: 'Burj Khalifa 124th floor, Desert Safari with dune bashing, Museum of the Future & Marina Cruise.',
      description: 'A thrilling futuristic city holiday for the whole family. Experience Burj Khalifa observation deck, red dune 4x4 desert safari with BBQ dinner, Museum of the Future, Dubai Mall Aquarium, and Dhow Marina cruise.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'INTERNATIONAL',
      destinationName: 'Dubai',
      country: 'United Arab Emirates',
      state: 'Dubai',
      city: 'Dubai',
      region: 'Middle East',
      durationDays: 5,
      durationNights: 4,
      category: 'Family',
      tags: ['International', 'Family', 'Shopping', 'Theme Park', 'Luxury'],
      theme: 'Futuristic City & Desert Adventure',
      suitableFor: ['Family', 'Kids'],
      difficulty: 'Easy',
      startingPrice: 38999,
      originalPrice: 48999,
      discountedPrice: 38999,
      discountPercentage: 20,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 12,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: false,
      enquiryAvailable: true,
      bookingMode: 'request',
      coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80'],
      rating: 4.88,
      totalReviews: 310,
      highlights: [
        { title: 'Burj Khalifa 124th Floor Ticket', description: 'At The Top observation deck fast-track entrance', icon: 'apartment', displayOrder: 1 },
        { title: 'Red Dune 4x4 Desert Safari', description: 'Dune bashing, camel ride, belly dance & BBQ dinner', icon: 'terrain', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Dubai Arrival & Marina Dhow Cruise', description: 'Arrive at Dubai Airport (DXB). Check into hotel. Evening 2-hour Dhow Dinner Cruise along Dubai Marina.', activities: ['Airport Transfer', 'Dhow Dinner Cruise'], meals: ['Dinner'], hotel: 'Grand Millennium Dubai', transport: 'Private Car' },
        { dayNumber: 2, title: 'Dubai City Tour & Burj Khalifa', description: 'Half-day city tour covering Dubai Frame and Jumeirah Beach. Afternoon entry to Burj Khalifa 124th Floor & Dubai Mall Fountain Show.', activities: ['Dubai City Tour', 'Burj Khalifa 124th Floor'], meals: ['Breakfast'], hotel: 'Grand Millennium Dubai', transport: 'Private Car' },
        { dayNumber: 3, title: 'Museum of the Future & Red Dune Desert Safari', description: 'Morning Museum of the Future. 03:30 PM pickup for 4x4 Desert Safari with dune bashing and camp BBQ.', activities: ['Museum of the Future', '4x4 Desert Safari'], meals: ['Breakfast', 'Dinner'], hotel: 'Grand Millennium Dubai', transport: 'Land Cruiser 4x4' },
        { dayNumber: 4, title: 'Dubai Mall & Miracle Garden', description: 'Visit Miracle Garden & Butterfly Garden. Shopping afternoon at Mall of the Emirates.', activities: ['Miracle Garden Tour'], meals: ['Breakfast'], hotel: 'Grand Millennium Dubai', transport: 'Private Car' },
        { dayNumber: 5, title: 'Departure Dubai', description: 'Check out and airport transfer.', activities: ['Airport Drop'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Car' },
      ],
      inclusions: [
        { title: '4 Star City Hotel', description: '4 Nights stay in central Dubai property', icon: 'hotel', included: true },
        { title: 'Burj Khalifa & Safari Tickets', description: 'Confirmed entry passes included', icon: 'confirmation_number', included: true },
      ],
      hotels: [
        { hotelName: 'Grand Millennium Hotel Dubai Marina', hotelCategory: '4 Star', roomType: 'Deluxe Room', nights: 4, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private Airport Transfers & Tours', description: 'Dedicated chauffeur for transfers', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'rishikesh-adventure-yoga',
      title: 'Rishikesh Adventure & Yoga Retreat',
      shortDescription: 'White water river rafting in River Ganges, cliff jumping, Triveni Ghat Aarti, and yoga classes.',
      description: 'Immerse yourself in the Yoga Capital of the World. Enjoy 16km Grade-III white water rafting on the Ganges, Lakshman Jhula suspension bridge walk, peaceful Triveni Ghat evening prayer, and morning meditation sessions.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Rishikesh',
      country: 'India',
      state: 'Uttarakhand',
      city: 'Rishikesh',
      region: 'North India',
      durationDays: 3,
      durationNights: 2,
      category: 'Adventure',
      tags: ['Domestic', 'Adventure', 'Yoga', 'Rafting', 'Spiritual'],
      theme: 'River Rafting & Wellness Retreat',
      suitableFor: ['Friends', 'Backpackers', 'Solo'],
      difficulty: 'Moderate',
      startingPrice: 6499,
      originalPrice: 8499,
      discountedPrice: 6499,
      discountPercentage: 23,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 1,
      maximumTravellers: 12,
      featured: false,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: true,
      enquiryAvailable: true,
      bookingMode: 'instant',
      coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80'],
      rating: 4.87,
      totalReviews: 240,
      highlights: [
        { title: '16km Ganges River Rafting', description: 'Grade-III rapids from Shivpuri to Rishikesh with cliff jumping', icon: 'surfing', displayOrder: 1 },
        { title: 'Triveni Ghat Evening Aarti', description: 'Spiritual Ganga Aarti ceremony with floating lamps', icon: 'temple_hindu', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Rishikesh Arrival & Triveni Ghat Aarti', description: 'Arrive at Rishikesh. Check into riverside camp/resort. Evening walk across Ram Jhula to Triveni Ghat Aarti.', activities: ['Ram Jhula Walk', 'Triveni Ghat Aarti'], meals: ['Dinner'], hotel: 'Aloha On The Ganges', transport: 'Private Cab' },
        { dayNumber: 2, title: '16km White Water Rafting & Cliff Jumping', description: 'Drive to Shivpuri. Safety briefing and 16km thrilling rafting adventure on River Ganges with cliff jumping.', activities: ['16km River Rafting', 'Cliff Jumping'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Aloha On The Ganges', transport: 'Rafting Vehicle' },
        { dayNumber: 3, title: 'Sunrise Yoga & Beatles Ashram Tour', description: '07:00 AM Yoga and Pranayama session. Visit iconic Beatles Ashram before departure.', activities: ['Morning Yoga', 'Beatles Ashram Tour'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Cab' },
      ],
      inclusions: [
        { title: '16km Rafting Gear & Safety Equipment', description: 'Life jackets, helmets, raft guide fees', icon: 'sports', included: true },
      ],
      hotels: [
        { hotelName: 'Aloha On The Ganges Resort', hotelCategory: '4 Star', roomType: 'Ganges View Room', nights: 2, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'CAB', title: 'Dehradun Airport / Haridwar Station Transfer', description: 'Pick up and drop', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'leh-ladakh-bike-tour',
      title: 'Leh Ladakh Bike & Mountains Tour',
      shortDescription: 'Motorbike expedition across Khardung La pass (17,982 ft), Pangong Tso Lake & Nubra Valley.',
      description: 'The ultimate high-altitude mountain road trip adventure. Ride Royal Enfield bikes across the world\'s highest motorable mountain passes, camp by pristine turquoise Pangong Tso Lake, and ride double-humped camels in Nubra Valley dunes.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Leh Ladakh',
      country: 'India',
      state: 'Ladakh (UT)',
      city: 'Leh',
      region: 'Himalayas',
      durationDays: 6,
      durationNights: 5,
      category: 'Adventure',
      tags: ['Domestic', 'Adventure', 'Bike Tour', 'Mountains', 'High Altitude'],
      theme: 'Himalayan Motorbike Expedition',
      suitableFor: ['Friends', 'Bikers', 'Adventure Seekers'],
      difficulty: 'Challenging',
      startingPrice: 24999,
      originalPrice: 32999,
      discountedPrice: 24999,
      discountPercentage: 24,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 1,
      maximumTravellers: 12,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: false,
      enquiryAvailable: true,
      bookingMode: 'request',
      coverImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&q=80'],
      rating: 4.94,
      totalReviews: 380,
      highlights: [
        { title: 'Khardung La Pass Ride', description: 'Cross world-famous 17,982 ft mountain pass', icon: 'two_wheeler', displayOrder: 1 },
        { title: 'Pangong Tso Lake Camping', description: 'Overnight luxury tent camping along blue salt lake', icon: 'landscape', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Leh Arrival & Acclimatization', description: 'Fly into Kushok Bakula Rimpoche Airport Leh (11,500 ft). Complete rest for high-altitude acclimatization.', activities: ['Airport Pickup', 'Acclimatization Rest'], meals: ['Dinner'], hotel: 'The Grand Dragon Leh', transport: 'Private Van' },
        { dayNumber: 2, title: 'Leh Local Sightseeing & Hall of Fame', description: 'Visit Leh Palace, Shanti Stupa, Hall of Fame war museum, and Magnetic Hill.', activities: ['Shanti Stupa Visit', 'Magnetic Hill Test'], meals: ['Breakfast', 'Dinner'], hotel: 'The Grand Dragon Leh', transport: 'Royal Enfield 350cc' },
        { dayNumber: 3, title: 'Leh to Nubra Valley via Khardung La', description: 'Ride over Khardung La Pass (17,982 ft) into Nubra Valley. Double-humped camel ride in Hunder sand dunes.', activities: ['Khardung La Pass Ride', 'Bactrian Camel Ride'], meals: ['Breakfast', 'Dinner'], hotel: 'Hunder Desert Eco Camp', transport: 'Royal Enfield 350cc' },
        { dayNumber: 4, title: 'Nubra Valley to Pangong Tso Lake', description: 'Ride along Shyok River to magical Pangong Tso Lake. Camping by the turquoise lake shore.', activities: ['Pangong Lake Sunset Photography'], meals: ['Breakfast', 'Dinner'], hotel: 'Pangong Wooden Cottage Camp', transport: 'Royal Enfield 350cc' },
        { dayNumber: 5, title: 'Pangong to Leh via Chang La Pass', description: 'Sunrise at Pangong Lake. Return ride to Leh over Chang La Pass (17,590 ft) and Thiksey Monastery.', activities: ['Thiksey Monastery Visit'], meals: ['Breakfast', 'Dinner'], hotel: 'The Grand Dragon Leh', transport: 'Royal Enfield 350cc' },
        { dayNumber: 6, title: 'Leh Departure', description: 'Transfer to Leh Airport.', activities: ['Airport Drop'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Van' },
      ],
      inclusions: [
        { title: 'Royal Enfield 350cc Bike & Fuel', description: 'Includes helmet, fuel & back-up mechanic van', icon: 'two_wheeler', included: true },
        { title: 'Inner Line Permits', description: 'Protected area permits for Nubra & Pangong', icon: 'verified', included: true },
      ],
      hotels: [
        { hotelName: 'The Grand Dragon Leh & Hunder Camp', hotelCategory: '4 Star', roomType: 'Deluxe Mountain View Room', nights: 5, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'SELF_DRIVE', title: 'Royal Enfield Himalayan / 350cc Bike', description: 'Fuel & backup vehicle included', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'udaipur-royal-honeymoon',
      title: 'Udaipur Royal Honeymoon Package',
      shortDescription: 'Lake Pichola sunset boat cruise, heritage Haveli stay, City Palace tour, and vintage car museum.',
      description: 'Immerse yourself in Rajasthan\'s most romantic city. Stay in a restored 18th-century lakefront Haveli, enjoy a private sunset boat ride past Jag Mandir Island Palace, and indulge in a romantic rooftop candlelit dinner.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Udaipur',
      country: 'India',
      state: 'Rajasthan',
      city: 'Udaipur',
      region: 'North India',
      durationDays: 3,
      durationNights: 2,
      category: 'Honeymoon',
      tags: ['Domestic', 'Honeymoon', 'Royal', 'Lakes', 'Romantic'],
      theme: 'Royal Palace Romance',
      suitableFor: ['Couples', 'Honeymooners'],
      difficulty: 'Easy',
      startingPrice: 15999,
      originalPrice: 19999,
      discountedPrice: 15999,
      discountPercentage: 20,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 4,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: false,
      enquiryAvailable: true,
      bookingMode: 'request',
      coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80'],
      rating: 4.93,
      totalReviews: 320,
      highlights: [
        { title: 'Lake Pichola Boat Cruise', description: 'Private sunset boat ride past Lake Palace', icon: 'sailing', displayOrder: 1 },
        { title: 'Rooftop Candlelight Dinner', description: 'Private dinner overlooking illuminated City Palace', icon: 'dinner_dining', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Udaipur Arrival & Lakefront Check-in', description: 'Arrive at Udaipur Maharana Pratap Airport. Transfer to heritage lakefront hotel. Sunset boat ride on Lake Pichola.', activities: ['Lake Pichola Boat Ride', 'Rooftop Welcome Dinner'], meals: ['Dinner'], hotel: 'Jagat Niwas Palace Hotel', transport: 'Private Sedan' },
        { dayNumber: 2, title: 'City Palace & Jagdish Temple Tour', description: 'Guided tour of City Palace, Jagdish Temple, Saheliyon Ki Bari gardens, and Vintage Car Collection.', activities: ['City Palace Tour', 'Saheliyon Ki Bari'], meals: ['Breakfast'], hotel: 'Jagat Niwas Palace Hotel', transport: 'Private Sedan' },
        { dayNumber: 3, title: 'Monsoon Palace & Departure', description: 'Morning visit to Sajjangarh Monsoon Palace for hill vistas. Drop at Udaipur Airport/Station.', activities: ['Monsoon Palace Vistas', 'Airport Drop'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Sedan' },
      ],
      inclusions: [
        { title: 'Heritage Lake View Room', description: '2 Nights stay in authentic Mewari Haveli', icon: 'hotel', included: true },
        { title: 'Sunset Boat Cruise', description: 'Private Lake Pichola boat tickets included', icon: 'sailing', included: true },
      ],
      hotels: [
        { hotelName: 'Jagat Niwas Palace Heritage Hotel', hotelCategory: '4 Star', roomType: 'Lake View Suite', nights: 2, upgradePricePerNightInr: 0, isDefault: true },
        { hotelName: 'Taj Lake Palace Udaipur', hotelCategory: '5 Star', roomType: 'Luxury Lake View Room', nights: 2, upgradePricePerNightInr: 18000, isDefault: false },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private AC Chauffeur Car', description: 'Dedicated Dzire/Etios for 3 days', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'goa-beach-honeymoon',
      title: 'Goa Beach Honeymoon Package',
      shortDescription: 'North & South Goa beaches, Mandovi river cruise, Dudhsagar waterfall safari, and beach shacks.',
      description: 'The ultimate Indian coastal beach vacation. Relax on golden sand beaches, enjoy water sports at Calangute, explore Portuguese churches in Old Goa, take a Mandovi river sunset cruise, and visit Dudhsagar Waterfalls.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Goa',
      country: 'India',
      state: 'Goa',
      city: 'Calangute',
      region: 'West Coast',
      durationDays: 4,
      durationNights: 3,
      category: 'Beach',
      tags: ['Domestic', 'Beach', 'Honeymoon', 'Water Sports', 'Nightlife'],
      theme: 'Coastal Beach & Susegad Lifestyle',
      suitableFor: ['Couples', 'Friends'],
      difficulty: 'Easy',
      startingPrice: 13999,
      originalPrice: 17999,
      discountedPrice: 13999,
      discountPercentage: 22,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 8,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: true,
      enquiryAvailable: true,
      bookingMode: 'instant',
      coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80'],
      rating: 4.90,
      totalReviews: 450,
      highlights: [
        { title: 'Mandovi River Sunset Cruise', description: '1-Hour river boat cruise with Goan folk dance', icon: 'sailing', displayOrder: 1 },
        { title: 'North Goa Beach Tour', description: 'Calangute, Baga & Anjuna beach hopping', icon: 'beach_access', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Goa Arrival & Beach Resort Check-in', description: 'Arrive at Dabolim/Mopa Airport. Check into beach resort near Baga. Evening relax at Tito\'s Lane & beach shack.', activities: ['Airport Transfer', 'Beach Shack Relax'], meals: ['Dinner'], hotel: 'Hard Rock Hotel Goa', transport: 'Private Cab' },
        { dayNumber: 2, title: 'North Goa Water Sports & Fort Aguada', description: 'Visit 17th-century Fort Aguada lighthouse. Water sports at Baga Beach (Parasailing, Jet Ski). Evening Mandovi River Cruise.', activities: ['Fort Aguada Tour', 'Water Sports', 'Mandovi Cruise'], meals: ['Breakfast'], hotel: 'Hard Rock Hotel Goa', transport: 'Private Cab' },
        { dayNumber: 3, title: 'South Goa Heritage Churches & Mangueshi Temple', description: 'Basilica of Bom Jesus, Se Cathedral, Mangueshi Temple, and Miramar Beach.', activities: ['Old Goa Churches Tour'], meals: ['Breakfast'], hotel: 'Hard Rock Hotel Goa', transport: 'Private Cab' },
        { dayNumber: 4, title: 'Departure Goa', description: 'Check out and transfer to airport.', activities: ['Airport Drop'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Cab' },
      ],
      inclusions: [
        { title: '4 Star Beach Resort Stay', description: '3 Nights stay near Baga/Calangute', icon: 'hotel', included: true },
        { title: 'Mandovi Cruise Ticket', description: '1-Hour evening cruise ticket included', icon: 'sailing', included: true },
      ],
      hotels: [
        { hotelName: 'Hard Rock Hotel Goa Calangute', hotelCategory: '4 Star', roomType: 'Deluxe Pool View Room', nights: 3, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private AC Taxi for Transfers & Sightseeing', description: 'Dedicated Goan chauffeur for 4 days', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'manali-snow-honeymoon',
      title: 'Manali Honeymoon & Solang Valley Package',
      shortDescription: 'Solang Valley snow sports, Atal Tunnel excursion, Hadimba Temple, and Manikaran hot springs.',
      description: 'Experience romantic snow-capped peaks in Himachal Pradesh. Enjoy Solang Valley snow adventure sports, drive through the engineering marvel Atal Tunnel, explore Mall Road, and relax in Vashisht natural hot springs.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Manali',
      country: 'India',
      state: 'Himachal Pradesh',
      city: 'Manali',
      region: 'Himalayas',
      durationDays: 4,
      durationNights: 3,
      category: 'Hill Station',
      tags: ['Domestic', 'Hill Station', 'Snow', 'Honeymoon', 'Mountains'],
      theme: 'Snow Peak Mountain Romance',
      suitableFor: ['Couples', 'Honeymooners', 'Family'],
      difficulty: 'Easy',
      startingPrice: 11999,
      originalPrice: 15999,
      discountedPrice: 11999,
      discountPercentage: 25,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 10,
      featured: true,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: true,
      enquiryAvailable: true,
      bookingMode: 'instant',
      coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80'],
      rating: 4.92,
      totalReviews: 390,
      highlights: [
        { title: 'Solang Valley Snow Sports', description: 'Paragliding, skiing & ropeway ride', icon: 'downhill_skiing', displayOrder: 1 },
        { title: 'Atal Tunnel & Sissu Excursion', description: 'Drive through 9.02km world\'s longest high-altitude tunnel', icon: 'tune', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Manali Arrival & Local Hadimba Temple Tour', description: 'Arrive at Manali. Check into mountain resort. Visit 1553 CE Hadimba Devi Temple, Vashisht Hot Springs, and Mall Road.', activities: ['Hadimba Temple Tour', 'Mall Road Shopping'], meals: ['Dinner'], hotel: 'The Himalayan Resort & Spa', transport: 'Private Cab' },
        { dayNumber: 2, title: 'Solang Valley Snow Adventure & Paragliding', description: 'Full day excursion to Solang Valley. Enjoy ropeway ride, skiing, quad biking, and tandem paragliding.', activities: ['Solang Valley Snow Sports', 'Ropeway Ride'], meals: ['Breakfast', 'Dinner'], hotel: 'The Himalayan Resort & Spa', transport: 'Private Cab' },
        { dayNumber: 3, title: 'Atal Tunnel & Lahaul Valley Sissu Trip', description: 'Drive through Atal Tunnel into snow-covered Sissu village in Lahaul Valley. Visit Sissu Waterfall.', activities: ['Atal Tunnel Drive', 'Sissu Waterfall View'], meals: ['Breakfast', 'Dinner'], hotel: 'The Himalayan Resort & Spa', transport: 'Private Cab' },
        { dayNumber: 4, title: 'Kullu Rafting & Departure', description: 'En route visit Kullu shawl weaving factory and River Beas rafting. Drop at Chandigarh/Bhuntar Airport.', activities: ['Kullu Shawl Factory Visit'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Cab' },
      ],
      inclusions: [
        { title: '4 Star Mountain View Resort', description: '3 Nights stay with valley balconies', icon: 'hotel', included: true },
      ],
      hotels: [
        { hotelName: 'The Himalayan Resort & Spa Manali', hotelCategory: '4 Star', roomType: 'Mountain View Deluxe Room', nights: 3, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private AC Cab for 4 Days', description: 'Dedicated hill driver from Chandigarh/Bhuntar', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    },
    {
      slug: 'shimla-snow-family',
      title: 'Shimla Snow & Hills Family Package',
      shortDescription: 'Colonial Ridge walk, Kufri snow adventure park, Jakhoo Temple ropeway, and Chail palace.',
      description: 'Explore the Queen of Hills with your family. Walk the pedestrian Mall Road & Ridge, enjoy horse riding and snow activities in Kufri, ride Jakhoo Temple ropeway, and visit historic Viceregal Lodge.',
      packageType: 'HOLIDAY',
      domesticOrInternational: 'DOMESTIC',
      destinationName: 'Shimla',
      country: 'India',
      state: 'Himachal Pradesh',
      city: 'Shimla',
      region: 'Himalayas',
      durationDays: 3,
      durationNights: 2,
      category: 'Family',
      tags: ['Domestic', 'Family', 'Hill Station', 'Colonial', 'Snow'],
      theme: 'Colonial Hill Capital',
      suitableFor: ['Family', 'Kids', 'Seniors'],
      difficulty: 'Easy',
      startingPrice: 9999,
      originalPrice: 12999,
      discountedPrice: 9999,
      discountPercentage: 23,
      priceType: 'PER_PERSON',
      currency: 'INR',
      minimumTravellers: 2,
      maximumTravellers: 10,
      featured: false,
      popular: true,
      active: true,
      bookingAvailable: true,
      instantBook: true,
      enquiryAvailable: true,
      bookingMode: 'instant',
      coverImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1597074866923-dc0589150358?w=1200&q=80'],
      rating: 4.88,
      totalReviews: 280,
      highlights: [
        { title: 'Kufri Snow Adventure Park', description: 'Yak ride, horse riding & snow views', icon: 'downhill_skiing', displayOrder: 1 },
        { title: 'Jakhoo Hill Cable Car', description: 'Scenic ropeway ride to 108ft Hanuman statue', icon: 'nature', displayOrder: 2 },
      ],
      itineraryDays: [
        { dayNumber: 1, title: 'Shimla Arrival & Mall Road Ridge Walk', description: 'Arrive at Shimla. Check into heritage hotel. Stroll along Christ Church, Scandal Point, and Mall Road.', activities: ['The Ridge Walk', 'Christ Church Visit'], meals: ['Dinner'], hotel: 'The Oberoi Cecil Shimla', transport: 'Private Cab' },
        { dayNumber: 2, title: 'Kufri Adventure & Jakhoo Temple Ropeway', description: 'Excursion to Kufri Fun World. Ride Jakhoo Temple cable car for mountain views.', activities: ['Kufri Park Tour', 'Jakhoo Ropeway Ride'], meals: ['Breakfast', 'Dinner'], hotel: 'The Oberoi Cecil Shimla', transport: 'Private Cab' },
        { dayNumber: 3, title: 'Viceregal Lodge & Departure', description: 'Visit historic British Viceregal Lodge (Rashtrapati Niwas). Return transfer to Chandigarh.', activities: ['Viceregal Lodge Tour'], meals: ['Breakfast'], hotel: 'N/A', transport: 'Private Cab' },
      ],
      inclusions: [
        { title: 'Heritage Hill Resort Stay', description: '2 Nights stay in central Shimla', icon: 'hotel', included: true },
      ],
      hotels: [
        { hotelName: 'The Oberoi Cecil Shimla', hotelCategory: '5 Star', roomType: 'Luxury Valley View Room', nights: 2, upgradePricePerNightInr: 0, isDefault: true },
      ],
      transports: [
        { transportType: 'CAB', title: 'Private AC Cab', description: 'Chandigarh to Shimla return transfer', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      ],
      activities: []
    }
  ];

  let pkgCount = 0;
  for (const pkg of packagesData) {
    const { highlights, itineraryDays, inclusions, hotels, transports, activities, ...pkgFields } = pkg;

    // Resolve destinationId if destinationName exists
    const destMatch = await prisma.destination.findFirst({
      where: { name: { contains: pkgFields.destinationName, mode: 'insensitive' } }
    });

    const createdPkg = await prisma.package.upsert({
      where: { slug: pkgFields.slug },
      update: {
        ...pkgFields,
        destinationId: destMatch?.id || null,
      },
      create: {
        ...pkgFields,
        destinationId: destMatch?.id || null,
      }
    });

    // Seed highlights
    if (highlights && highlights.length > 0) {
      await prisma.packageHighlight.deleteMany({ where: { packageId: createdPkg.id } });
      await prisma.packageHighlight.createMany({
        data: highlights.map((h) => ({ ...h, packageId: createdPkg.id }))
      });
    }

    // Seed itinerary days
    if (itineraryDays && itineraryDays.length > 0) {
      await prisma.packageItineraryDay.deleteMany({ where: { packageId: createdPkg.id } });
      await prisma.packageItineraryDay.createMany({
        data: itineraryDays.map((d) => ({ ...d, packageId: createdPkg.id }))
      });
    }

    // Seed inclusions
    if (inclusions && inclusions.length > 0) {
      await prisma.packageInclusion.deleteMany({ where: { packageId: createdPkg.id } });
      await prisma.packageInclusion.createMany({
        data: inclusions.map((i) => ({ ...i, packageId: createdPkg.id }))
      });
    }

    // Seed hotels
    if (hotels && hotels.length > 0) {
      await prisma.packageHotel.deleteMany({ where: { packageId: createdPkg.id } });
      await prisma.packageHotel.createMany({
        data: hotels.map((h) => ({ ...h, packageId: createdPkg.id }))
      });
    }

    // Seed transports
    if (transports && transports.length > 0) {
      await prisma.packageTransport.deleteMany({ where: { packageId: createdPkg.id } });
      await prisma.packageTransport.createMany({
        data: transports.map((t) => ({ ...t, packageId: createdPkg.id }))
      });
    }

    // Seed activities
    if (activities && activities.length > 0) {
      await prisma.packageActivity.deleteMany({ where: { packageId: createdPkg.id } });
      await prisma.packageActivity.createMany({
        data: activities.map((a) => ({ ...a, packageId: createdPkg.id }))
      });
    }

    pkgCount++;
  }

  console.log(`[Prisma Seed] SUCCESS! Seeded ${pkgCount} Reference Travel Packages with full itineraries, highlights, hotels & transports.`);
}

main()
  .catch((e) => {
    console.error('[Prisma Seed] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
