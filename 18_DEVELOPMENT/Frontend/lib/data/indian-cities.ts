export interface CityItem {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  popular?: boolean;
}

export const INDIAN_CITIES: CityItem[] = [
  // Gujarat Major Cities & Towns
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, popular: true },
  { city: 'Dholka', state: 'Gujarat', country: 'India', latitude: 22.7214, longitude: 72.4633, popular: true },
  { city: 'Sanand', state: 'Gujarat', country: 'India', latitude: 22.9868, longitude: 72.3800 },
  { city: 'Bavla', state: 'Gujarat', country: 'India', latitude: 22.8340, longitude: 72.3610 },
  { city: 'Viramgam', state: 'Gujarat', country: 'India', latitude: 23.1206, longitude: 72.0577 },
  { city: 'Dhandhuka', state: 'Gujarat', country: 'India', latitude: 22.3670, longitude: 71.9840 },
  { city: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, popular: true },
  { city: 'Vadodara', state: 'Gujarat', country: 'India', latitude: 22.3072, longitude: 73.1812, popular: true },
  { city: 'Rajkot', state: 'Gujarat', country: 'India', latitude: 22.3039, longitude: 70.8022, popular: true },
  { city: 'Gandhinagar', state: 'Gujarat', country: 'India', latitude: 23.2156, longitude: 72.6369, popular: true },
  { city: 'Bhavnagar', state: 'Gujarat', country: 'India', latitude: 21.7645, longitude: 72.1519 },
  { city: 'Jamnagar', state: 'Gujarat', country: 'India', latitude: 22.4707, longitude: 70.0577 },
  { city: 'Junagadh', state: 'Gujarat', country: 'India', latitude: 21.5222, longitude: 70.4579 },
  { city: 'Bhuj', state: 'Gujarat', country: 'India', latitude: 23.2420, longitude: 69.6669, popular: true },
  { city: 'Anand', state: 'Gujarat', country: 'India', latitude: 22.5645, longitude: 72.9289 },
  { city: 'Bharuch', state: 'Gujarat', country: 'India', latitude: 21.7051, longitude: 72.9959 },
  { city: 'Mehsana', state: 'Gujarat', country: 'India', latitude: 23.5880, longitude: 72.3693 },
  { city: 'Navsari', state: 'Gujarat', country: 'India', latitude: 20.9500, longitude: 72.9300 },
  { city: 'Valsad', state: 'Gujarat', country: 'India', latitude: 20.5992, longitude: 72.9342 },
  { city: 'Porbandar', state: 'Gujarat', country: 'India', latitude: 21.6417, longitude: 69.6293 },
  { city: 'Dwarka', state: 'Gujarat', country: 'India', latitude: 22.2442, longitude: 68.9685, popular: true },
  { city: 'Veraval', state: 'Gujarat', country: 'India', latitude: 20.9000, longitude: 70.3667 },
  { city: 'Somnath', state: 'Gujarat', country: 'India', latitude: 20.8880, longitude: 70.4012, popular: true },
  { city: 'Ekta Nagar', state: 'Gujarat', country: 'India', latitude: 21.8380, longitude: 73.7191, popular: true },
  { city: 'Patan', state: 'Gujarat', country: 'India', latitude: 23.8493, longitude: 72.1266 },
  { city: 'Ambaji', state: 'Gujarat', country: 'India', latitude: 24.3273, longitude: 72.8488 },
  { city: 'Saputara', state: 'Gujarat', country: 'India', latitude: 20.5756, longitude: 73.7486, popular: true },
  { city: 'Godhra', state: 'Gujarat', country: 'India', latitude: 22.7766, longitude: 73.6150 },
  { city: 'Morbi', state: 'Gujarat', country: 'India', latitude: 22.8173, longitude: 70.8368 },
  { city: 'Surendranagar', state: 'Gujarat', country: 'India', latitude: 22.7272, longitude: 71.6370 },
  { city: 'Amreli', state: 'Gujarat', country: 'India', latitude: 21.6022, longitude: 71.2186 },
  { city: 'Palanpur', state: 'Gujarat', country: 'India', latitude: 24.1724, longitude: 72.4346 },
  { city: 'Nadiad', state: 'Gujarat', country: 'India', latitude: 22.6916, longitude: 72.8634 },
  { city: 'Vapi', state: 'Gujarat', country: 'India', latitude: 20.3717, longitude: 72.9037 },
  { city: 'Diu', state: 'Daman and Diu', country: 'India', latitude: 20.7144, longitude: 70.9874, popular: true },
  { city: 'Daman', state: 'Daman and Diu', country: 'India', latitude: 20.3974, longitude: 72.8328 },

  // Andhra Pradesh & Telangana
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, popular: true },
  { city: 'Araku Valley', state: 'Andhra Pradesh', country: 'India', latitude: 18.3273, longitude: 82.8778, popular: true },
  { city: 'Borra Caves', state: 'Andhra Pradesh', country: 'India', latitude: 18.2778, longitude: 83.0378, popular: true },
  { city: 'Alluri Sitharama Raju', state: 'Andhra Pradesh', country: 'India', latitude: 18.2778, longitude: 82.8778 },
  { city: 'Tirupati', state: 'Andhra Pradesh', country: 'India', latitude: 13.6288, longitude: 79.4192, popular: true },

  // Union Territories & South India
  { city: 'Puducherry', state: 'Puducherry', country: 'India', latitude: 11.9416, longitude: 79.8083, popular: true },
  { city: 'Munnar', state: 'Kerala', country: 'India', latitude: 10.0889, longitude: 77.0595, popular: true },
  { city: 'Ooty', state: 'Tamil Nadu', country: 'India', latitude: 11.4102, longitude: 76.6950, popular: true },
  { city: 'Coorg', state: 'Karnataka', country: 'India', latitude: 12.4244, longitude: 75.7382, popular: true },

  // Maharashtra & Western India
  { city: 'Lonavala', state: 'Maharashtra', country: 'India', latitude: 18.7557, longitude: 73.4091, popular: true },
  { city: 'Mahabaleshwar', state: 'Maharashtra', country: 'India', latitude: 17.9237, longitude: 73.6586 },

  // Hill Stations & North/East
  { city: 'Darjeeling', state: 'West Bengal', country: 'India', latitude: 27.0410, longitude: 88.2663, popular: true },
  { city: 'Gangtok', state: 'Sikkim', country: 'India', latitude: 27.3389, longitude: 88.6065, popular: true },
  { city: 'Leh', state: 'Ladakh', country: 'India', latitude: 34.1526, longitude: 77.5771, popular: true },
  { city: 'Dharamshala', state: 'Himachal Pradesh', country: 'India', latitude: 32.2190, longitude: 76.3234 },

  // Metro & Major Indian Cities
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, popular: true },
  { city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, popular: true },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882 },
  { city: 'Nashik', state: 'Maharashtra', country: 'India', latitude: 19.9975, longitude: 73.7898 },
  { city: 'Thane', state: 'Maharashtra', country: 'India', latitude: 19.2183, longitude: 72.9781 },
  { city: 'Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, popular: true },
  { city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, popular: true },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, popular: true },
  { city: 'Mysuru', state: 'Karnataka', country: 'India', latitude: 12.2958, longitude: 76.6394 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, popular: true },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, popular: true },
  { city: 'Udaipur', state: 'Rajasthan', country: 'India', latitude: 24.5854, longitude: 73.7125, popular: true },
  { city: 'Jodhpur', state: 'Rajasthan', country: 'India', latitude: 26.2389, longitude: 73.0243 },
  { city: 'Mount Abu', state: 'Rajasthan', country: 'India', latitude: 24.5926, longitude: 74.7185 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, popular: true },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, popular: true },
  { city: 'Panaji', state: 'Goa', country: 'India', latitude: 15.4989, longitude: 73.8278, popular: true },
  { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126 },
  { city: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, popular: true },
  { city: 'Ujjain', state: 'Madhya Pradesh', country: 'India', latitude: 23.1765, longitude: 75.7885 },
  { city: 'Gwalior', state: 'Madhya Pradesh', country: 'India', latitude: 26.2183, longitude: 78.1828 },
  { city: 'Chandigarh', state: 'Punjab', country: 'India', latitude: 30.7333, longitude: 76.7794 },
  { city: 'Amritsar', state: 'Punjab', country: 'India', latitude: 31.6340, longitude: 74.8723 },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462 },
  { city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, popular: true },
  { city: 'Agra', state: 'Uttar Pradesh', country: 'India', latitude: 27.1767, longitude: 78.0081, popular: true },
  { city: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', latitude: 26.7922, longitude: 82.1998 },
  { city: 'Prayagraj', state: 'Uttar Pradesh', country: 'India', latitude: 25.4358, longitude: 81.8463 },
  { city: 'Dehradun', state: 'Uttarakhand', country: 'India', latitude: 30.3165, longitude: 78.0322 },
  { city: 'Rishikesh', state: 'Uttarakhand', country: 'India', latitude: 30.0869, longitude: 78.2676 },
  { city: 'Haridwar', state: 'Uttarakhand', country: 'India', latitude: 29.9457, longitude: 78.1642 },
  { city: 'Shimla', state: 'Himachal Pradesh', country: 'India', latitude: 31.1048, longitude: 77.1734 },
  { city: 'Manali', state: 'Himachal Pradesh', country: 'India', latitude: 32.2432, longitude: 77.1892 },
  { city: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', latitude: 34.0837, longitude: 74.7973 },
  { city: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673 },
  { city: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366 },
  { city: 'Guwahati', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, popular: true },
  { city: 'Barpeta', state: 'Assam', country: 'India', latitude: 26.3240, longitude: 91.0064, popular: true },
  { city: 'Kaziranga', state: 'Assam', country: 'India', latitude: 26.5775, longitude: 93.1711, popular: true },
  { city: 'Shillong', state: 'Meghalaya', country: 'India', latitude: 25.5788, longitude: 91.8933, popular: true },
  { city: 'Silchar', state: 'Assam', country: 'India', latitude: 24.8333, longitude: 92.7789 },
  { city: 'Jorhat', state: 'Assam', country: 'India', latitude: 26.7509, longitude: 94.2037 },
  { city: 'Tezpur', state: 'Assam', country: 'India', latitude: 26.6338, longitude: 92.8000 },
  { city: 'Dibrugarh', state: 'Assam', country: 'India', latitude: 27.4728, longitude: 94.9120 },
];

export function searchCities(query: string): CityItem[] {
  if (!query || !query.trim()) {
    return INDIAN_CITIES.filter((c) => c.popular).slice(0, 8);
  }
  const clean = query.trim().toLowerCase();
  return INDIAN_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(clean) ||
      c.state.toLowerCase().includes(clean)
  ).slice(0, 10);
}

