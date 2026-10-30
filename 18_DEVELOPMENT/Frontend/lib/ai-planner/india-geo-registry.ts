import { findDestinationMaster } from './destination-master-service';
/**
 * BharatYatra AI 2.0 — Comprehensive India Geography & Destination Intelligence Registry
 * Covers All 28 States and 8 Union Territories of India with verified coordinates,
 * altitudes, transport connectivity hubs, seasonal constraints, and terrain dynamics.
 */

export interface GeoDestinationInfo {
  id: string;
  name: string;
  displayName: string;
  stateOrUt: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Himalayan' | 'Islands';
  district?: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  isHighAltitude: boolean; // >= 2800m triggers mandatory acclimatization
  category: 'Heritage' | 'Hill Station' | 'Beach' | 'Pilgrimage' | 'Wildlife' | 'Adventure' | 'Nature' | 'City' | 'Cultural';
  terrain: 'plains' | 'hills' | 'high-altitude-pass' | 'coastal' | 'island';
  averageRoadSpeedKmH: number; // 25-35 km/h for mountains, 50-65 km/h for plains/expressways
  nearestAirport: {
    code: string;
    name: string;
    distanceKm: number;
  };
  nearestRailhead: {
    code: string;
    name: string;
    distanceKm: number;
  };
  bestMonths: string[]; // e.g. ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  seasonalAlerts?: {
    monsoonRiskMonths?: number[]; // 1-12
    winterClosureMonths?: number[];
    extremeHeatMonths?: number[];
    notice?: string;
  };
  permitsRequired?: string[]; // e.g. ['Inner Line Permit (ILP)']
  typicalStayDays: {
    quick: number;
    recommended: number;
    extended: number;
  };
  keyAttractions: string[];
}

