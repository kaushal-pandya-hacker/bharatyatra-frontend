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

export function getDestinationBySlug(slug: string): Destination | undefined {
  return GUJARAT_DESTINATIONS.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
}
