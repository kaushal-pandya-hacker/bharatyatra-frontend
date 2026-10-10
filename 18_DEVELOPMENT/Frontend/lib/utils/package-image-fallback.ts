/**
 * BharatYatra Package Image Resolver & Fallback System
 * Ensures seamless display of destination hero imagery without broken image links.
 */

const REGION_FALLBACK_IMAGES: Record<string, string> = {
  'Gujarat': 'https://images.unsplash.com/photo-1609946782109-bf271853843d?auto=format&fit=crop&w=1200&q=80',
  'Kutch': 'https://images.unsplash.com/photo-1609946782109-bf271853843d?auto=format&fit=crop&w=1200&q=80',
  'Dwarka': 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
  'Somnath': 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
  'Statue of Unity': 'https://images.unsplash.com/photo-1627894006066-b45786049288?auto=format&fit=crop&w=1200&q=80',
  'Gir': 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80',
  'Rajasthan': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'Jaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'Taj Mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'Jaisalmer': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
  'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  'Himachal Pradesh': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'Shimla': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'Uttarakhand': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
  'Kedarnath': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
  'Kashmir': 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
  'Ladakh': 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
  'Assam': 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
  'Meghalaya': 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
  'Odisha': 'https://images.unsplash.com/photo-1608889825103-703a9855b550?auto=format&fit=crop&w=1200&q=80',
  'DEFAULT': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
};

export function getPackageImageUrl(
  providedUrl?: string,
  stateOrDestination?: string,
  fallbackIndex: number = 0
): string {
  if (providedUrl && providedUrl.startsWith('http')) {
    return providedUrl;
  }

  if (stateOrDestination && REGION_FALLBACK_IMAGES[stateOrDestination]) {
    return REGION_FALLBACK_IMAGES[stateOrDestination];
  }

  // Check state match
  if (stateOrDestination) {
    for (const [key, url] of Object.entries(REGION_FALLBACK_IMAGES)) {
      if (stateOrDestination.toLowerCase().includes(key.toLowerCase())) {
        return url;
      }
    }
  }

  return REGION_FALLBACK_IMAGES['DEFAULT'];
}