export const INDIA_DESTINATIONS_REGISTRY: Record<string, GeoDestinationInfo> = {
  // ==========================================
  // LADAKH (UT)
  // ==========================================
  'leh': {
    id: 'ladakh-leh',
    name: 'Leh',
    displayName: 'Leh City',
    stateOrUt: 'Ladakh',
    region: 'Himalayan',
    latitude: 34.1526,
    longitude: 77.5771,
    altitudeMeters: 3524,
    isHighAltitude: true,
    category: 'Hill Station',
    terrain: 'high-altitude-pass',
    averageRoadSpeedKmH: 30,
    nearestAirport: { code: 'IXL', name: 'Kushok Bakula Rimpochee Airport (Leh)', distanceKm: 4 },
    nearestRailhead: { code: 'JAT', name: 'Jammu Tawi (Railhead)', distanceKm: 700 },
    bestMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    seasonalAlerts: {
      winterClosureMonths: [11, 12, 1, 2, 3, 4],
      notice: 'Mandatory 48-hour acclimatization in Leh before traveling to higher passes (Khardung La, Pangong). Manali/Srinagar highways closed Nov-April.'
    },
    permitsRequired: ['Ladakh Protected Area Permit (PAP/ILP)'],
    typicalStayDays: { quick: 3, recommended: 4, extended: 6 },
    keyAttractions: ['Leh Palace', 'Shanti Stupa', 'Hall of Fame', 'Shey & Thiksey Monastery', 'Spituk Gompa', 'Magnetic Hill']
  },
  'nubra valley': {
    id: 'ladakh-nubra',
    name: 'Nubra Valley',
    displayName: 'Nubra Valley (Diskit & Hunder)',
    stateOrUt: 'Ladakh',
    region: 'Himalayan',
    latitude: 34.5459,
    longitude: 77.5658,
    altitudeMeters: 3048,
    isHighAltitude: true,
    category: 'Adventure',
    terrain: 'high-altitude-pass',
    averageRoadSpeedKmH: 25,
    nearestAirport: { code: 'IXL', name: 'Leh Airport', distanceKm: 125 },
    nearestRailhead: { code: 'JAT', name: 'Jammu Tawi', distanceKm: 825 },
    bestMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    seasonalAlerts: {
      winterClosureMonths: [11, 12, 1, 2, 3],
      notice: 'Accessible via Khardung La (5,359m). Requires prior acclimatization in Leh.'
    },
    permitsRequired: ['Inner Line Permit (ILP)'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Diskit Monastery & Maitreya Buddha', 'Hunder Sand Dunes (Double-humped Bactrian Camels)', 'Turtuk Village', 'Panamik Hot Springs']
  },
  'pangong tso': {
    id: 'ladakh-pangong',
    name: 'Pangong Tso',
    displayName: 'Pangong Lake',
    stateOrUt: 'Ladakh',
    region: 'Himalayan',
    latitude: 33.7595,
    longitude: 78.6674,
    altitudeMeters: 4225,
    isHighAltitude: true,
    category: 'Nature',
    terrain: 'high-altitude-pass',
    averageRoadSpeedKmH: 25,
    nearestAirport: { code: 'IXL', name: 'Leh Airport', distanceKm: 160 },
    nearestRailhead: { code: 'JAT', name: 'Jammu Tawi', distanceKm: 860 },
    bestMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    seasonalAlerts: {
      winterClosureMonths: [11, 12, 1, 2, 3, 4],
      notice: 'Extreme high-altitude lake. Night temperatures drop below freezing even in summer. Crosses Chang La (5,360m).'
    },
    permitsRequired: ['Inner Line Permit (ILP)'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 2 },
    keyAttractions: ['Pangong Lake Shoreline', 'Chang La Pass', 'Spangmik Village Camps', 'Marmot Point']
  },

  // ==========================================
  // GOA (STATE)
  // ==========================================
  'goa': {
    id: 'goa-hub',
    name: 'Goa',
    displayName: 'Goa (North & South Circuits)',
    stateOrUt: 'Goa',
    region: 'West',
    latitude: 15.2993,
    longitude: 74.1240,
    altitudeMeters: 10,
    isHighAltitude: false,
    category: 'Beach',
    terrain: 'coastal',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'GOI', name: 'Dabolim / Mopa (GOX) Airport', distanceKm: 15 },
    nearestRailhead: { code: 'MAO', name: 'Madgaon Junction / Thivim', distanceKm: 10 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    seasonalAlerts: {
      monsoonRiskMonths: [6, 7, 8, 9],
      notice: 'Water sports and beach shacks closed June-Sept during high monsoon. Waterfalls and spice plantations peak during rains.'
    },
    typicalStayDays: { quick: 3, recommended: 5, extended: 7 },
    keyAttractions: ['Calangute & Baga Beach', 'Fort Aguada', 'Basilica of Bom Jesus', 'Palolem Beach', 'Dudhsagar Waterfalls', 'Anjuna Flea Market']
  },

  // ==========================================
  // KERALA (STATE)
  // ==========================================
  'munnar': {
    id: 'kerala-munnar',
    name: 'Munnar',
    displayName: 'Munnar Tea Hills',
    stateOrUt: 'Kerala',
    region: 'South',
    latitude: 10.0889,
    longitude: 77.0595,
    altitudeMeters: 1532,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 35,
    nearestAirport: { code: 'COK', name: 'Cochin International Airport', distanceKm: 110 },
    nearestRailhead: { code: 'AWY', name: 'Aluva / Ernakulam Junction', distanceKm: 115 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    seasonalAlerts: {
      monsoonRiskMonths: [6, 7, 8],
      notice: 'Ghat roads experience heavy rains and occasional mist delays in July-August.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Eravikulam National Park (Nilgiri Tahr)', 'Mattupetty Dam', 'Tea Museum', 'Top Station', 'Kundala Lake', 'Anamudi Peak']
  },
  'alleppey': {
    id: 'kerala-alleppey',
    name: 'Alleppey',
    displayName: 'Alappuzha (Alleppey Backwaters)',
    stateOrUt: 'Kerala',
    region: 'South',
    latitude: 9.4981,
    longitude: 76.3388,
    altitudeMeters: 2,
    isHighAltitude: false,
    category: 'Nature',
    terrain: 'coastal',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'COK', name: 'Cochin Airport', distanceKm: 75 },
    nearestRailhead: { code: 'ALLP', name: 'Alappuzha Railway Station', distanceKm: 3 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Vembanad Lake Houseboat Cruise', 'Alappuzha Beach & Lighthouse', 'Marari Beach', 'Kuttanad Below-Sea-Level Paddy Fields']
  },
  'kochi': {
    id: 'kerala-kochi',
    name: 'Kochi',
    displayName: 'Kochi (Cochin)',
    stateOrUt: 'Kerala',
    region: 'South',
    latitude: 9.9312,
    longitude: 76.2673,
    altitudeMeters: 4,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'coastal',
    averageRoadSpeedKmH: 40,
    nearestAirport: { code: 'COK', name: 'Cochin International Airport', distanceKm: 28 },
    nearestRailhead: { code: 'ERS', name: 'Ernakulam Junction', distanceKm: 3 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Fort Kochi Chinese Fishing Nets', 'Mattancherry Palace (Dutch Palace)', 'Jew Town & Paradesi Synagogue', 'Marine Drive']
  },

  // ==========================================
  // RAJASTHAN (STATE)
  // ==========================================
  'jaipur': {
    id: 'rajasthan-jaipur',
    name: 'Jaipur',
    displayName: 'Jaipur (Pink City)',
    stateOrUt: 'Rajasthan',
    region: 'North',
    latitude: 26.9124,
    longitude: 75.7873,
    altitudeMeters: 431,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 55,
    nearestAirport: { code: 'JAI', name: 'Jaipur International Airport', distanceKm: 12 },
    nearestRailhead: { code: 'JP', name: 'Jaipur Junction', distanceKm: 3 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    seasonalAlerts: {
      extremeHeatMonths: [4, 5, 6],
      notice: 'Summer temperatures frequently cross 42°C. Sightseeing recommended during early mornings and evenings.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Amber Palace & Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort', 'Chokhi Dhani']
  },
  'udaipur': {
    id: 'rajasthan-udaipur',
    name: 'Udaipur',
    displayName: 'Udaipur (City of Lakes)',
    stateOrUt: 'Rajasthan',
    region: 'West',
    latitude: 24.5854,
    longitude: 73.7125,
    altitudeMeters: 598,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'UDR', name: 'Maharana Pratap Airport', distanceKm: 22 },
    nearestRailhead: { code: 'UDZ', name: 'Udaipur City Railway Station', distanceKm: 4 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['City Palace Complex', 'Lake Pichola Boat Ride', 'Jag Mandir', 'Saheliyon-ki-Bari', 'Fateh Sagar Lake', 'Sajjangarh Monsoon Palace']
  },
  'jaisalmer': {
    id: 'rajasthan-jaisalmer',
    name: 'Jaisalmer',
    displayName: 'Jaisalmer (Golden City & Thar Desert)',
    stateOrUt: 'Rajasthan',
    region: 'West',
    latitude: 26.9157,
    longitude: 70.9083,
    altitudeMeters: 225,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 60,
    nearestAirport: { code: 'JSA', name: 'Jaisalmer Civil Airport', distanceKm: 14 },
    nearestRailhead: { code: 'JSM', name: 'Jaisalmer Railway Station', distanceKm: 3 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    seasonalAlerts: {
      extremeHeatMonths: [4, 5, 6, 7],
      notice: 'Extreme desert heat in summer (up to 46°C). Desert camps operate Oct-March.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Jaisalmer Living Fort (Sonar Qila)', 'Sam Sand Dunes & Desert Safari', 'Patwon Ki Haveli', 'Gadisar Lake', 'Kuldhara Ghost Village']
  },

  // ==========================================
  // HIMACHAL PRADESH (STATE)
  // ==========================================
  'manali': {
    id: 'hp-manali',
    name: 'Manali',
    displayName: 'Manali Valley',
    stateOrUt: 'Himachal Pradesh',
    region: 'Himalayan',
    latitude: 32.2432,
    longitude: 77.1892,
    altitudeMeters: 2050,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 35,
    nearestAirport: { code: 'KUU', name: 'Kullu-Manali Airport (Bhuntar)', distanceKm: 50 },
    nearestRailhead: { code: 'CDG', name: 'Chandigarh Junction (Broad Gauge)', distanceKm: 290 },
    bestMonths: ['Mar', 'Apr', 'May', 'Jun', 'Sep', 'Oct', 'Nov', 'Dec'],
    seasonalAlerts: {
      monsoonRiskMonths: [7, 8],
      notice: 'Monsoon season brings cloudbursts and landslides on Chandigarh-Manali Highway. Winter brings heavy snowfall in Solang/Atal Tunnel.'
    },
    typicalStayDays: { quick: 3, recommended: 4, extended: 6 },
    keyAttractions: ['Solang Valley', 'Atal Tunnel & Sissu (Lahaul)', 'Hadimba Temple', 'Jogini Waterfall', 'Old Manali Cafes', 'Rohtang Pass (May-Oct)']
  },
  'shimla': {
    id: 'hp-shimla',
    name: 'Shimla',
    displayName: 'Shimla (Queen of Hills)',
    stateOrUt: 'Himachal Pradesh',
    region: 'Himalayan',
    latitude: 31.1048,
    longitude: 77.1734,
    altitudeMeters: 2206,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 35,
    nearestAirport: { code: 'SLV', name: 'Shimla Jubbarhatti Airport', distanceKm: 22 },
    nearestRailhead: { code: 'SML', name: 'Kalka-Shimla Toy Train Station / Kalka Broad Gauge', distanceKm: 88 },
    bestMonths: ['Mar', 'Apr', 'May', 'Jun', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['The Ridge & Mall Road', 'Jakhoo Temple Ropeway', 'Kufri Snow View', 'Viceregal Lodge', 'Christ Church']
  },

  // ==========================================
  // UTTARAKHAND (STATE)
  // ==========================================
  'rishikesh': {
    id: 'uk-rishikesh',
    name: 'Rishikesh',
    displayName: 'Rishikesh (Yoga & Ganges Capital)',
    stateOrUt: 'Uttarakhand',
    region: 'North',
    latitude: 30.0869,
    longitude: 78.2676,
    altitudeMeters: 372,
    isHighAltitude: false,
    category: 'Adventure',
    terrain: 'hills',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'DED', name: 'Dehradun Jolly Grant Airport', distanceKm: 21 },
    nearestRailhead: { code: 'YNRK', name: 'Yog Nagari Rishikesh / Haridwar', distanceKm: 5 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    seasonalAlerts: {
      monsoonRiskMonths: [7, 8],
      notice: 'White water river rafting is banned during monsoon (July-mid Sept).'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 5 },
    keyAttractions: ['Triveni Ghat Evening Maha Aarti', 'Ram Jhula & Lakshman Jhula', 'Ganga White Water Rafting', 'Beatles Ashram', 'Neelkanth Mahadev Temple']
  },
  'kedarnath': {
    id: 'uk-kedarnath',
    name: 'Kedarnath',
    displayName: 'Kedarnath Dham',
    stateOrUt: 'Uttarakhand',
    region: 'Himalayan',
    latitude: 30.7346,
    longitude: 79.0669,
    altitudeMeters: 3583,
    isHighAltitude: true,
    category: 'Pilgrimage',
    terrain: 'high-altitude-pass',
    averageRoadSpeedKmH: 25,
    nearestAirport: { code: 'DED', name: 'Dehradun Airport', distanceKm: 240 },
    nearestRailhead: { code: 'HW', name: 'Haridwar Junction', distanceKm: 245 },
    bestMonths: ['May', 'Jun', 'Sep', 'Oct'],
    seasonalAlerts: {
      winterClosureMonths: [11, 12, 1, 2, 3, 4],
      monsoonRiskMonths: [7, 8],
      notice: 'Temple doors open in May (Akshaya Tritiya) and close on Bhai Dooj (Nov). Mandatory biometric Yatra registration. 16 km trek from Gaurikund.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Kedarnath Jyotirlinga Temple', 'Bhairavnath Temple', 'Gaurikund Hot Spring', 'Mandakini River Valley']
  },

  // ==========================================
  // MEGHALAYA (STATE - NORTHEAST)
  // ==========================================
  'shillong': {
    id: 'ne-shillong',
    name: 'Shillong',
    displayName: 'Shillong (Scotland of the East)',
    stateOrUt: 'Meghalaya',
    region: 'Northeast',
    latitude: 25.5788,
    longitude: 91.8933,
    altitudeMeters: 1525,
    isHighAltitude: false,
    category: 'Nature',
    terrain: 'hills',
    averageRoadSpeedKmH: 35,
    nearestAirport: { code: 'SHL', name: 'Shillong Umroi Airport / GAU Guwahati', distanceKm: 30 },
    nearestRailhead: { code: 'GHY', name: 'Guwahati Junction', distanceKm: 100 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Umiam Lake', 'Elephant Falls', 'Shillong Peak', 'Don Bosco Centre for Indigenous Cultures', 'Police Bazar']
  },
  'cherrapunji': {
    id: 'ne-cherrapunji',
    name: 'Cherrapunji',
    displayName: 'Sohra (Cherrapunji & Living Root Bridges)',
    stateOrUt: 'Meghalaya',
    region: 'Northeast',
    latitude: 25.2986,
    longitude: 91.5822,
    altitudeMeters: 1430,
    isHighAltitude: false,
    category: 'Nature',
    terrain: 'hills',
    averageRoadSpeedKmH: 30,
    nearestAirport: { code: 'GAU', name: 'Guwahati Airport', distanceKm: 165 },
    nearestRailhead: { code: 'GHY', name: 'Guwahati Railway Station', distanceKm: 145 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Nohkalikai Falls (Tallest plunge waterfall in India)', 'Double Decker Living Root Bridge (Nongriat)', 'Mawsmai Cave', 'Seven Sisters Falls']
  },

  // ==========================================
  // ANDAMAN AND NICOBAR ISLANDS (UT)
  // ==========================================
  'port blair': {
    id: 'andaman-portblair',
    name: 'Port Blair',
    displayName: 'Port Blair & Havelock Island',
    stateOrUt: 'Andaman & Nicobar',
    region: 'Islands',
    latitude: 11.6234,
    longitude: 92.7265,
    altitudeMeters: 16,
    isHighAltitude: false,
    category: 'Beach',
    terrain: 'island',
    averageRoadSpeedKmH: 35,
    nearestAirport: { code: 'IXZ', name: 'Veer Savarkar International Airport (Port Blair)', distanceKm: 5 },
    nearestRailhead: { code: 'NONE', name: 'No Railway Network (Island)', distanceKm: 0 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    seasonalAlerts: {
      monsoonRiskMonths: [6, 7, 8, 9],
      notice: 'Ferry sailing to Havelock/Neil island subject to weather and sea surge during monsoon.'
    },
    typicalStayDays: { quick: 4, recommended: 6, extended: 8 },
    keyAttractions: ['Cellular Jail National Memorial & Light and Sound', 'Radhanagar Beach (Havelock)', 'Elephant Beach Snorkeling', 'Ross Island / Netaji Subhash Chandra Bose Dweep']
  },

  // ==========================================
  // GUJARAT (STATE)
  // ==========================================
  'ahmedabad': {
    id: 'gujarat-ahmedabad',
    name: 'Ahmedabad',
    displayName: 'Ahmedabad (UNESCO World Heritage City)',
    stateOrUt: 'Gujarat',
    region: 'West',
    latitude: 23.0225,
    longitude: 72.5714,
    altitudeMeters: 53,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', distanceKm: 10 },
    nearestRailhead: { code: 'ADI', name: 'Ahmedabad Junction (Kalupur)', distanceKm: 4 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Sabarmati Ashram', 'Adalaj Stepwell', 'Atal Pedestrian Bridge & Riverfront', 'Sidi Saiyyed Jali', 'Akshardham Gandhinagar']
  },
  'kutch': {
    id: 'gujarat-kutch',
    name: 'Kutch',
    displayName: 'Kutch (Dhordo White Desert & Rann Utsav)',
    stateOrUt: 'Gujarat',
    region: 'West',
    latitude: 23.7788,
    longitude: 69.5126,
    altitudeMeters: 15,
    isHighAltitude: false,
    category: 'Cultural',
    terrain: 'plains',
    averageRoadSpeedKmH: 60,
    nearestAirport: { code: 'BHJ', name: 'Bhuj Civil Airport', distanceKm: 80 },
    nearestRailhead: { code: 'BHUJ', name: 'Bhuj Railway Station', distanceKm: 82 },
    bestMonths: ['Nov', 'Dec', 'Jan', 'Feb'],
    seasonalAlerts: {
      monsoonRiskMonths: [6, 7, 8, 9],
      notice: 'White salt desert is submerged underwater June-Sept. Rann Utsav operates Nov-Feb.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Great Rann of Kutch White Desert', 'Dholavira UNESCO Harappan Site', 'Kala Dungar (Black Hill)', 'Bhuj Aina Mahal & Prag Mahal']
  },
  'sasan gir': {
    id: 'gujarat-gir',
    name: 'Sasan Gir',
    displayName: 'Gir National Park (Asiatic Lion Sanctuary)',
    stateOrUt: 'Gujarat',
    region: 'West',
    latitude: 21.1243,
    longitude: 70.8242,
    altitudeMeters: 147,
    isHighAltitude: false,
    category: 'Wildlife',
    terrain: 'hills',
    averageRoadSpeedKmH: 40,
    nearestAirport: { code: 'DIU', name: 'Diu Airport / Rajkot Airport', distanceKm: 105 },
    nearestRailhead: { code: 'JND', name: 'Junagadh Junction', distanceKm: 55 },
    bestMonths: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    seasonalAlerts: {
      monsoonRiskMonths: [6, 7, 8, 9, 10],
      notice: 'Core Wildlife Sanctuary closed June 16 – Oct 15 for breeding season. Devalia Safari Park remains open.'
    },
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Gir Jungle Open Gypsy Safari', 'Devalia Safari Park', 'Kamleshwar Dam', 'Crocodile Breeding Centre']
  },
  'somnath': {
    id: 'gujarat-somnath',
    name: 'Somnath',
    displayName: 'Shree Somnath Jyotirlinga Temple',
    stateOrUt: 'Gujarat',
    region: 'West',
    latitude: 20.8880,
    longitude: 70.4012,
    altitudeMeters: 8,
    isHighAltitude: false,
    category: 'Pilgrimage',
    terrain: 'coastal',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'DIU', name: 'Diu Airport', distanceKm: 85 },
    nearestRailhead: { code: 'SMNH', name: 'Somnath Railway Station', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 1, extended: 2 },
    keyAttractions: ['Somnath Temple & Sound and Light Show', 'Triveni Sangam', 'Bhalka Tirth', 'Somnath Promenade']
  },
  'dwarka': {
    id: 'gujarat-dwarka',
    name: 'Dwarka',
    displayName: 'Devbhumi Dwarka (Dwarkadhish Temple)',
    stateOrUt: 'Gujarat',
    region: 'West',
    latitude: 22.2442,
    longitude: 68.9685,
    altitudeMeters: 5,
    isHighAltitude: false,
    category: 'Pilgrimage',
    terrain: 'coastal',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'JGA', name: 'Jamnagar Airport', distanceKm: 130 },
    nearestRailhead: { code: 'DWK', name: 'Dwarka Railway Station', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Dwarkadhish Jagat Mandir', 'Bet Dwarka & Sudama Setu Bridge', 'Shivrajpur Blue Flag Beach', 'Nageshwar Jyotirlinga', 'Rukmini Devi Temple']
  },

  // ==========================================
  // TAMIL NADU (STATE)
  // ==========================================
  'ooty': {
    id: 'tn-ooty',
    name: 'Ooty',
    displayName: 'Udhagamandalam (Ooty Nilgiris)',
    stateOrUt: 'Tamil Nadu',
    region: 'South',
    latitude: 11.4102,
    longitude: 76.6950,
    altitudeMeters: 2240,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 30,
    nearestAirport: { code: 'CJB', name: 'Coimbatore International Airport', distanceKm: 88 },
    nearestRailhead: { code: 'MTP', name: 'Mettupalayam (Nilgiri Mountain Toy Train)', distanceKm: 50 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Nilgiri Mountain Railway (UNESCO)', 'Ooty Botanical Gardens', 'Doddabetta Peak', 'Pykara Lake & Waterfalls', 'Tea Factory & Museum']
  },

  // ==========================================
  // KARNATAKA (STATE)
  // ==========================================
  'hampi': {
    id: 'ka-hampi',
    name: 'Hampi',
    displayName: 'Hampi (Vijayanagara UNESCO Ruins)',
    stateOrUt: 'Karnataka',
    region: 'South',
    latitude: 15.3350,
    longitude: 76.4600,
    altitudeMeters: 467,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'VDY', name: 'Jindal Vijayanagar Airport (Toranagallu) / HUBLI', distanceKm: 35 },
    nearestRailhead: { code: 'HPT', name: 'Hosapete Junction (Hospet)', distanceKm: 13 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    seasonalAlerts: {
      extremeHeatMonths: [3, 4, 5, 6],
      notice: 'Bouldering and temple ruins become extremely hot during summer midday.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Virupaksha Temple', 'Vijaya Vittala Temple & Stone Chariot', 'Lotus Mahal & Elephant Stables', 'Matanga Hill Sunrise', 'Tungabhadra River Coracle Ride']
  },

  // ==========================================
  // SIKKIM (STATE - EAST / HIMALAYAN)
  // ==========================================
  'gangtok': {
    id: 'sikkim-gangtok',
    name: 'Gangtok',
    displayName: 'Gangtok & North Sikkim',
    stateOrUt: 'Sikkim',
    region: 'Himalayan',
    latitude: 27.3389,
    longitude: 88.6065,
    altitudeMeters: 1650,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 30,
    nearestAirport: { code: 'PYG', name: 'Pakyong Airport / IXB Bagdogra', distanceKm: 28 },
    nearestRailhead: { code: 'NJP', name: 'New Jalpaiguri Junction', distanceKm: 120 },
    bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov', 'Dec'],
    seasonalAlerts: {
      monsoonRiskMonths: [6, 7, 8],
      notice: 'Landslide prone Teesta highway during heavy monsoon. Winter brings snow near Tsomgo and Yumthang.'
    },
    permitsRequired: ['Protected Area Permit for Tsomgo/Nathula and North Sikkim (Lachen/Lachung)'],
    typicalStayDays: { quick: 3, recommended: 5, extended: 7 },
    keyAttractions: ['Tsomgo Changu Lake & Baba Mandir', 'Rumtek Monastery', 'Nathula Pass Indo-China Border', 'Yumthang Valley of Flowers', 'MG Marg']
  },

  // ==========================================
  // UTTAR PRADESH (STATE)
  // ==========================================
  'varanasi': {
    id: 'up-varanasi',
    name: 'Varanasi',
    displayName: 'Varanasi (Kashi - Sacred Ghats)',
    stateOrUt: 'Uttar Pradesh',
    region: 'North',
    latitude: 25.3176,
    longitude: 82.9739,
    altitudeMeters: 80,
    isHighAltitude: false,
    category: 'Pilgrimage',
    terrain: 'plains',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'VNS', name: 'Lal Bahadur Shastri International Airport', distanceKm: 22 },
    nearestRailhead: { code: 'BSB', name: 'Varanasi Junction (Cantt) / Banaras', distanceKm: 4 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Dashashwamedh Ghat Evening Ganga Aarti', 'Kashi Vishwanath Corridor', 'Subah-e-Banaras Morning Boat Ride', 'Sarnath Dhamek Stupa', 'Manikarnika & Assi Ghat']
  },
  'agra': {
    id: 'up-agra',
    name: 'Agra',
    displayName: 'Agra (Taj Mahal & Mughal Heritage)',
    stateOrUt: 'Uttar Pradesh',
    region: 'North',
    latitude: 27.1767,
    longitude: 78.0081,
    altitudeMeters: 171,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 60,
    nearestAirport: { code: 'AGR', name: 'Agra Kheria Airport / DEL Delhi', distanceKm: 8 },
    nearestRailhead: { code: 'AGC', name: 'Agra Cantt Railway Station', distanceKm: 5 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Taj Mahal (Closed Fridays)', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh Sunset View']
  },
  // ==========================================
  // ANDAMAN & NICOBAR ISLANDS (UT)
  // ==========================================
  'havelock': {
    id: 'an-havelock',
    name: 'Havelock Island',
    displayName: 'Havelock (Swaraj Dweep - Radhanagar Beach)',
    stateOrUt: 'Andaman & Nicobar',
    region: 'Islands',
    latitude: 11.9761,
    longitude: 92.9876,
    altitudeMeters: 10,
    isHighAltitude: false,
    category: 'Beach',
    terrain: 'island',
    averageRoadSpeedKmH: 30,
    nearestAirport: { code: 'IXZ', name: 'Port Blair (via 90-min Catamaran Ferry)', distanceKm: 55 },
    nearestRailhead: { code: 'NONE', name: 'Island Territory', distanceKm: 0 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Radhanagar Beach (Asia Best Beach)', 'Elephant Beach Snorkeling & Coral Reefs', 'Kalapathar Beach Turquoise Waters']
  },

  // ==========================================
  // ANDHRA PRADESH
  // ==========================================
  'tirupati': {
    id: 'ap-tirupati',
    name: 'Tirupati',
    displayName: 'Tirupati (Sri Venkateswara Balaji Temple)',
    stateOrUt: 'Andhra Pradesh',
    region: 'South',
    latitude: 13.6288,
    longitude: 79.4192,
    altitudeMeters: 161,
    isHighAltitude: false,
    category: 'Pilgrimage',
    terrain: 'hills',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'TIR', name: 'Tirupati Airport (Renigunta)', distanceKm: 15 },
    nearestRailhead: { code: 'TPTY', name: 'Tirupati Main Railway Station', distanceKm: 2 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 3 },
    keyAttractions: ['Tirumala Venkateswara Temple', 'Sri Padmavathi Ammavari Temple', 'Silathoranam Natural Rock Arch', 'Kapila Theertham Waterfall']
  },
  'visakhapatnam': {
    id: 'ap-vizag',
    name: 'Visakhapatnam',
    displayName: 'Visakhapatnam (Vizag Port & Araku Valley)',
    stateOrUt: 'Andhra Pradesh',
    region: 'South',
    latitude: 17.6868,
    longitude: 83.2185,
    altitudeMeters: 45,
    isHighAltitude: false,
    category: 'Beach',
    terrain: 'coastal',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'VTZ', name: 'Visakhapatnam International Airport', distanceKm: 8 },
    nearestRailhead: { code: 'VSKP', name: 'Visakhapatnam Junction', distanceKm: 3 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 5 },
    keyAttractions: ['Rishikonda Beach & Water Sports', 'INS Kursura Submarine Museum', 'Kailasagiri Hilltop Park', 'Araku Valley Coffee Plantations & Borra Caves']
  },

  // ==========================================
  // ARUNACHAL PRADESH
  // ==========================================
  'tawang': {
    id: 'ar-tawang',
    name: 'Tawang',
    displayName: 'Tawang (Ancient Monasteries & Sela Pass)',
    stateOrUt: 'Arunachal Pradesh',
    region: 'Himalayan',
    latitude: 27.5861,
    longitude: 91.8594,
    altitudeMeters: 3048,
    isHighAltitude: true,
    category: 'Hill Station',
    terrain: 'high-altitude-pass',
    averageRoadSpeedKmH: 26,
    nearestAirport: { code: 'TEZ', name: 'Tezpur Airport / GAU Guwahati', distanceKm: 320 },
    nearestRailhead: { code: 'RNY', name: 'Rangapara North / Bapudham Tezpur', distanceKm: 310 },
    bestMonths: ['Mar', 'Apr', 'May', 'Sep', 'Oct', 'Nov'],
    seasonalAlerts: {
      winterClosureMonths: [12, 1, 2],
      notice: 'Sela Pass (4,170m) experiences heavy winter snow. Sela Tunnel provides all-weather access.'
    },
    permitsRequired: ['Arunachal Pradesh Inner Line Permit (ILP)'],
    typicalStayDays: { quick: 3, recommended: 4, extended: 6 },
    keyAttractions: ['Tawang Monastery (Galden Namgey Lhatse)', 'Sela Pass & Sela Lake', 'Madhuri (Sangetsar) Lake', 'Nuranang (Bong Bong) Waterfalls', 'Tawang War Memorial']
  },

  // ==========================================
  // ASSAM
  // ==========================================
  'guwahati': {
    id: 'as-guwahati',
    name: 'Guwahati',
    displayName: 'Guwahati (Gateway to Northeast & Kamakhya)',
    stateOrUt: 'Assam',
    region: 'Northeast',
    latitude: 26.1445,
    longitude: 91.7362,
    altitudeMeters: 55,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International Airport', distanceKm: 18 },
    nearestRailhead: { code: 'GHY', name: 'Guwahati Railway Station', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Maa Kamakhya Temple Nilachal Hill', 'Umananda Island (Smallest Inhabited River Island)', 'Brahmaputra Sunset River Cruise', 'Assam State Museum']
  },
  'kaziranga': {
    id: 'as-kaziranga',
    name: 'Kaziranga National Park',
    displayName: 'Kaziranga (World of One-Horned Rhinoceros)',
    stateOrUt: 'Assam',
    region: 'Northeast',
    latitude: 26.5775,
    longitude: 93.1711,
    altitudeMeters: 80,
    isHighAltitude: false,
    category: 'Wildlife',
    terrain: 'plains',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'JRH', name: 'Jorhat (Rowriah) Airport / GAU Guwahati', distanceKm: 96 },
    nearestRailhead: { code: 'FKG', name: 'Furkating Junction', distanceKm: 75 },
    bestMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    seasonalAlerts: {
      monsoonRiskMonths: [5, 6, 7, 8, 9, 10],
      notice: 'Kaziranga National Park is closed from May 1 to October 31 due to Brahmaputra monsoon flooding.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Central (Kohora) Zone Elephant Safari', 'Western (Bagori) Jeep Safari for Rhino Sightings', 'Kaziranga National Orchid and Biodiversity Park']
  },

  // ==========================================
  // BIHAR
  // ==========================================
  'bodh gaya': {
    id: 'br-bodhgaya',
    name: 'Bodh Gaya',
    displayName: 'Bodh Gaya (Mahabodhi Temple & Enlightenment Tree)',
    stateOrUt: 'Bihar',
    region: 'East',
    latitude: 24.6961,
    longitude: 84.9869,
    altitudeMeters: 111,
    isHighAltitude: false,
    category: 'Pilgrimage',
    terrain: 'plains',
    averageRoadSpeedKmH: 48,
    nearestAirport: { code: 'GAY', name: 'Gaya International Airport', distanceKm: 10 },
    nearestRailhead: { code: 'GAYA', name: 'Gaya Junction', distanceKm: 14 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 2, extended: 3 },
    keyAttractions: ['Mahabodhi Temple UNESCO World Heritage Site', 'Sacred Bodhi Tree & Vajrasana', 'Great Buddha 80-ft Statue', 'International Monasteries (Thai, Tibetan, Bhutanese)']
  },

  // ==========================================
  // CHANDIGARH (UT)
  // ==========================================
  'chandigarh': {
    id: 'ch-chandigarh',
    name: 'Chandigarh',
    displayName: 'Chandigarh (The City Beautiful & Rock Garden)',
    stateOrUt: 'Chandigarh',
    region: 'North',
    latitude: 30.7333,
    longitude: 76.7794,
    altitudeMeters: 321,
    isHighAltitude: false,
    category: 'City',
    terrain: 'plains',
    averageRoadSpeedKmH: 60,
    nearestAirport: { code: 'IXC', name: 'Shaheed Bhagat Singh International Airport', distanceKm: 12 },
    nearestRailhead: { code: 'CDG', name: 'Chandigarh Junction', distanceKm: 8 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Nek Chand Rock Garden', 'Sukhna Lake Promenade & Boating', 'Zakir Hussain Rose Garden', 'Le Corbusier Capitol Complex UNESCO Site']
  },

  // ==========================================
  // CHHATTISGARH
  // ==========================================
  'bastar': {
    id: 'cg-bastar',
    name: 'Bastar (Jagdalpur)',
    displayName: 'Bastar (Chitrakote Falls & Tribal Culture)',
    stateOrUt: 'Chhattisgarh',
    region: 'Central',
    latitude: 19.0740,
    longitude: 82.0081,
    altitudeMeters: 555,
    isHighAltitude: false,
    category: 'Nature',
    terrain: 'hills',
    averageRoadSpeedKmH: 48,
    nearestAirport: { code: 'JGB', name: 'Jagdalpur Airport / RPR Raipur', distanceKm: 5 },
    nearestRailhead: { code: 'JDB', name: 'Jagdalpur Railway Station', distanceKm: 3 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Chitrakote Waterfalls (Niagara of India on Indravati River)', 'Tirathgarh Waterfalls Kanger Valley', 'Kotumsar Limestone Caves', 'Bastar Tribal Bell Metal Crafts']
  },

  // ==========================================
  // DADRA & NAGAR HAVELI AND DAMAN & DIU (UT)
  // ==========================================
  'diu': {
    id: 'dd-diu',
    name: 'Diu',
    displayName: 'Diu Island (Portuguese Fortresses & Nagoa Beach)',
    stateOrUt: 'Dadra & Nagar Haveli and Daman & Diu',
    region: 'West',
    latitude: 20.7144,
    longitude: 70.9874,
    altitudeMeters: 12,
    isHighAltitude: false,
    category: 'Beach',
    terrain: 'coastal',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'DIU', name: 'Diu Airport', distanceKm: 5 },
    nearestRailhead: { code: 'VRL', name: 'Veraval Railway Station', distanceKm: 85 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 2, extended: 3 },
    keyAttractions: ['Diu Sea Fortress & Lighthouse', 'Naida Caves Geologic Rock Formations', 'Nagoa Beach Hoka Palm Trees', 'St. Paul Church Portuguese Baroque Architecture']
  },

  // ==========================================
  // DELHI (UT)
  // ==========================================
  'delhi': {
    id: 'dl-delhi',
    name: 'New Delhi',
    displayName: 'National Capital Territory of Delhi',
    stateOrUt: 'Delhi',
    region: 'North',
    latitude: 28.6139,
    longitude: 77.2090,
    altitudeMeters: 216,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'DEL', name: 'Indira Gandhi International Airport', distanceKm: 15 },
    nearestRailhead: { code: 'NDLS', name: 'New Delhi Railway Station', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 5 },
    keyAttractions: ['Qutub Minar Complex', 'Humayun Tomb UNESCO Monument', 'Red Fort & Chandni Chowk Food Street', 'India Gate & Kartavya Path', 'Akshardham Temple']
  },

  // ==========================================
  // JAMMU & KASHMIR (UT)
  // ==========================================
  'srinagar': {
    id: 'jk-srinagar',
    name: 'Srinagar',
    displayName: 'Srinagar (Dal Lake & Mughal Gardens)',
    stateOrUt: 'Jammu & Kashmir',
    region: 'Himalayan',
    latitude: 34.0837,
    longitude: 74.7973,
    altitudeMeters: 1585,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 35,
    nearestAirport: { code: 'SXR', name: 'Sheikh ul-Alam International Airport', distanceKm: 12 },
    nearestRailhead: { code: 'JAT', name: 'Jammu Tawi / Udhampur (Baramulla line underway)', distanceKm: 260 },
    bestMonths: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    typicalStayDays: { quick: 3, recommended: 4, extended: 6 },
    keyAttractions: ['Dal Lake Shikara Ride & Houseboat Stay', 'Mughal Gardens (Shalimar, Nishat, Chashme Shahi)', 'Hazratbal Shrine', 'Shankaracharya Temple Viewpoint']
  },
  'gulmarg': {
    id: 'jk-gulmarg',
    name: 'Gulmarg',
    displayName: 'Gulmarg (Meadow of Flowers & Apharwat Gondola)',
    stateOrUt: 'Jammu & Kashmir',
    region: 'Himalayan',
    latitude: 34.0484,
    longitude: 74.3805,
    altitudeMeters: 2650,
    isHighAltitude: false,
    category: 'Adventure',
    terrain: 'hills',
    averageRoadSpeedKmH: 30,
    nearestAirport: { code: 'SXR', name: 'Srinagar International Airport', distanceKm: 56 },
    nearestRailhead: { code: 'JAT', name: 'Jammu Tawi', distanceKm: 310 },
    bestMonths: ['Dec', 'Jan', 'Feb', 'Mar', 'May', 'Jun', 'Sep'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Gulmarg Gondola (World 2nd Highest Cable Car to Apharwat Peak 3,980m)', 'Winter Ski Slopes & Snowboarding', 'St. Mary Church in Snow', 'Strawberry Valley']
  },

  // ==========================================
  // JHARKHAND
  // ==========================================
  'ranchi': {
    id: 'jh-ranchi',
    name: 'Ranchi',
    displayName: 'Ranchi (City of Waterfalls & Tagore Hill)',
    stateOrUt: 'Jharkhand',
    region: 'East',
    latitude: 23.3441,
    longitude: 85.3096,
    altitudeMeters: 651,
    isHighAltitude: false,
    category: 'Nature',
    terrain: 'hills',
    averageRoadSpeedKmH: 48,
    nearestAirport: { code: 'IXR', name: 'Birsa Munda Airport', distanceKm: 6 },
    nearestRailhead: { code: 'RNC', name: 'Ranchi Junction', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 2, extended: 3 },
    keyAttractions: ['Hundru & Dassam Waterfalls', 'Jonha Falls', 'Tagore Hill', 'Patratu Valley Scenic Drive']
  },

  // ==========================================
  // KARNATAKA
  // ==========================================
  'bengaluru': {
    id: 'ka-bengaluru',
    name: 'Bengaluru',
    displayName: 'Bengaluru (Silicon Valley & Garden City)',
    stateOrUt: 'Karnataka',
    region: 'South',
    latitude: 12.9716,
    longitude: 77.5946,
    altitudeMeters: 920,
    isHighAltitude: false,
    category: 'City',
    terrain: 'plains',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'BLR', name: 'Kempegowda International Airport', distanceKm: 35 },
    nearestRailhead: { code: 'SBC', name: 'KSR Bengaluru City Junction', distanceKm: 3 },
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Lalbagh Botanical Garden Glass House', 'Bangalore Palace Tudor Architecture', 'Cubbon Park & Vidhana Soudha', 'Indiranagar Craft Breweries']
  },
  'mysore': {
    id: 'ka-mysore',
    name: 'Mysuru',
    displayName: 'Mysuru (Royal Palace & Chamundi Hills)',
    stateOrUt: 'Karnataka',
    region: 'South',
    latitude: 12.2958,
    longitude: 76.6394,
    altitudeMeters: 770,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 55,
    nearestAirport: { code: 'MYQ', name: 'Mysore Airport / BLR Bengaluru', distanceKm: 12 },
    nearestRailhead: { code: 'MYS', name: 'Mysuru Junction', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 2, extended: 3 },
    keyAttractions: ['Mysore Palace (Illumination on Sundays)', 'Chamundeshwari Temple & Nandi Monolith', 'Brindavan Gardens Musical Fountain', 'St. Philomena Cathedral']
  },

  // ==========================================
  // MADHYA PRADESH
  // ==========================================
  'khajuraho': {
    id: 'mp-khajuraho',
    name: 'Khajuraho',
    displayName: 'Khajuraho (UNESCO Chandela Temple Art)',
    stateOrUt: 'Madhya Pradesh',
    region: 'Central',
    latitude: 24.8318,
    longitude: 79.9199,
    altitudeMeters: 282,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 52,
    nearestAirport: { code: 'HJR', name: 'Khajuraho Airport', distanceKm: 4 },
    nearestRailhead: { code: 'KURJ', name: 'Khajuraho Railway Station', distanceKm: 6 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 1, recommended: 2, extended: 3 },
    keyAttractions: ['Kandariya Mahadeva Temple', 'Western Group of Temples UNESCO Complex', 'Raneh Falls Canyons on Ken River', 'Khajuraho Dance Festival (February)']
  },
  'bandhavgarh': {
    id: 'mp-bandhavgarh',
    name: 'Bandhavgarh National Park',
    displayName: 'Bandhavgarh (Royal Bengal Tiger Kingdom)',
    stateOrUt: 'Madhya Pradesh',
    region: 'Central',
    latitude: 23.7015,
    longitude: 80.9992,
    altitudeMeters: 410,
    isHighAltitude: false,
    category: 'Wildlife',
    terrain: 'hills',
    averageRoadSpeedKmH: 40,
    nearestAirport: { code: 'JLR', name: 'Jabalpur Airport', distanceKm: 165 },
    nearestRailhead: { code: 'UMR', name: 'Umaria Railway Station', distanceKm: 32 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    seasonalAlerts: {
      monsoonRiskMonths: [7, 8, 9],
      notice: 'Core safari zones (Tala, Magdhi, Khitauli) are closed July 1 to September 30.'
    },
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Tala Zone Morning Jeep Safari', 'Ancient Bandhavgarh Fort Hilltop Ruins', 'Shesh Shaiya Reclining Vishnu Statue in Forest']
  },

  // ==========================================
  // MAHARASHTRA
  // ==========================================
  'mumbai': {
    id: 'mh-mumbai',
    name: 'Mumbai',
    displayName: 'Mumbai (Gateway of India & Marine Drive)',
    stateOrUt: 'Maharashtra',
    region: 'West',
    latitude: 19.0760,
    longitude: 72.8777,
    altitudeMeters: 14,
    isHighAltitude: false,
    category: 'City',
    terrain: 'coastal',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', distanceKm: 10 },
    nearestRailhead: { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 5 },
    keyAttractions: ['Gateway of India & Taj Mahal Palace Hotel', 'Marine Drive Queen Necklace Promenade', 'Elephanta Caves UNESCO Rock Sculptures', 'Bandra Bandstand & Sea Link View']
  },
  'aurangabad': {
    id: 'mh-aurangabad',
    name: 'Chhatrapati Sambhajinagar (Aurangabad)',
    displayName: 'Chhatrapati Sambhajinagar (Ajanta & Ellora Caves)',
    stateOrUt: 'Maharashtra',
    region: 'West',
    latitude: 19.8762,
    longitude: 75.3433,
    altitudeMeters: 568,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 52,
    nearestAirport: { code: 'IXU', name: 'Aurangabad Airport', distanceKm: 10 },
    nearestRailhead: { code: 'AWB', name: 'Aurangabad Railway Station', distanceKm: 4 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Ellora Kailash Temple Monolithic Marvel (Cave 16)', 'Ajanta Caves Buddhist Fresco Murals', 'Bibi Ka Maqbara (Taj of the Deccan)', 'Daulatabad Fortress']
  },

  // ==========================================
  // MANIPUR
  // ==========================================
  'imphal': {
    id: 'mn-imphal',
    name: 'Imphal',
    displayName: 'Imphal (Kangla Fort & Loktak Floating Lake)',
    stateOrUt: 'Manipur',
    region: 'Northeast',
    latitude: 24.8170,
    longitude: 93.9368,
    altitudeMeters: 786,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'hills',
    averageRoadSpeedKmH: 32,
    nearestAirport: { code: 'IMF', name: 'Bir Tikendrajit International Airport', distanceKm: 8 },
    nearestRailhead: { code: 'DMV', name: 'Dimapur Railway Station', distanceKm: 215 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Kangla Palace Historic Ruins', 'Loktak Lake & Keibul Lamjao (World Only Floating National Park - Sangai Deer)', 'Ima Keithel (All-Women Market)', 'INA War Memorial Moirang']
  },

  // ==========================================
  // MIZORAM
  // ==========================================
  'aizawl': {
    id: 'mz-aizawl',
    name: 'Aizawl',
    displayName: 'Aizawl (Mizo Cloud Hills & Durtlang)',
    stateOrUt: 'Mizoram',
    region: 'Northeast',
    latitude: 23.7271,
    longitude: 92.7176,
    altitudeMeters: 1132,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 28,
    nearestAirport: { code: 'AJL', name: 'Lengpui Airport', distanceKm: 32 },
    nearestRailhead: { code: 'SCL', name: 'Silchar Railway Station', distanceKm: 170 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    permitsRequired: ['Mizoram Inner Line Permit (ILP)'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Durtlang Hills Panorama View', 'Solomon Temple Chawlhhmun', 'Mizoram State Museum', 'Reiek Tlang Peak Trek']
  },

  // ==========================================
  // NAGALAND
  // ==========================================
  'kohima': {
    id: 'nl-kohima',
    name: 'Kohima',
    displayName: 'Kohima (Hornbill Festival & Dzukou Valley)',
    stateOrUt: 'Nagaland',
    region: 'Northeast',
    latitude: 25.6751,
    longitude: 94.1086,
    altitudeMeters: 1444,
    isHighAltitude: false,
    category: 'Cultural',
    terrain: 'hills',
    averageRoadSpeedKmH: 28,
    nearestAirport: { code: 'DMU', name: 'Dimapur Airport', distanceKm: 74 },
    nearestRailhead: { code: 'DMV', name: 'Dimapur Railway Station', distanceKm: 74 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    permitsRequired: ['Nagaland Inner Line Permit (ILP)'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 5 },
    keyAttractions: ['Kisama Heritage Village (Hornbill Festival Dec 1-10)', 'Kohima WWII War Cemetery', 'Dzukou Valley Trek & Lily Blooms', 'Khonoma Green Heritage Village']
  },

  // ==========================================
  // ODISHA
  // ==========================================
  'puri': {
    id: 'od-puri',
    name: 'Puri',
    displayName: 'Puri (Lord Jagannath Temple & Golden Beach)',
    stateOrUt: 'Odisha',
    region: 'East',
    latitude: 19.8135,
    longitude: 85.8312,
    altitudeMeters: 5,
    isHighAltitude: false,
    category: 'Pilgrimage',
    terrain: 'coastal',
    averageRoadSpeedKmH: 50,
    nearestAirport: { code: 'BBI', name: 'Biju Patnaik International Airport (Bhubaneswar)', distanceKm: 60 },
    nearestRailhead: { code: 'PURI', name: 'Puri Railway Station', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Lord Jagannath Temple & Rath Yatra Grandeur', 'Puri Golden Beach (Blue Flag Certified)', 'Konark Sun Temple 13th Century Chariot (35km)', 'Chilika Lake Satapada Dolphin Cruise']
  },

  // ==========================================
  // PUDUCHERRY (UT)
  // ==========================================
  'puducherry': {
    id: 'py-puducherry',
    name: 'Puducherry',
    displayName: 'Puducherry (French Quarter & Auroville)',
    stateOrUt: 'Puducherry',
    region: 'South',
    latitude: 11.9416,
    longitude: 79.8083,
    altitudeMeters: 8,
    isHighAltitude: false,
    category: 'Cultural',
    terrain: 'coastal',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'PNY', name: 'Puducherry Airport / MAA Chennai', distanceKm: 6 },
    nearestRailhead: { code: 'PDY', name: 'Puducherry Railway Station', distanceKm: 2 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['White Town French Quarter Heritage Walk', 'Promenade Beach Promenade', 'Auroville Matrimandir Golden Dome', 'Sri Aurobindo Ashram', 'Paradise Beach Ferry']
  },

  // ==========================================
  // PUNJAB
  // ==========================================
  'amritsar': {
    id: 'pb-amritsar',
    name: 'Amritsar',
    displayName: 'Amritsar (Golden Temple & Wagah Border)',
    stateOrUt: 'Punjab',
    region: 'North',
    latitude: 31.6340,
    longitude: 74.8723,
    altitudeMeters: 234,
    isHighAltitude: false,
    category: 'Pilgrimage',
    terrain: 'plains',
    averageRoadSpeedKmH: 60,
    nearestAirport: { code: 'ATQ', name: 'Sri Guru Ram Dass Jee International Airport', distanceKm: 12 },
    nearestRailhead: { code: 'ASR', name: 'Amritsar Junction', distanceKm: 3 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 2, extended: 3 },
    keyAttractions: ['Sri Harmandir Sahib (The Golden Temple & Guru Ka Langar)', 'Attari-Wagah Border Beating Retreat Ceremony', 'Jallianwala Bagh Historic Memorial', 'Partition Museum Town Hall', 'Amritsari Kulcha Food Trail']
  },

  // ==========================================
  // LAKSHADWEEP (UT)
  // ==========================================
  'agatti island': {
    id: 'ld-agatti',
    name: 'Agatti Island',
    displayName: 'Agatti (Lakshadweep Coral Lagoons & Scuba)',
    stateOrUt: 'Lakshadweep',
    region: 'Islands',
    latitude: 10.8533,
    longitude: 72.1931,
    altitudeMeters: 3,
    isHighAltitude: false,
    category: 'Beach',
    terrain: 'island',
    averageRoadSpeedKmH: 25,
    nearestAirport: { code: 'AGX', name: 'Agatti Airport', distanceKm: 2 },
    nearestRailhead: { code: 'NONE', name: 'Island Territory (Ships/Air from Kochi)', distanceKm: 0 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    permitsRequired: ['Lakshadweep Entry Permit (Mandatory for all visitors)'],
    typicalStayDays: { quick: 3, recommended: 4, extended: 5 },
    keyAttractions: ['Pristine Coral Reef Scuba Diving & Snorkeling', 'Glass-Bottom Boat Lagoon Cruise', 'Bangaram & Thinnakara Uninhabited Island Day Excursions']
  },

  // ==========================================
  // TRIPURA
  // ==========================================
  'agartala': {
    id: 'tr-agartala',
    name: 'Agartala',
    displayName: 'Agartala (Ujjayanta Palace & Neermahal)',
    stateOrUt: 'Tripura',
    region: 'Northeast',
    latitude: 23.8315,
    longitude: 91.2868,
    altitudeMeters: 13,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'IXA', name: 'Maharaja Bir Bikram Airport', distanceKm: 12 },
    nearestRailhead: { code: 'AGTL', name: 'Agartala Railway Station', distanceKm: 5 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 2, extended: 3 },
    keyAttractions: ['Ujjayanta Palace & Mughal Gardens', 'Neermahal Water Palace on Rudrasagar Lake', 'Unakoti Rock Cut Shaivite Carvings', 'Tripura Sundari Temple Udaipur']
  },

  // ==========================================
  // TELANGANA
  // ==========================================
  'hyderabad': {
    id: 'ts-hyderabad',
    name: 'Hyderabad',
    displayName: 'Hyderabad (Charminar, Golconda & Biryani)',
    stateOrUt: 'Telangana',
    region: 'South',
    latitude: 17.3850,
    longitude: 78.4867,
    altitudeMeters: 542,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'plains',
    averageRoadSpeedKmH: 52,
    nearestAirport: { code: 'HYD', name: 'Rajiv Gandhi International Airport (Shamshabad)', distanceKm: 25 },
    nearestRailhead: { code: 'SC', name: 'Secunderabad Junction / HYB Nampally', distanceKm: 4 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Charminar & Laad Bazaar Pearl Market', 'Golconda Fort Acoustic & Light Show', 'Ramoji Film City World Largest Studio', 'Chowmahalla Palace & Salar Jung Museum', 'Hussain Sagar Buddha Monolith Statue']
  },

  // ==========================================
  // WEST BENGAL
  // ==========================================
  'darjeeling': {
    id: 'wb-darjeeling',
    name: 'Darjeeling',
    displayName: 'Darjeeling (Queen of the Hills & Kanchenjunga)',
    stateOrUt: 'West Bengal',
    region: 'Himalayan',
    latitude: 27.0410,
    longitude: 88.2663,
    altitudeMeters: 2042,
    isHighAltitude: false,
    category: 'Hill Station',
    terrain: 'hills',
    averageRoadSpeedKmH: 28,
    nearestAirport: { code: 'IXB', name: 'Bagdogra Airport (Siliguri)', distanceKm: 68 },
    nearestRailhead: { code: 'NJP', name: 'New Jalpaiguri Junction', distanceKm: 72 },
    bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov', 'Dec'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Tiger Hill Kanchenjunga Sunrise View', 'Darjeeling Himalayan Railway (Toy Train UNESCO Site)', 'Batasia Loop & War Memorial', 'Happy Valley Tea Estate Tour', 'Padmaja Naidu Himalayan Zoo (Red Pandas)']
  },
  'kolkata': {
    id: 'wb-kolkata',
    name: 'Kolkata',
    displayName: 'Kolkata (City of Joy, Victoria Memorial & Howrah Bridge)',
    stateOrUt: 'West Bengal',
    region: 'East',
    latitude: 22.5726,
    longitude: 88.3639,
    altitudeMeters: 9,
    isHighAltitude: false,
    category: 'Cultural',
    terrain: 'plains',
    averageRoadSpeedKmH: 45,
    nearestAirport: { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', distanceKm: 16 },
    nearestRailhead: { code: 'HWH', name: 'Howrah Junction / SDAH Sealdah', distanceKm: 4 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 5 },
    keyAttractions: ['Victoria Memorial Hall & Gardens', 'Howrah Bridge over Hooghly River', 'Dakshineswar Kali Temple & Belur Math', 'Indian Museum & Park Street Colonial Heritage', 'Kumartuli Clay Idol Makers Colony']
  }
};

/**
 * Standard Indian City Hub Coordinates Database
 * Resolves Origin locations accurately to avoid hardcoded fallbacks
 */
export const MAJOR_ORIGIN_HUBS: Record<string, { city: string; state: string; lat: number; lng: number; primaryAirport: string; primaryRailhead: string }> = {
  'ahmedabad': { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, primaryAirport: 'AMD', primaryRailhead: 'ADI' },
  'surat': { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, primaryAirport: 'STV', primaryRailhead: 'ST' },
  'vadodara': { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, primaryAirport: 'BDQ', primaryRailhead: 'BRC' },
  'rajkot': { city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, primaryAirport: 'HSR', primaryRailhead: 'RJT' },
  'delhi': { city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, primaryAirport: 'DEL', primaryRailhead: 'NDLS' },
  'new delhi': { city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, primaryAirport: 'DEL', primaryRailhead: 'NDLS' },
  'mumbai': { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, primaryAirport: 'BOM', primaryRailhead: 'CSMT' },
  'pune': { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, primaryAirport: 'PNQ', primaryRailhead: 'PUNE' },
  'bengaluru': { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, primaryAirport: 'BLR', primaryRailhead: 'SBC' },
  'bangalore': { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, primaryAirport: 'BLR', primaryRailhead: 'SBC' },
  'chennai': { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, primaryAirport: 'MAA', primaryRailhead: 'MAS' },
  'hyderabad': { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, primaryAirport: 'HYD', primaryRailhead: 'SC' },
  'kolkata': { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, primaryAirport: 'CCU', primaryRailhead: 'HWH' },
  'chandigarh': { city: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7333, lng: 76.7794, primaryAirport: 'IXC', primaryRailhead: 'CDG' },
  'jaipur': { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, primaryAirport: 'JAI', primaryRailhead: 'JP' },
  'lucknow': { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, primaryAirport: 'LKO', primaryRailhead: 'LKO' },
  'varanasi': { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, primaryAirport: 'VNS', primaryRailhead: 'BSB' },
  'kochi': { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, primaryAirport: 'COK', primaryRailhead: 'ERS' },
  'cochin': { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, primaryAirport: 'COK', primaryRailhead: 'ERS' },
  'thiruvananthapuram': { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366, primaryAirport: 'TRV', primaryRailhead: 'TVC' },
  'trivandrum': { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366, primaryAirport: 'TRV', primaryRailhead: 'TVC' },
  'guwahati': { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, primaryAirport: 'GAU', primaryRailhead: 'GHY' },
  'bhopal': { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, primaryAirport: 'BHO', primaryRailhead: 'BPL' },
  'indore': { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, primaryAirport: 'IDR', primaryRailhead: 'INDB' },
  'patna': { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, primaryAirport: 'PAT', primaryRailhead: 'PNBE' },
  'bhubaneswar': { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, primaryAirport: 'BBI', primaryRailhead: 'BBS' },
  'amritsar': { city: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, primaryAirport: 'ATQ', primaryRailhead: 'ASR' },
  'dehradun': { city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322, primaryAirport: 'DED', primaryRailhead: 'DDN' },
  'jammu': { city: 'Jammu', state: 'Jammu and Kashmir', lat: 32.7266, lng: 74.8570, primaryAirport: 'IXJ', primaryRailhead: 'JAT' },
  'srinagar': { city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973, primaryAirport: 'SXR', primaryRailhead: 'JAT' },
  'leh': { city: 'Leh', state: 'Ladakh', lat: 34.1526, lng: 77.5771, primaryAirport: 'IXL', primaryRailhead: 'JAT' },
  'goa': { city: 'Panaji', state: 'Goa', lat: 15.4989, lng: 73.8278, primaryAirport: 'GOI', primaryRailhead: 'MAO' },
};

/**
 * Resolves Origin coordinates dynamically from Indian city registry
 */
export function resolveOriginCoordinates(cityInput?: string): { city: string; state: string; lat: number; lng: number } {
  if (!cityInput) {
    return { city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 };
  }
  const clean = cityInput.toLowerCase().trim();
  const matched = MAJOR_ORIGIN_HUBS[clean];
  if (matched) {
    return { city: matched.city, state: matched.state, lat: matched.lat, lng: matched.lng };
  }
  // Fallback to New Delhi capital coordinates if unrecognized
  return { city: cityInput, state: 'India', lat: 28.6139, lng: 77.2090 };
}

/**
 * Resolves destination information by name, state, or alias across India
 */
export function findDestinationInfo(query?: string): GeoDestinationInfo | undefined {
  if (!query) return undefined;
  const clean = query.toLowerCase().trim();
  if (INDIA_DESTINATIONS_REGISTRY[clean]) return INDIA_DESTINATIONS_REGISTRY[clean];

  // Direct state alias shortcuts
  if (clean === 'ladakh') return INDIA_DESTINATIONS_REGISTRY['leh'];
  if (clean === 'meghalaya') return INDIA_DESTINATIONS_REGISTRY['shillong'];
  if (clean === 'kerala') return INDIA_DESTINATIONS_REGISTRY['munnar'];
  if (clean === 'rajasthan') return INDIA_DESTINATIONS_REGISTRY['jaipur'];
  if (clean.includes('himachal')) return INDIA_DESTINATIONS_REGISTRY['manali'];
  if (clean === 'uttarakhand') return INDIA_DESTINATIONS_REGISTRY['rishikesh'];
  if (clean === 'tamil nadu') return INDIA_DESTINATIONS_REGISTRY['ooty'];
  if (clean === 'karnataka') return INDIA_DESTINATIONS_REGISTRY['hampi'];
  if (clean === 'sikkim') return INDIA_DESTINATIONS_REGISTRY['gangtok'];
  if (clean === 'uttar pradesh') return INDIA_DESTINATIONS_REGISTRY['varanasi'];
  if (clean === 'andaman' || clean.includes('andaman')) return INDIA_DESTINATIONS_REGISTRY['port blair'];

  // Search by name, state, or attraction in registry
  const match = Object.values(INDIA_DESTINATIONS_REGISTRY).find(d => 
    d.name.toLowerCase() === clean ||
    d.displayName.toLowerCase().includes(clean) ||
    clean.includes(d.name.toLowerCase()) ||
    d.stateOrUt.toLowerCase() === clean ||
    clean.includes(d.stateOrUt.toLowerCase())
  );
  if (match) return match;

  // Fallback to Destination Master Service (1,162 verified destinations across all 36 States/UTs)
  try {
    const masterDest = findDestinationMaster(query);
    if (masterDest) {
      return {
        id: masterDest.id,
        name: masterDest.canonicalName,
        displayName: `${masterDest.canonicalName} (${masterDest.stateOrUt})`,
        stateOrUt: masterDest.stateOrUt,
        region: masterDest.region,
        district: masterDest.district,
        latitude: masterDest.latitude,
        longitude: masterDest.longitude,
        altitudeMeters: masterDest.altitudeMeters,
        isHighAltitude: masterDest.isHighAltitude,
        category: (masterDest.category as any) || 'Heritage',
        terrain: masterDest.terrain,
        averageRoadSpeedKmH: masterDest.averageRoadSpeedKmH,
        nearestAirport: masterDest.nearestAirport,
        nearestRailhead: masterDest.nearestRailhead,
        bestMonths: masterDest.bestMonths,
        permitsRequired: masterDest.permitsRequired,
        typicalStayDays: masterDest.recommendedStayDays,
        keyAttractions: masterDest.aliases.length > 0 ? masterDest.aliases : [masterDest.canonicalName],
      };
    }
  } catch (err) {
    // Graceful fallback
  }

  return undefined;
}
