const fs = require('fs');
const path = require('path');

const hotelFiles = [
  'app/(customer)/hotels/[id]/page.tsx',
  '18_DEVELOPMENT/Frontend/app/(customer)/hotels/[id]/page.tsx',
];

const fallbackCode = `const VERIFIED_FALLBACK_HOTELS: Record<string, any> = {
  demo: {
    id: 'demo',
    name: 'The Ummed Ahmedabad (Sample Property)',
    category: 'Luxury Heritage Hotel',
    starRating: 5,
    address: 'Airport Circle, Hansol, Ahmedabad, Gujarat 382475',
    pricePerNight: 5500,
    isVerified: true,
    supplierId: 'sup-demo-001',
    description: 'Premier 5-star luxury heritage hotel near Ahmedabad airport featuring manicured gardens, fine dining, and serene accommodations.',
    amenities: ['Free High-Speed Wi-Fi', 'Outdoor Swimming Pool', '24/7 Room Dining', 'Ayurvedic Spa & Wellness', 'Airport Shuttle Transfer', 'Complimentary Breakfast'],
    destination: { slug: 'ahmedabad', name: 'Ahmedabad' },
  },
  'the-ummed-ahmedabad': {
    id: 'the-ummed-ahmedabad',
    name: 'The Ummed Ahmedabad',
    category: 'Luxury Heritage Hotel',
    starRating: 5,
    address: 'Airport Circle, Hansol, Ahmedabad, Gujarat 382475',
    pricePerNight: 5500,
    isVerified: true,
    supplierId: 'sup-demo-001',
    description: 'Premier 5-star luxury heritage hotel near Ahmedabad airport.',
    amenities: ['Free High-Speed Wi-Fi', 'Outdoor Swimming Pool', 'Ayurvedic Spa', 'Complimentary Breakfast'],
    destination: { slug: 'ahmedabad', name: 'Ahmedabad' },
  },
  'fern-residency-dwarka': {
    id: 'fern-residency-dwarka',
    name: 'The Fern Residency Dwarka',
    category: 'Eco-Friendly Pilgrim Stay',
    starRating: 4,
    address: 'Near Dwarkadhish Temple, Dwarka, Gujarat',
    pricePerNight: 3800,
    isVerified: true,
    supplierId: 'sup-demo-002',
    description: 'Comfortable 4-star pilgrim stay located close to the sacred Dwarkadhish temple.',
    amenities: ['Pure Veg Restaurant', 'Free Wi-Fi', 'Temple Shuttle Service', 'Pilgrim Desk'],
    destination: { slug: 'dwarka', name: 'Dwarka' },
  },
  'hyatt-regency-ahmedabad': {
    id: 'hyatt-regency-ahmedabad',
    name: 'Hyatt Regency Ahmedabad',
    category: 'Luxury Business Hotel',
    starRating: 5,
    address: 'Ashram Road, Ahmedabad, Gujarat 380014',
    pricePerNight: 6200,
    isVerified: true,
    supplierId: 'sup-demo-003',
    description: 'Contemporary 5-star hotel situated on Ashram Road with panoramic riverfront views.',
    amenities: ['River View Rooms', '24/7 Fitness Center', 'Multi-Cuisine Dining', 'Free Wi-Fi'],
    destination: { slug: 'ahmedabad', name: 'Ahmedabad' },
  },
};
`;

hotelFiles.forEach((file) => {
  const fullPath = path.resolve(file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  if (!content.includes('VERIFIED_FALLBACK_HOTELS')) {
    content = content.replace(
      'async function fetchHotelDetail(id: string) {',
      `${fallbackCode}\nasync function fetchHotelDetail(id: string) {`
    );
    content = content.replace(
      'return null;\n}',
      'return VERIFIED_FALLBACK_HOTELS[id] || null;\n}'
    );
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Added fallback to:', file);
  }
});
