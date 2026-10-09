export interface DestinationActivity {
  title: string;
  duration: string;
  price: string;
  verified: boolean;
}

export interface Destination {
  slug: string;
  name: string;
  region: string;
  durationHours: number;
  description: string;
  overview: string;
  highlights: string[];
  bestTimeToVisit: string;
  nearestAirport: string;
  nearestRailway: string;
  idealDays: number;
  activities: DestinationActivity[];
  tagline: string;
  heroColor: string;
  bgImage?: string;
}

export const GUJARAT_DESTINATIONS: Destination[] = [
  {
    slug: 'dwarka',
    name: 'Dwarka Kingdom',
    region: 'Saurashtra',
    durationHours: 48,
    tagline: 'Ancient Capital of Lord Krishna on the Arabian Sea',
    description: 'One of the four sacred Char Dham pilgrimage sites, ancient coastal kingdom with 2,500-year-old temples and pristine sea beaches.',
    overview: 'Dwarka is one of India\'s most revered ancient cities and one of the four sacred Char Dham pilgrimage sites. Situated at the western tip of the Kathiawar peninsula where the Gomti River meets the Arabian Sea, Dwarka boasts the majestic Dwarkadhish Temple (Jagat Mandir), the sacred Bet Dwarka island, Nageshwar Jyotirlinga, and pristine coastal promenades.',
    highlights: [
      'Dwarkadhish Temple (5-storey 16th-century spire on 72 pillars)',
      'Bet Dwarka Island Ferry & Lord Krishna Residence',
      'Nageshwar Jyotirlinga (One of 12 sacred Shiva Jyotirlingas)',
      'Rukmini Devi Temple (Intricate 12th-century stone carvings)',
      'Bhadkeshwar Mahadev Temple (Sunset sea shrine)',
      'Gomti Ghat Evening Holy Aarti & Bathing Steps',
    ],
    bestTimeToVisit: 'October to March (Navratri, Janmashtami & Winter)',
    nearestAirport: 'Jamnagar Airport (JGA) — 137 km / Rajkot (HSR) — 225 km',
    nearestRailway: 'Dwarka Railway Station (DWK) — 2 km from city center',
    idealDays: 3,
    activities: [
      { title: 'Dwarkadhish Temple Morning Mangla Aarti', duration: '2 hours', price: 'Free / VIP Entry ₹100', verified: true },
      { title: 'Bet Dwarka Island Boat Ferry Trip', duration: '4 hours', price: '₹30 boat fare', verified: true },
      { title: 'Nageshwar Jyotirlinga & Gopi Talav Tour', duration: '3 hours', price: '₹150 cab fare', verified: true },
      { title: 'Bhadkeshwar Mahadev Temple Sunset View', duration: '1.5 hours', price: 'Free', verified: true },
      { title: 'Local Handicraft & Brassware Market Shopping', duration: '2 hours', price: 'Varies', verified: true },
    ],
    heroColor: 'from-amber-600 to-amber-900',
    bgImage: '/dwarka-temple-bg.jpg',
  },
  {
    slug: 'bhuj',
    name: 'Bhuj & Kutch',
    region: 'Kutch',
    durationHours: 48,
    tagline: 'Cultural Gateway to the White Rann Salt Desert',
    description: 'Cultural heart of Kutch, gateway to the endless White Rann salt desert, ancient palaces, Ajrakh block printing, and vibrant handicraft villages.',
    overview: 'Bhuj is the historic capital of the former Kutch State, renowned for its resilient spirit, 18th-century Prag Mahal and Aina Mahal palaces, and world-famous artisan hamlets. It serves as the primary base for exploring the Great Rann of Kutch, Dholavira Harappan metropolis, and Banni handicraft villages.',
    highlights: [
      'Great Rann of Kutch White Salt Desert (Rann Utsav)',
      'Aina Mahal (Hall of Mirrors) & Prag Mahal Bell Tower',
      'Kala Dungar (Black Hill) highest peak in Kutch',
      'Ajrakhpur & Bhujodi Artisan Craft Villages',
      'Kutch Museum (Oldest museum in Gujarat, est. 1877)',
      'Smritivan Earthquake Memorial & Museum',
    ],
    bestTimeToVisit: 'November to February (Rann Utsav season)',
    nearestAirport: 'Bhuj Airport (BHJ) — 4 km',
    nearestRailway: 'Bhuj Railway Station (BHJ) — 2 km',
    idealDays: 4,
    activities: [
      { title: 'Full Moon Sunset at White Rann Salt Desert', duration: '5 hours', price: '₹100 permit + Transport', verified: true },
      { title: 'Prag Mahal & Aina Mahal Palace Tour', duration: '2.5 hours', price: '₹40 entry', verified: true },
      { title: 'Kala Dungar Jackal Feeding & Viewpoint', duration: '4 hours', price: 'Free', verified: true },
      { title: 'Bhujodi Weaving & Handicrafts Workshop', duration: '3 hours', price: 'Free entry', verified: true },
    ],
    heroColor: 'from-blue-600 to-indigo-900',
    bgImage: '/bhuj-kutch-bg.jpg',
  },
  {
    slug: 'sasan-gir',
    name: 'Sasan Gir Wildlife',
    region: 'Saurashtra',
    durationHours: 36,
    tagline: 'The Exclusive Sanctuary of the Asiatic Lion',
    description: 'The world\'s only natural habitat of the endangered Asiatic Lion, boasting dense teak forests, riverine habitats, and rich wildlife safaris.',
    overview: 'Sasan Gir (Gir National Park) is the sole wildlife sanctuary in the world where the majestic Asiatic Lion roams free. Spanning over 1,412 sq km of dry deciduous forests and rocky hills, Gir is also home to leopards, hyenas, sambar deer, chousingha (four-horned antelope), and over 300 bird species.',
    highlights: [
      'Open-top Jeep Safari in Gir Jungle Trail',
      'Devalia Safari Park (Gir Interpretation Zone)',
      'Kamleshwar Dam (Crocodile breeding sanctuary)',
      'Maldhari Tribal Settlement Culture Experience',
      'Bird Watching at Kankai Temple & Nalsarovar Route',
    ],
    bestTimeToVisit: 'December to March (Park closed June 16 - Oct 15)',
    nearestAirport: 'Keshod Airport (IXK) — 60 km / Rajkot (HSR) — 160 km',
    nearestRailway: 'Junagadh Railway Station (JND) — 55 km / Veraval — 42 km',
    idealDays: 2,
    activities: [
      { title: 'Morning Open-Top Jeep Jungle Safari', duration: '3 hours', price: '₹1,000 - ₹4,500 permit', verified: true },
      { title: 'Devalia Safari Bus Tour', duration: '1.5 hours', price: '₹200 per head', verified: true },
      { title: 'Kamleshwar Dam Crocodile Viewpoint', duration: '2 hours', price: 'Included in safari', verified: true },
    ],
    heroColor: 'from-emerald-700 to-green-950',
    bgImage: '/sasan-gir-bg.jpg',
  },
  {
    slug: 'somnath',
    name: 'Somnath Temple',
    region: 'Saurashtra',
    durationHours: 24,
    tagline: 'The Eternal Shrine on the Arabian Sea Coast',
    description: 'First among the 12 holy Jyotirlinga shrines of Lord Shiva, rebuilt seven times on the pristine shores of the Arabian Sea.',
    overview: 'Somnath, located at Prabhas Patan near Veraval, is one of the most sacred pilgrimage destinations in Hinduism. The main Somnath Temple stands right on the shore of the ocean, offering awe-inspiring ocean views, daily sound & light shows, and deep spiritual heritage dating back thousands of years.',
    highlights: [
      'Somnath Jyotirlinga Main Temple & Ocean View Spire',
      'Somnath Beach & Promenade Walk',
      'Sound & Light Show (3D Projection on Temple Walls)',
      'Triveni Sangam (Confluence of Hiran, Kapila & Saraswati rivers)',
      'Bhalka Tirth (Sacred spot of Lord Krishna\'s departure)',
    ],
    bestTimeToVisit: 'September to March (Maha Shivratri festival)',
    nearestAirport: 'Keshod Airport (IXK) — 55 km / Diu Airport (DIU) — 85 km',
    nearestRailway: 'Veraval Junction (VRL) — 7 km',
    idealDays: 2,
    activities: [
      { title: 'Somnath Temple Sandhya Aarti & Darshan', duration: '2 hours', price: 'Free', verified: true },
      { title: 'Evening 3D Light & Sound Show', duration: '1 hour', price: '₹30 ticket', verified: true },
      { title: 'Triveni Sangam Boat Ride & Holy Dip', duration: '1.5 hours', price: '₹50 boat fare', verified: true },
    ],
    heroColor: 'from-orange-600 to-amber-900',
    bgImage: '/somnath-temple-bg.jpg',
  },
  {
    slug: 'statue-of-unity',
    name: 'Statue of Unity',
    region: 'Central_Gujarat',
    durationHours: 36,
    tagline: 'World\'s Tallest Monument (182 Meters) in Ekta Nagar',
    description: 'Colossal 182-meter statue of Sardar Vallabhbhai Patel surrounded by Narmada dam, valley of flowers, jungle safari, and laser light shows.',
    overview: 'Rising 182 meters above the Narmada River facing the Sardar Sarovar Dam, the Statue of Unity is the world\'s tallest statue. Developed as a world-class eco-tourism destination in Kevadia (Ekta Nagar), it features a viewing gallery at 153m, Valley of Flowers, Butterfly Garden, Cactus Garden, Glow Garden, and Narmada River Cruise.',
    highlights: [
      'Statue Viewing Gallery at 153m height (Chest level)',
      'Sardar Sarovar Dam Viewpoint & Hydroelectric Project',
      'Valley of Flowers & Butterfly Park',
      'Jungle Safari & Pet Zone (170+ exotic bird & animal species)',
      'Ekta Cruise on Narmada River',
      'Night Laser Projection Show on Statue Surface',
    ],
    bestTimeToVisit: 'October to March',
    nearestAirport: 'Vadodara Airport (BDQ) — 90 km',
    nearestRailway: 'Ekta Nagar Railway Station (EKNR) — 5 km',
    idealDays: 2,
    activities: [
      { title: 'Viewing Gallery High-Speed Elevator Access', duration: '2 hours', price: '₹380 express ticket', verified: true },
      { title: 'Night Laser Sound & Light Show', duration: '1 hour', price: 'Included in entry', verified: true },
      { title: 'Narmada River Ekta Cruise', duration: '1.5 hours', price: '₹400 per person', verified: true },
    ],
    heroColor: 'from-cyan-700 to-slate-900',
  },
  {
    slug: 'saputara',
    name: 'Saputara Hill Station',
    region: 'South_Gujarat',
    durationHours: 36,
    tagline: 'Gujarat\'s Only Hill Station in the Western Ghats (Dang Forest)',
    description: 'Nestled in the Sahyadri mountains surrounded by lush forests, waterfalls, ropeways, and tribal heritage in Dang district.',
    overview: 'Saputara is a picturesque hill resort situated at an altitude of 1,000 meters in the Dang district of southern Gujarat. Known for mist-covered hills, Saputara Lake boating, Sunset Point, Gira Waterfalls, and rich tribal heritage of the Dang community.',
    highlights: [
      'Saputara Lake Boating & Promenade',
      'Pushpak Ropeway to Sunset Point',
      'Gira Waterfalls (30m drop in Waghai)',
      'Dang Tribal Museum & Craft Center',
      'Step Garden & Rose Garden',
    ],
    bestTimeToVisit: 'July to March (Monsoon & Winter are breathtaking)',
    nearestAirport: 'Surat Airport (STV) — 160 km',
    nearestRailway: 'Waghai Narrow Gauge — 50 km / Bilimora Junction — 110 km',
    idealDays: 2,
    activities: [
      { title: 'Saputara Lake Pedal Boating', duration: '1 hour', price: '₹100 boat fare', verified: true },
      { title: 'Pushpak Ropeway Ride to Sunrise Peak', duration: '1 hour', price: '₹70 ticket', verified: true },
      { title: 'Excursion to Gira Waterfalls', duration: '3 hours', price: 'Free', verified: true },
    ],
    heroColor: 'from-emerald-600 to-teal-900',
  },
];