export function resolveCityCoordinates(cityName: string): CityItem {
  if (!cityName) return INDIAN_CITIES[1]; // Default Dholka
  const clean = cityName.trim().toLowerCase();

  // 1. Exact match
  let match = INDIAN_CITIES.find(
    (c) => c.city.toLowerCase() === clean
  );
  if (match) return match;

  // 2. Substring match (e.g. "Borra Caves, Alluri Sitharama Raju" -> matches "Borra Caves")
  match = INDIAN_CITIES.find(
    (c) => clean.includes(c.city.toLowerCase()) || c.city.toLowerCase().includes(clean)
  );
  if (match) return match;

  // 3. Match state
  match = INDIAN_CITIES.find(
    (c) => clean.includes(c.state.toLowerCase())
  );
  if (match) return match;

  // Default fallback for unmatched city
  return {
    city: cityName,
    state: 'India',
    country: 'India',
    latitude: 22.7214,
    longitude: 72.4633,
  };
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<CityItem> {
  let closest: CityItem = INDIAN_CITIES[0];
  let minDistance = Infinity;

  for (const c of INDIAN_CITIES) {
    const dLat = (c.latitude - latitude) * 111;
    const dLng = (c.longitude - longitude) * 111 * Math.cos((latitude * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  if (minDistance <= 35) {
    return closest;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BharatYatra-Travel-App/1.0' },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.district || addr.county || closest.city;
      const stateName = addr.state || closest.state;
      const countryName = addr.country || closest.country;

      return {
        city: cityName,
        state: stateName,
        country: countryName,
        latitude,
        longitude,
      };
    }
  } catch (err) {
    // Return nearest pre-calculated city if network call fails
  }

  return {
    ...closest,
    latitude,
    longitude,
  };
}
