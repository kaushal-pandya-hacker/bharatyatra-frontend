/**
 * MakeMyTrip Official Integration Utility
 * Generates direct booking deep-links for Hotels, Buses, Trains, Flights, and Dining experiences.
 * Sanitizes input names (removes airport/station codes in parens) so parameters load cleanly on MakeMyTrip.
 */

export const MAKE_MY_TRIP_BASE_URLS = {
  HOTELS: 'https://www.makemytrip.com/hotels/',
  BUSES: 'https://www.makemytrip.com/bus-tickets/',
  TRAINS: 'https://www.makemytrip.com/railways/',
  FLIGHTS: 'https://www.makemytrip.com/flights/',
  RESTAURANTS: 'https://www.makemytrip.com/holidays-india/',
};

/**
 * Get MakeMyTrip Hotel booking link for a city or specific stay
 */
export function getMakeMyTripHotelLink(cityOrHotelName?: string): string {
  if (!cityOrHotelName) return MAKE_MY_TRIP_BASE_URLS.HOTELS;
  const cleanName = cityOrHotelName.split(',')[0].trim();
  return `${MAKE_MY_TRIP_BASE_URLS.HOTELS}?city=${encodeURIComponent(cleanName)}&searchText=${encodeURIComponent(cleanName)}`;
}

/**
 * Get MakeMyTrip Bus ticket booking link
 */
export function getMakeMyTripBusLink(fromCity?: string, toCity?: string): string {
  if (fromCity && toCity) {
    const cleanFrom = fromCity.split('(')[0].trim();
    const cleanTo = toCity.split('(')[0].trim();
    return `${MAKE_MY_TRIP_BASE_URLS.BUSES}?from=${encodeURIComponent(cleanFrom)}&to=${encodeURIComponent(cleanTo)}`;
  }
  return MAKE_MY_TRIP_BASE_URLS.BUSES;
}

/**
 * Get MakeMyTrip Train / Railway ticket booking link
 */
export function getMakeMyTripTrainLink(fromStation?: string, toStation?: string): string {
  if (fromStation && toStation) {
    const cleanFrom = fromStation.split('(')[0].trim();
    const cleanTo = toStation.split('(')[0].trim();
    return `${MAKE_MY_TRIP_BASE_URLS.TRAINS}?from=${encodeURIComponent(cleanFrom)}&to=${encodeURIComponent(cleanTo)}`;
  }
  return MAKE_MY_TRIP_BASE_URLS.TRAINS;
}

/**
 * Get MakeMyTrip Flight booking link
 */
export function getMakeMyTripFlightLink(fromCity?: string, toCity?: string): string {
  if (fromCity && toCity) {
    const cleanFrom = fromCity.split('(')[0].trim();
    const cleanTo = toCity.split('(')[0].trim();
    return `${MAKE_MY_TRIP_BASE_URLS.FLIGHTS}?from=${encodeURIComponent(cleanFrom)}&to=${encodeURIComponent(cleanTo)}`;
  }
  return MAKE_MY_TRIP_BASE_URLS.FLIGHTS;
}

/**
 * Get MakeMyTrip Restaurant & Dining link
 */
export function getMakeMyTripRestaurantLink(restaurantOrCity?: string): string {
  if (!restaurantOrCity) return MAKE_MY_TRIP_BASE_URLS.RESTAURANTS;
  return `${MAKE_MY_TRIP_BASE_URLS.RESTAURANTS}?query=${encodeURIComponent(restaurantOrCity)}`;
}

