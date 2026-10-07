export interface SearchResultItem {
  id: string;
  type: 'PACKAGE' | 'DESTINATION' | 'HOTEL' | 'FLIGHT' | 'BUS' | 'TRAIN' | 'ACTIVITY';
  title: string;
  subtitle: string;
  slugOrId: string;
  priceInr?: number;
  rating?: number;
  imageUrl?: string;
  tag?: string;
  url: string;
}

export async function searchGlobalMarketplace(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();
  const results: SearchResultItem[] = [];

  try {
    // 1. Query Packages API
    const pkgRes = await fetch(`/api/v1/packages?search=${encodeURIComponent(q)}`);
    if (pkgRes.ok) {
      const json = await pkgRes.json();
      if (json && json.data) {
        json.data.forEach((p: any) => {
          results.push({
            id: p.id || p.slug,
            type: 'PACKAGE',
            title: p.title,
            subtitle: `${p.durationDays}D/${p.durationNights}N • ${p.destinationName}`,
            slugOrId: p.slug,
            priceInr: p.discountedPrice || p.startingPrice,
            rating: p.rating,
            imageUrl: p.coverImage || p.primaryImageUrl || p.heroImageUrl,
            tag: p.domesticOrInternational === 'INTERNATIONAL' ? '✈️ International Package' : '🇮🇳 India Package',
            url: `/packages/${p.slug}`,
          });
        });
      }
    }
  } catch (e) {
    console.warn('Global search packages error:', e);
  }

  // 2. Query Destinations (Local Matching)
  const knownDestinations = [
    { name: 'Goa', slug: 'goa', state: 'Goa', tag: 'Beach & Nightlife', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80' },
    { name: 'Kutch / Dhordo', slug: 'kutch', state: 'Gujarat', tag: 'White Desert', img: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=800&q=80' },
    { name: 'Manali', slug: 'manali', state: 'Himachal Pradesh', tag: 'Snow & Mountains', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80' },
    { name: 'Udaipur', slug: 'udaipur', state: 'Rajasthan', tag: 'Royal Lakes', img: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&q=80' },
    { name: 'Dwarka', slug: 'dwarka', state: 'Gujarat', tag: 'Char Dham Shrine', img: 'https://images.unsplash.com/photo-1609946782109-bf271853843d?w=800&q=80' },
    { name: 'Leh Ladakh', slug: 'leh-ladakh', state: 'Ladakh (UT)', tag: 'Himalayan Pass', img: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&q=80' },
    { name: 'Bali', slug: 'bali', state: 'Indonesia', tag: 'Tropical Paradise', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  ];

  knownDestinations.forEach(d => {
    if (d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q)) {
      results.push({
        id: `dest-${d.slug}`,
        type: 'DESTINATION',
        title: d.name,
        subtitle: `${d.state} • ${d.tag}`,
        slugOrId: d.slug,
        imageUrl: d.img,
        tag: '📍 Destination Guide',
        url: `/destinations/${d.slug}`,
      });

      // Also generate quick transport option results for search
      results.push({
        id: `flight-amd-${d.slug}`,
        type: 'FLIGHT',
        title: `Ahmedabad to ${d.name} Flights`,
        subtitle: 'Daily Direct Flights • Instant Fare Check',
        slugOrId: `flight-${d.slug}`,
        priceInr: 3499,
        tag: '✈️ Direct Flight',
        url: `/flights?destination=${encodeURIComponent(d.name)}`,
      });

      results.push({
        id: `train-amd-${d.slug}`,
        type: 'TRAIN',
        title: `Ahmedabad to ${d.name} Express Train`,
        subtitle: 'IRCTC Express & Vande Bharat Express',
        slugOrId: `train-${d.slug}`,
        priceInr: 850,
        tag: '🚆 IRCTC Express',
        url: `/trains?destination=${encodeURIComponent(d.name)}`,
      });
    }
  });

  return results;
}