export interface LandmarkItem {
  id: number;
  name: string;
  district: string;
  category: 'Heritage & Forts' | 'Pilgrimage & Temples' | 'Nature & Wildlife' | 'Beaches & Coast' | 'Modern & Cultural';
  description: string;
  image?: string;
}

export const GUJARAT_100_LANDMARKS: LandmarkItem[] = [
  // Ahmedabad (1-7)
  { id: 1, name: 'Sabarmati Ashram', district: 'Ahmedabad', category: 'Heritage & Forts', description: 'Historic headquarters of Mahatma Gandhi\'s freedom movement on Sabarmati River.', image: '/landmarks/sabarmati-ashram.jpg' },
  { id: 2, name: 'Sabarmati Riverfront', district: 'Ahmedabad', category: 'Modern & Cultural', description: 'World-class urban promenade with parks, walkways, and boating.', image: '/landmarks/sabarmati-riverfront.png' },
  { id: 3, name: 'Kankaria Lake', district: 'Ahmedabad', category: 'Modern & Cultural', description: 'Centuries-old circular lake featuring Nagina Wadi island, zoo, and toy train.', image: '/landmarks/kankaria-lake.jpg' },
  { id: 4, name: 'Adalaj Stepwell', district: 'Ahmedabad', category: 'Heritage & Forts', description: '15th-century intricate 5-storey Solanki-style sandstone stepwell (Vav).', image: '/landmarks/adalaj-stepwell-real.jpg' },
  { id: 5, name: 'Jama Masjid & Sidi Saiyyed Mosque', district: 'Ahmedabad', category: 'Heritage & Forts', description: '15th-century Solanki carved sandstone mosque & famous tree of life jali.', image: '/landmarks/jama-masjid-ahmedabad.jpg' },
  { id: 6, name: 'Science City', district: 'Ahmedabad', category: 'Modern & Cultural', description: 'Immersive robotics gallery, aquatic gallery, IMAX, and science exhibits.', image: '/landmarks/science-city-ahmedabad.jpg' },
  { id: 7, name: 'Atal Bridge', district: 'Ahmedabad', category: 'Modern & Cultural', description: 'Iconic pedestrian glass-floor bridge across Sabarmati River.', image: '/landmarks/atal-bridge-riverfront.jpg' },

  // Gandhinagar (8-12)
  { id: 8, name: 'Akshardham Temple', district: 'Gandhinagar', category: 'Pilgrimage & Temples', description: 'Grand pink sandstone complex dedicated to Lord Swaminarayan with water light show.', image: '/landmarks/akshardham-temple.jpg' },
  { id: 9, name: 'Trimandir Gandhinagar', district: 'Gandhinagar', category: 'Pilgrimage & Temples', description: 'Non-sectarian grand marble temple complex representing Jainism, Shaivism, and Vaishnavism.', image: '/landmarks/trimandir-gandhinagar.jpg' },
  { id: 10, name: 'Punit Van', district: 'Gandhinagar', category: 'Nature & Wildlife', description: 'Serene botanical garden featuring sacred trees, astrological groves, and lakeside fountains at sunset.', image: '/landmarks/punit-van-gandhinagar.jpg' },
  { id: 11, name: 'Sarita Udyan', district: 'Gandhinagar', category: 'Nature & Wildlife', description: 'Lush riverside botanical park along Sabarmati River with grand entrance arch.', image: '/landmarks/sarita-udyan.jpg' },
  { id: 12, name: 'Dandi Kutir', district: 'Gandhinagar', category: 'Modern & Cultural', description: 'World\'s largest salt-mound museum dedicated to Mahatma Gandhi\'s life.', image: '/landmarks/dandi-kutir.jpg' },

  // Kutch (13-24)
  { id: 13, name: 'Rann of Kutch', district: 'Kutch', category: 'Nature & Wildlife', description: 'World\'s largest white salt desert famous for full-moon magic and Rann Utsav.', image: '/bhuj-kutch-bg.jpg' },
  { id: 14, name: 'Kala Dungar', district: 'Kutch', category: 'Nature & Wildlife', description: 'Highest point in Kutch offering 360° panoramic views of the Great Rann.', image: '/landmarks/kala-dungar.jpg' },
  { id: 15, name: 'Mandvi Beach', district: 'Kutch', category: 'Beaches & Coast', description: 'Pristine golden beach with wind turbines, camel rides, and water sports.', image: '/places/mandvi-beach.jpg' },
  { id: 16, name: 'Vijay Vilas Palace', district: 'Kutch', category: 'Heritage & Forts', description: 'Royal Rajput sea palace carved in red sandstone at Mandvi.', image: '/places/vijay-vilas-palace.jpg' },
  { id: 17, name: 'Dholavira', district: 'Kutch', category: 'Heritage & Forts', description: 'UNESCO World Heritage Indus Valley Harappan metropolis.', image: '/places/dholavira.jpg' },
  { id: 18, name: 'Bhujodi', district: 'Kutch', category: 'Modern & Cultural', description: 'World-famous handicraft weaving village of Kutchi artisans.', image: '/landmarks/bhujodi-craft-village.jpg' },
  { id: 19, name: 'Aina Mahal', district: 'Kutch', category: 'Heritage & Forts', description: '18th-century Hall of Mirrors palace built by Ram Singh Malam.', image: '/places/aina-mahal.jpg' },
  { id: 20, name: 'Prag Mahal', district: 'Kutch', category: 'Heritage & Forts', description: 'Gothic-revival sandstone palace with 45-meter clock tower.', image: '/places/prag-mahal.jpg' },
  { id: 21, name: 'Kutch Museum', district: 'Kutch', category: 'Heritage & Forts', description: 'Oldest museum in Gujarat (est. 1877) displaying ancient tribal artifacts.', image: '/places/kutch-museum.jpg' },
  { id: 22, name: 'Narayan Sarovar', district: 'Kutch', category: 'Pilgrimage & Temples', description: 'One of Hinduism\'s 5 sacred holy lakes on the western border.', image: '/landmarks/narayan-sarovar.jpg' },
  { id: 23, name: 'Koteshwar Temple', district: 'Kutch', category: 'Pilgrimage & Temples', description: 'Ancient coastal Lord Shiva temple overlooking the Arabian Sea.', image: '/landmarks/koteshwar-temple.jpg' },
  { id: 24, name: 'Mata No Madh', district: 'Kutch', category: 'Pilgrimage & Temples', description: 'Historic 1200-year-old shrine of Ashapura Mata, patron deity of Kutch.', image: '/landmarks/mata-no-madh.jpg' },

  // Gir Somnath (25-30)
  { id: 25, name: 'Somnath Temple', district: 'Gir Somnath', category: 'Pilgrimage & Temples', description: 'First among the 12 sacred Shiva Jyotirlingas on the ocean coast.', image: '/landmarks/somnath-temple-real.png' },
  { id: 26, name: 'Somnath Beach', district: 'Gir Somnath', category: 'Beaches & Coast', description: 'Scenic coastal promenade with sea breeze and sunset views.', image: '/landmarks/somnath-beach.png' },
  { id: 27, name: 'Bhalka Tirth', district: 'Gir Somnath', category: 'Pilgrimage & Temples', description: 'Sacred spot where Lord Krishna concluded his earthly journey.', image: '/places/bhalka-tirth.jpg' },
  { id: 28, name: 'Triveni Sangam', district: 'Gir Somnath', category: 'Pilgrimage & Temples', description: 'Holy confluence of Hiran, Kapila, and Saraswati rivers into the sea.', image: '/landmarks/triveni-sangam-somnath.png' },
  { id: 29, name: 'Gir National Park', district: 'Gir Somnath', category: 'Nature & Wildlife', description: 'Exclusive global sanctuary of the wild Asiatic Lion.', image: '/places/sasan-gir-wildlife-sanctuary.jpg' },
  { id: 30, name: 'Devalia Safari Park', district: 'Gir Somnath', category: 'Nature & Wildlife', description: 'Gir interpretation zone for guaranteed lion and leopard sightings.', image: '/places/sasan-gir-safari.webp' },

  // Devbhumi Dwarka (31-36)
  { id: 31, name: 'Dwarkadhish Temple', district: 'Devbhumi Dwarka', category: 'Pilgrimage & Temples', description: 'Char Dham Jagat Mandir spire towering over Gomti Ghat.', image: '/places/dwarkadhish-temple.jpg' },
  { id: 32, name: 'Dwarka Beach', district: 'Devbhumi Dwarka', category: 'Beaches & Coast', description: 'Coastal promenade near Bhadkeshwar Mahadev sunset shrine.', image: '/landmarks/dwarka-beach.png' },
  { id: 33, name: 'Bet Dwarka', district: 'Devbhumi Dwarka', category: 'Pilgrimage & Temples', description: 'Island residence of Lord Krishna accessed by scenic ferry.', image: '/places/bet-dwarka.jpg' },
  { id: 34, name: 'Nageshwar Jyotirlinga', district: 'Devbhumi Dwarka', category: 'Pilgrimage & Temples', description: 'One of the 12 sacred Jyotirlingas featuring a colossal 85-ft Shiva statue.', image: '/places/nageshwar-jyotirlinga.jpg' },
  { id: 35, name: 'Shivrajpur Beach', district: 'Devbhumi Dwarka', category: 'Beaches & Coast', description: 'Blue Flag certified clear-water beach with scuba diving & dolphins.', image: '/landmarks/shivrajpur-beach-real.png' },
  { id: 36, name: 'Rukmini Temple', district: 'Devbhumi Dwarka', category: 'Pilgrimage & Temples', description: '12th-century stone temple dedicated to Lord Krishna\'s consort.', image: '/landmarks/rukmini-temple-dwarka.png' },

  // Junagadh (37-42)
  { id: 37, name: 'Girnar Hill', district: 'Junagadh', category: 'Pilgrimage & Temples', description: 'Sacred 9,999-step mountain peak with ropeway to Dattatreya & Jain temples.', image: '/places/girnar-hill.jpg' },
  { id: 38, name: 'Uparkot Fort', district: 'Junagadh', category: 'Heritage & Forts', description: '2,300-year-old citadel with Adi Kadi Vav stepwell & Buddhist caves.', image: '/landmarks/uparkot-fort-junagadh.jpg' },
  { id: 39, name: 'Mahabat Maqbara', district: 'Junagadh', category: 'Heritage & Forts', description: 'Gothic-Indo-Islamic mausoleum with spiral minarets.', image: '/landmarks/mahabat-maqbara.jpg' },
  { id: 40, name: 'Junagadh Buddhist Caves', district: 'Junagadh', category: 'Heritage & Forts', description: 'Rock-cut Buddhist monastic chambers dating back to Emperor Ashoka.', image: '/landmarks/junagadh-buddhist-caves.png' },
  { id: 41, name: 'Sakkarbaug Zoo', district: 'Junagadh', category: 'Nature & Wildlife', description: 'India\'s 2nd oldest zoo specializing in breeding Asiatic lions.', image: '/landmarks/sakkarbaug-zoo.jpg' },
  { id: 42, name: 'Damodar Kund', district: 'Junagadh', category: 'Pilgrimage & Temples', description: 'Holy bathing ghat at the foot of Girnar sacred to Poet Narsinh Mehta.', image: '/landmarks/damodar-kund-junagadh.jpg' },

  // Surat (43-48)
  { id: 43, name: 'Dumas Beach', district: 'Surat', category: 'Beaches & Coast', description: 'Black-sand urban beach famous for local street food and sunsets.', image: '/landmarks/dumas-beach-surat.png' },
  { id: 44, name: 'Suvali Beach', district: 'Surat', category: 'Beaches & Coast', description: 'Quiet coastal stretch historic for the 1612 Battle of Swally.', image: '/landmarks/suvali-beach-surat.png' },
  { id: 45, name: 'Dutch Garden', district: 'Surat', category: 'Heritage & Forts', description: 'Colonial 17th-century European cemetery and manicured park.', image: '/landmarks/dutch-garden-surat.png' },
  { id: 46, name: 'Surat Castle', district: 'Surat', category: 'Heritage & Forts', description: '16th-century fortress on Tapi river built by Khudawand Khan.', image: '/landmarks/surat-castle.png' },
  { id: 47, name: 'Sarthana Nature Park', district: 'Surat', category: 'Nature & Wildlife', description: 'Zoo and botanical park on the banks of the Tapi River.', image: '/landmarks/sarthana-nature-park.jpg' },
  { id: 48, name: 'Gopi Talav', district: 'Surat', category: 'Modern & Cultural', description: 'Historic urban lake and recreation garden in central Surat.', image: '/landmarks/gopi-talav-surat.jpg' },

  // Vadodara (49-54)
  { id: 49, name: 'Laxmi Vilas Palace', district: 'Vadodara', category: 'Heritage & Forts', description: '4x size of Buckingham Palace, grand Indo-Saracenic home of Gaekwads.', image: '/landmarks/laxmi-vilas-palace.jpg' },
  { id: 50, name: 'Sayaji Garden', district: 'Vadodara', category: 'Nature & Wildlife', description: '113-acre royal park with toy train, planetarium, and zoo.', image: '/landmarks/sayaji-garden.jpg' },
  { id: 51, name: 'Baroda Museum', district: 'Vadodara', category: 'Heritage & Forts', description: 'Famous for blue whale skeleton, Egyptian mummy, and European art.', image: '/landmarks/baroda-museum.jpg' },
  { id: 52, name: 'Kirti Mandir', district: 'Vadodara', category: 'Heritage & Forts', description: 'Royal cenotaph complex of the Gaekwad dynasty.', image: '/landmarks/kirti-mandir-vadodara.jpg' },
  { id: 53, name: 'EME Temple', district: 'Vadodara', category: 'Pilgrimage & Temples', description: 'Unique aluminum-clad geodesic dome temple maintained by Indian Army.', image: '/landmarks/eme-temple.jpg' },
  { id: 54, name: 'Sursagar Lake', district: 'Vadodara', category: 'Modern & Cultural', description: 'Historic lake featuring a 111-ft tall standing Lord Shiva statue.', image: '/landmarks/sursagar-lake.jpg' },

  // Narmada (55-61)
  { id: 55, name: 'Statue of Unity', district: 'Narmada', category: 'Modern & Cultural', description: 'World\'s tallest 182m statue of Sardar Patel in Ekta Nagar.', image: '/landmarks/statue-of-unity.jpg' },
  { id: 56, name: 'Valley of Flowers', district: 'Narmada', category: 'Nature & Wildlife', description: '17-kilometer colorful botanical trail along Narmada Dam.', image: '/landmarks/valley-of-flowers.jpg' },
  { id: 57, name: 'Ekta Nagar', district: 'Narmada', category: 'Modern & Cultural', description: 'World-class eco-tourism city with river cruise, glow garden & maze.', image: '/landmarks/statue-of-unity.jpg' },
  { id: 58, name: 'Zarwani Waterfall', district: 'Narmada', category: 'Nature & Wildlife', description: 'Scenic forest waterfall deep inside Shoolpaneshwar Sanctuary.', image: '/landmarks/zarwani-waterfall.jpg' },
  { id: 59, name: 'Shoolpaneshwar Wildlife Sanctuary', district: 'Narmada', category: 'Nature & Wildlife', description: 'Dense deciduous teak forest and biodiversity hotspot.', image: '/landmarks/shoolpaneshwar-wildlife-sanctuary.jpg' },
  { id: 60, name: 'Cactus Garden', district: 'Narmada', category: 'Nature & Wildlife', description: 'Architectural conservatory featuring 500+ desert cactus species.', image: '/landmarks/cactus-garden.jpg' },
  { id: 61, name: 'Jungle Safari (Ekta Nagar)', district: 'Narmada', category: 'Nature & Wildlife', description: 'Open-air zoological park with 170+ exotic animal species.', image: '/landmarks/jungle-safari.jpg' },

  // Banaskantha (62-66)
  { id: 62, name: 'Ambaji Temple', district: 'Banaskantha', category: 'Pilgrimage & Temples', description: 'Major 51 Shakti Peeth shrine worshipping Viso Yantra.', image: '/landmarks/ambaji-temple.jpg' },
  { id: 63, name: 'Gabbar Hill', district: 'Banaskantha', category: 'Pilgrimage & Temples', description: 'Holy hilltop reached by ropeway with 51 Shaktipeeth replica circuit.', image: '/landmarks/gabbar-hill.png' },
  { id: 64, name: 'Balaram Palace', district: 'Banaskantha', category: 'Heritage & Forts', description: 'Neoclassical heritage palace resort of the Nawabs of Palanpur.', image: '/landmarks/balaram-palace.jpg' },
  { id: 65, name: 'Balaram Wildlife Sanctuary', district: 'Banaskantha', category: 'Nature & Wildlife', description: 'Hilly sanctuary protecting leopards, sloth bears, and striped hyenas.', image: '/landmarks/balaram-wildlife-sanctuary.jpg' },
  { id: 66, name: 'Jessore Sloth Bear Sanctuary', district: 'Banaskantha', category: 'Nature & Wildlife', description: 'Aravalli mountain reserve dedicated to sloth bear conservation.', image: '/landmarks/jessore-sloth-bear-sanctuary.avif' },

  // Patan (67-70)
  { id: 67, name: 'Rani Ki Vav', district: 'Patan', category: 'Heritage & Forts', description: 'UNESCO World Heritage 7-storey inverted stepwell depicting Lord Vishnu.', image: '/landmarks/rani-ki-vav.jpg' },
  { id: 68, name: 'Patola Heritage Museum', district: 'Patan', category: 'Modern & Cultural', description: 'Live workshop of double-Ikat Patola silk weaving masters.', image: '/landmarks/patola-heritage-museum.jpg' },
  { id: 69, name: 'Sahastralinga Talav', district: 'Patan', category: 'Heritage & Forts', description: 'Medieval water reservoir featuring 1,000 Shiva shrines.', image: '/landmarks/sahastralinga-talav.jpg' },
  { id: 70, name: 'Modhera Sun Temple (Patan Circuit)', district: 'Patan', category: 'Heritage & Forts', description: 'Solanki-era architectural masterpiece on Pushpavati River.', image: '/landmarks/modhera-sun-temple-patan.jpg' },

  // Mehsana (71-75)
  { id: 71, name: 'Modhera Sun Temple', district: 'Mehsana', category: 'Heritage & Forts', description: '11th-century Sun God temple with Surya Kund stepwell.', image: '/landmarks/modhera-sun-temple-patan.jpg' },
  { id: 72, name: 'Shankus Water Park', district: 'Mehsana', category: 'Modern & Cultural', description: 'Pioneer water theme park resort near Ahmedabad-Mehsana highway.', image: '/landmarks/shankus-water-park.jpg' },
  { id: 73, name: 'Taranga Hill', district: 'Mehsana', category: 'Pilgrimage & Temples', description: 'Ancient Jain pilgrimage hill featuring 12th-century Ajitnath temple.', image: '/landmarks/taranga-hill.jpg' },
  { id: 74, name: 'Vadnagar', district: 'Mehsana', category: 'Heritage & Forts', description: '2,500-year-old living heritage town with Buddhist monastery excavations.', image: '/landmarks/vadnagar.avif' },
  { id: 75, name: 'Kirti Toran', district: 'Mehsana', category: 'Heritage & Forts', description: '40-ft red sandstone victory arches in Vadnagar.', image: '/landmarks/kirti-toran.jpg' },

  // Sabarkantha (76-79)
  { id: 76, name: 'Polo Forest', district: 'Sabarkantha', category: 'Nature & Wildlife', description: 'Ancient 15th-century temple ruins nestled in Vijaynagar hills.', image: '/landmarks/polo-forest-sabarkantha.jpg' },
  { id: 77, name: 'Idar Fort', district: 'Sabarkantha', category: 'Heritage & Forts', description: 'Hilltop fort fortress on granite boulders known for wooden toys.', image: '/landmarks/idar-fort.jpg' },
  { id: 78, name: 'Shamlaji Temple', district: 'Sabarkantha', category: 'Pilgrimage & Temples', description: '11th-century Vishnu temple on Meshwo River bank.', image: '/landmarks/shamlaji-temple.jpg' },
  { id: 79, name: 'Vijaynagar Forest', district: 'Sabarkantha', category: 'Nature & Wildlife', description: 'Lush forest reserve with river streams and ancient ruins.', image: '/landmarks/vijaynagar-forest.jpg' },

  // Aravalli (80-83)
  { id: 80, name: 'Shamlaji Temple (Aravalli Region)', district: 'Aravalli', category: 'Pilgrimage & Temples', description: 'Historic pilgrimage site hosting annual Shamlaji fair.', image: '/landmarks/shamlaji-temple.jpg' },
  { id: 81, name: 'Poshina', district: 'Aravalli', category: 'Modern & Cultural', description: 'Tribal village famous for terracotta horse shrines.', image: '/landmarks/polo-forest-sabarkantha.jpg' },
  { id: 82, name: 'Dev Ni Mori', district: 'Aravalli', category: 'Heritage & Forts', description: 'Important Buddhist stupa and monastery excavation site.', image: '/landmarks/shamlaji-temple.jpg' },
  { id: 83, name: 'Ratanpur', district: 'Aravalli', category: 'Nature & Wildlife', description: 'Border forest hills along Rajasthan line.', image: '/landmarks/ratanpur.jpg' },

  // Dang (84-89)
  { id: 84, name: 'Saputara', district: 'Dang', category: 'Nature & Wildlife', description: 'Gujarat\'s premiere hill station in the Sahyadri Western Ghats.', image: '/landmarks/saputara.jpg' },
  { id: 85, name: 'Gira Waterfall', district: 'Dang', category: 'Nature & Wildlife', description: '30-meter roaring waterfall near Waghai in Dang forest.', image: '/landmarks/gira-waterfall.jpg' },
  { id: 86, name: 'Vansda National Park', district: 'Dang', category: 'Nature & Wildlife', description: 'Dense tropical rainforest with giant bamboo and leopards.', image: '/landmarks/vansda-national-park.jpg' },
  { id: 87, name: 'Purna Wildlife Sanctuary', district: 'Dang', category: 'Nature & Wildlife', description: 'Dense bamboo forests and wildlife reserve in Mahal, Dang.', image: '/landmarks/vansda-national-park.jpg' },
  { id: 88, name: 'Saputara Lake', district: 'Dang', category: 'Nature & Wildlife', description: 'Picturesque mountain lake offering boating and lakefront gardens.', image: '/landmarks/saputara.jpg' },
  { id: 89, name: 'Sunset Point, Saputara', district: 'Dang', category: 'Nature & Wildlife', description: 'Panoramic peak overlooking the Dang forest valleys at sunset.', image: '/landmarks/sunset-point-saputara.jpg' },

  // Navsari (90-93)
  { id: 90, name: 'Dandi Beach', district: 'Navsari', category: 'Beaches & Coast', description: 'Historic coastal beach where Mahatma Gandhi concluded the Dandi Salt March.', image: '/landmarks/dandi-beach.jpg' },
  { id: 91, name: 'National Salt Satyagraha Memorial Dandi', district: 'Navsari', category: 'Heritage & Forts', description: 'Grand national memorial honoring Mahatma Gandhi and 80 Marchers.', image: '/landmarks/dandi-memorial.jpg' },
  { id: 92, name: 'Vansda National Park (Navsari Circuit)', district: 'Navsari', category: 'Nature & Wildlife', description: 'Protected forest reserve bordering Navsari and Dang districts.', image: '/landmarks/vansda-national-park.jpg' },
  { id: 93, name: 'Unai Hot Springs', district: 'Navsari', category: 'Pilgrimage & Temples', description: 'Sacred natural thermal sulfur hot springs and Unai Mata Temple.', image: '/landmarks/unai-hot-springs.jpg' },

  // Bharuch (94-96)
  { id: 94, name: 'Kabirvad', district: 'Bharuch', category: 'Nature & Wildlife', description: 'Massive several-hundred-year-old banyan tree island on Narmada River.', image: '/landmarks/kabirvad.jpg' },
  { id: 95, name: 'Golden Bridge', district: 'Bharuch', category: 'Heritage & Forts', description: '1881 historic iron bridge across Narmada River connecting Ankleshwar & Bharuch.', image: '/landmarks/golden-bridge.jpg' },
  { id: 96, name: 'Shuklatirth', district: 'Bharuch', category: 'Pilgrimage & Temples', description: 'Ancient holy pilgrimage center on the banks of Narmada River.', image: '/landmarks/shuklatirth.jpg' },

  // Panchmahal (97-99)
  { id: 97, name: 'Pavagadh Hill', district: 'Panchmahal', category: 'Pilgrimage & Temples', description: 'Volcanic hill peak featuring Kalika Mata temple and ropeway ride.', image: '/landmarks/pavagadh-hill.jpg' },
  { id: 98, name: 'Kalika Mata Temple Pavagadh', district: 'Panchmahal', category: 'Pilgrimage & Temples', description: 'Revered Shakti Peeth shrine perched atop Pavagadh peak.', image: '/landmarks/kalika-mata-temple.jpg' },
  { id: 99, name: 'Champaner Archaeological Park', district: 'Panchmahal', category: 'Heritage & Forts', description: 'UNESCO World Heritage site with medieval Sultanate mosques and fort ruins.', image: '/places/champaner-pavagadh.jpg' },

  // Rajkot (100)
  { id: 100, name: 'Watson Museum / Jubilee Garden', district: 'Rajkot', category: 'Heritage & Forts', description: 'Colonial museum in Jubilee Garden housing rare Saurashtra artifacts.', image: '/landmarks/watson-museum.jpg' },
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return GUJARAT_DESTINATIONS.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
}

