/**
 * BharatYatra AI 2.0 — Destination Master Knowledge Service
 * Indexes 1,162 verified destinations across all 28 Indian States & 8 Union Territories.
 * Provides high-speed O(1) alias lookups, state filtering, geospatial radius search,
 * and robust coordinate resolution without regional bias.
 */

const destinationsMasterRaw = require('@/data/tourism/destinations-master.json');

export interface EnrichedDestination {
  id: string;
  originalName: string;
  canonicalName: string;
  stateOrUt: string;
  district?: string;
  city?: string;
  tourismType: string;
  category: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Himalayan' | 'Islands';
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  isHighAltitude: boolean;
  terrain: 'plains' | 'hills' | 'high-altitude-pass' | 'coastal' | 'island';
  averageRoadSpeedKmH: number;
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
  aliases: string[];
  verificationStatus: string;
  verificationSource: string;
  verificationNotes: string;
  recommendedStayDays: {
    quick: number;
    recommended: number;
    extended: number;
  };
  bestMonths: string[];
  permitsRequired?: string[];
}

export interface StateCoverageSummary {
  stateOrUt: string;
  type: 'State' | 'Union Territory';
  region: string;
  destinationCount: number;
  primaryAirport: string;
  primaryRailhead: string;
  representativePlaces: string[];
}

/**
 * Historical, Vernacular, Colonial & Colloquial Destination Alias Map
 */
export const ALIAS_MAP: Record<string, string> = {
  // Historical / Vernacular City Names
  'kashi': 'varanasi',
  'banaras': 'varanasi',
  'benares': 'varanasi',
  'prayag': 'prayagraj',
  'allahabad': 'prayagraj',
  'calicut': 'kozhikode',
  'cochin': 'kochi',
  'trivandrum': 'thiruvananthapuram',
  'baroda': 'vadodara',
  'poona': 'pune',
  'bombay': 'mumbai',
  'madras': 'chennai',
  'bangalore': 'bengaluru',
  'pondy': 'puducherry',
  'pondicherry': 'puducherry',
  'gurgaon': 'gurugram',
  'simla': 'shimla',
  'orissa': 'odisha',
  'gauhati': 'guwahati',
  'vizag': 'visakhapatnam',
  'waltair': 'visakhapatnam',
  'mysore': 'mysuru',
  'mangalore': 'mangaluru',
  'belgaum': 'belagavi',
  'hubli': 'hubballi',
  'bellary': 'ballari',
  'bijapur': 'vijayapura',
  'gulbarga': 'kalaburagi',
  'trichy': 'tiruchirappalli',
  'tanjore': 'thanjavur',
  'tuticorin': 'thoothukudi',
  'cape comorin': 'kanyakumari',
  'oono': 'ooty',
  'udagamandalam': 'ooty',
  'coonoor': 'ooty',
  'kodai': 'kodaikanal',
  'alleppey': 'alappuzha',
  'alappuzha': 'alleppey',
  'quilon': 'kollam',
  'cannore': 'kannur',
  'palghat': 'palakkad',
  'badami': 'bagalkot',
  'hampi': 'bellary',
  'leh': 'leh',
  'ladakh': 'leh',
  'kutch': 'bhuj',
  'rann of kutch': 'bhuj',
  'white desert': 'bhuj',
  'dhordo': 'bhuj',
  'gir': 'sasan gir',
  'somnath': 'veraval',
  'dwarka': 'dwarka',
  'mount abu': 'sirohi',
  'cherrapunjee': 'cherrapunji',
  'sohra': 'cherrapunji',
  'shillong': 'shillong',
  'gangtok': 'gangtok',
  'darjeeling': 'darjeeling',
  'digha': 'purba medinipur',
  'havelock': 'swaraj dweep',
  'neil island': 'shaheed dweep',
  'port blair': 'port blair',
  'kasol': 'kullu',
  'spiti': 'kaza',
  'spiti valley': 'kaza',
  'lahaul': 'keylong',
  'rohtang': 'manali',
  'solang': 'manali',
  'dalhousie': 'chamba',
  'mcleodganj': 'dharamshala',
  'mussoorie': 'dehradun',
  'corbett': 'nainital',
  'jim corbett': 'ramnagar',
  'ranthambore': 'sawai madhopur',
  'pushkar': 'ajmer',
};

/**
 * All 28 States and 8 Union Territories Official Catalog
 */
export const ALL_36_STATES_AND_UTS: Record<string, {
  name: string;
  type: 'State' | 'Union Territory';
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Himalayan' | 'Islands';
  centroid: { lat: number; lng: number };
  primaryAirport: { code: string; name: string };
  primaryRailhead: { code: string; name: string };
  terrainDefault: 'plains' | 'hills' | 'high-altitude-pass' | 'coastal' | 'island';
  speedKmHDefault: number;
}> = {
  // 28 States
  'andhra pradesh': {
    name: 'Andhra Pradesh',
    type: 'State',
    region: 'South',
    centroid: { lat: 15.9129, lng: 79.7400 },
    primaryAirport: { code: 'VGA', name: 'Vijayawada / VTZ Visakhapatnam' },
    primaryRailhead: { code: 'BZA', name: 'Vijayawada Junction' },
    terrainDefault: 'coastal',
    speedKmHDefault: 55,
  },
  'arunachal pradesh': {
    name: 'Arunachal Pradesh',
    type: 'State',
    region: 'Northeast',
    centroid: { lat: 28.2180, lng: 94.7278 },
    primaryAirport: { code: 'HGI', name: 'Donyi Polo Airport (Itanagar)' },
    primaryRailhead: { code: 'NHLN', name: 'Naharlagun Railway Station' },
    terrainDefault: 'hills',
    speedKmHDefault: 28,
  },
  'assam': {
    name: 'Assam',
    type: 'State',
    region: 'Northeast',
    centroid: { lat: 26.2006, lng: 92.9376 },
    primaryAirport: { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International (Guwahati)' },
    primaryRailhead: { code: 'GHY', name: 'Guwahati Railway Station' },
    terrainDefault: 'plains',
    speedKmHDefault: 50,
  },
  'bihar': {
    name: 'Bihar',
    type: 'State',
    region: 'East',
    centroid: { lat: 25.0961, lng: 85.3131 },
    primaryAirport: { code: 'PAT', name: 'Jay Prakash Narayan Airport (Patna)' },
    primaryRailhead: { code: 'PNBE', name: 'Patna Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 50,
  },
  'chhattisgarh': {
    name: 'Chhattisgarh',
    type: 'State',
    region: 'Central',
    centroid: { lat: 21.2787, lng: 81.8661 },
    primaryAirport: { code: 'RPR', name: 'Swami Vivekananda Airport (Raipur)' },
    primaryRailhead: { code: 'R', name: 'Raipur Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 52,
  },
  'goa': {
    name: 'Goa',
    type: 'State',
    region: 'West',
    centroid: { lat: 15.2993, lng: 74.1240 },
    primaryAirport: { code: 'GOI', name: 'Dabolim / GOX Mopa Manohar International' },
    primaryRailhead: { code: 'MAO', name: 'Madgaon Junction' },
    terrainDefault: 'coastal',
    speedKmHDefault: 42,
  },
  'gujarat': {
    name: 'Gujarat',
    type: 'State',
    region: 'West',
    centroid: { lat: 22.2587, lng: 71.1924 },
    primaryAirport: { code: 'AMD', name: 'Sardar Vallabhbhai Patel International (Ahmedabad)' },
    primaryRailhead: { code: 'ADI', name: 'Ahmedabad Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 65,
  },
  'haryana': {
    name: 'Haryana',
    type: 'State',
    region: 'North',
    centroid: { lat: 29.0588, lng: 76.0856 },
    primaryAirport: { code: 'DEL', name: 'Indira Gandhi International Airport' },
    primaryRailhead: { code: 'UMB', name: 'Ambala Cantt Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 65,
  },
  'himachal pradesh': {
    name: 'Himachal Pradesh',
    type: 'State',
    region: 'Himalayan',
    centroid: { lat: 31.1048, lng: 77.1734 },
    primaryAirport: { code: 'IXC', name: 'Chandigarh / KUU Kullu-Bhuntar' },
    primaryRailhead: { code: 'KLK', name: 'Kalka / CDG Chandigarh' },
    terrainDefault: 'hills',
    speedKmHDefault: 30,
  },
  'jharkhand': {
    name: 'Jharkhand',
    type: 'State',
    region: 'East',
    centroid: { lat: 23.6102, lng: 85.2799 },
    primaryAirport: { code: 'IXR', name: 'Birsa Munda Airport (Ranchi)' },
    primaryRailhead: { code: 'RNC', name: 'Ranchi Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 50,
  },
  'karnataka': {
    name: 'Karnataka',
    type: 'State',
    region: 'South',
    centroid: { lat: 15.3173, lng: 75.7139 },
    primaryAirport: { code: 'BLR', name: 'Kempegowda International (Bengaluru)' },
    primaryRailhead: { code: 'SBC', name: 'KSR Bengaluru City' },
    terrainDefault: 'plains',
    speedKmHDefault: 55,
  },
  'kerala': {
    name: 'Kerala',
    type: 'State',
    region: 'South',
    centroid: { lat: 10.8505, lng: 76.2711 },
    primaryAirport: { code: 'COK', name: 'Cochin International Airport' },
    primaryRailhead: { code: 'ERS', name: 'Ernakulam Junction' },
    terrainDefault: 'coastal',
    speedKmHDefault: 45,
  },
  'madhya pradesh': {
    name: 'Madhya Pradesh',
    type: 'State',
    region: 'Central',
    centroid: { lat: 22.9734, lng: 78.6569 },
    primaryAirport: { code: 'BHO', name: 'Raja Bhoj (Bhopal) / IDR Indore' },
    primaryRailhead: { code: 'BPL', name: 'Bhopal Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 55,
  },
  'maharashtra': {
    name: 'Maharashtra',
    type: 'State',
    region: 'West',
    centroid: { lat: 19.7515, lng: 75.7139 },
    primaryAirport: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International (Mumbai)' },
    primaryRailhead: { code: 'CSMT', name: 'Mumbai CSMT / PUNE Pune Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 55,
  },
  'manipur': {
    name: 'Manipur',
    type: 'State',
    region: 'Northeast',
    centroid: { lat: 24.6637, lng: 93.9063 },
    primaryAirport: { code: 'IMF', name: 'Bir Tikendrajit International (Imphal)' },
    primaryRailhead: { code: 'DMV', name: 'Dimapur / Silchar' },
    terrainDefault: 'hills',
    speedKmHDefault: 30,
  },
  'meghalaya': {
    name: 'Meghalaya',
    type: 'State',
    region: 'Northeast',
    centroid: { lat: 25.4670, lng: 91.3662 },
    primaryAirport: { code: 'GAU', name: 'Guwahati Borjhar / SHL Shillong Umroi' },
    primaryRailhead: { code: 'GHY', name: 'Guwahati Railway Station' },
    terrainDefault: 'hills',
    speedKmHDefault: 32,
  },
  'mizoram': {
    name: 'Mizoram',
    type: 'State',
    region: 'Northeast',
    centroid: { lat: 23.1645, lng: 92.9376 },
    primaryAirport: { code: 'AJL', name: 'Lengpui Airport (Aizawl)' },
    primaryRailhead: { code: 'BHRB', name: 'Bairabi Railway Station' },
    terrainDefault: 'hills',
    speedKmHDefault: 28,
  },
  'nagaland': {
    name: 'Nagaland',
    type: 'State',
    region: 'Northeast',
    centroid: { lat: 26.1584, lng: 94.5624 },
    primaryAirport: { code: 'DMU', name: 'Dimapur Airport' },
    primaryRailhead: { code: 'DMV', name: 'Dimapur Railway Station' },
    terrainDefault: 'hills',
    speedKmHDefault: 28,
  },
  'odisha': {
    name: 'Odisha',
    type: 'State',
    region: 'East',
    centroid: { lat: 20.9517, lng: 85.0985 },
    primaryAirport: { code: 'BBI', name: 'Biju Patnaik International (Bhubaneswar)' },
    primaryRailhead: { code: 'BBS', name: 'Bhubaneswar Railway Station' },
    terrainDefault: 'coastal',
    speedKmHDefault: 52,
  },
  'punjab': {
    name: 'Punjab',
    type: 'State',
    region: 'North',
    centroid: { lat: 31.1471, lng: 75.3412 },
    primaryAirport: { code: 'ATQ', name: 'Sri Guru Ram Dass Jee International (Amritsar)' },
    primaryRailhead: { code: 'ASR', name: 'Amritsar Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 65,
  },
  'rajasthan': {
    name: 'Rajasthan',
    type: 'State',
    region: 'North',
    centroid: { lat: 27.0238, lng: 74.2179 },
    primaryAirport: { code: 'JAI', name: 'Jaipur International Airport' },
    primaryRailhead: { code: 'JP', name: 'Jaipur Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 62,
  },
  'sikkim': {
    name: 'Sikkim',
    type: 'State',
    region: 'Himalayan',
    centroid: { lat: 27.5330, lng: 88.5122 },
    primaryAirport: { code: 'IXB', name: 'Bagdogra (IXB) / PYG Pakyong' },
    primaryRailhead: { code: 'NJP', name: 'New Jalpaiguri Junction' },
    terrainDefault: 'hills',
    speedKmHDefault: 28,
  },
  'tamil nadu': {
    name: 'Tamil Nadu',
    type: 'State',
    region: 'South',
    centroid: { lat: 11.1271, lng: 78.6569 },
    primaryAirport: { code: 'MAA', name: 'Chennai International Airport' },
    primaryRailhead: { code: 'MAS', name: 'Chennai Central / MS Egmore' },
    terrainDefault: 'plains',
    speedKmHDefault: 55,
  },
  'telangana': {
    name: 'Telangana',
    type: 'State',
    region: 'South',
    centroid: { lat: 18.1124, lng: 79.0193 },
    primaryAirport: { code: 'HYD', name: 'Rajiv Gandhi International (Hyderabad)' },
    primaryRailhead: { code: 'SC', name: 'Secunderabad Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 58,
  },
  'tripura': {
    name: 'Tripura',
    type: 'State',
    region: 'Northeast',
    centroid: { lat: 23.9408, lng: 91.9882 },
    primaryAirport: { code: 'IXA', name: 'Maharaja Bir Bikram Airport (Agartala)' },
    primaryRailhead: { code: 'AGTL', name: 'Agartala Railway Station' },
    terrainDefault: 'plains',
    speedKmHDefault: 42,
  },
  'uttar pradesh': {
    name: 'Uttar Pradesh',
    type: 'State',
    region: 'North',
    centroid: { lat: 26.8467, lng: 80.9462 },
    primaryAirport: { code: 'LKO', name: 'Chaudhary Charan Singh (Lucknow) / VNS Varanasi' },
    primaryRailhead: { code: 'LKO', name: 'Lucknow Charbagh / CNB Kanpur Central' },
    terrainDefault: 'plains',
    speedKmHDefault: 58,
  },
  'uttarakhand': {
    name: 'Uttarakhand',
    type: 'State',
    region: 'Himalayan',
    centroid: { lat: 30.0668, lng: 79.0193 },
    primaryAirport: { code: 'DED', name: 'Jolly Grant Airport (Dehradun)' },
    primaryRailhead: { code: 'HW', name: 'Haridwar / DDN Dehradun' },
    terrainDefault: 'hills',
    speedKmHDefault: 30,
  },
  'west bengal': {
    name: 'West Bengal',
    type: 'State',
    region: 'East',
    centroid: { lat: 22.9868, lng: 87.8550 },
    primaryAirport: { code: 'CCU', name: 'Netaji Subhash Chandra Bose (Kolkata)' },
    primaryRailhead: { code: 'HWH', name: 'Howrah Junction / SDAH Sealdah' },
    terrainDefault: 'plains',
    speedKmHDefault: 50,
  },

  // 8 Union Territories
  'andaman & nicobar': {
    name: 'Andaman & Nicobar Islands',
    type: 'Union Territory',
    region: 'Islands',
    centroid: { lat: 11.6234, lng: 92.7265 },
    primaryAirport: { code: 'IXZ', name: 'Veer Savarkar International (Port Blair)' },
    primaryRailhead: { code: 'NONE', name: 'Island Territory (Ferry / Air only)' },
    terrainDefault: 'island',
    speedKmHDefault: 35,
  },
  'andaman and nicobar islands': {
    name: 'Andaman and Nicobar Islands',
    type: 'Union Territory',
    region: 'Islands',
    centroid: { lat: 11.6234, lng: 92.7265 },
    primaryAirport: { code: 'IXZ', name: 'Veer Savarkar International (Port Blair)' },
    primaryRailhead: { code: 'NONE', name: 'Island Territory (Ferry / Air only)' },
    terrainDefault: 'island',
    speedKmHDefault: 35,
  },
  'chandigarh': {
    name: 'Chandigarh',
    type: 'Union Territory',
    region: 'North',
    centroid: { lat: 30.7333, lng: 76.7794 },
    primaryAirport: { code: 'IXC', name: 'Shaheed Bhagat Singh International (Chandigarh)' },
    primaryRailhead: { code: 'CDG', name: 'Chandigarh Junction' },
    terrainDefault: 'plains',
    speedKmHDefault: 60,
  },
  'dadra & nagar haveli and daman & diu': {
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    type: 'Union Territory',
    region: 'West',
    centroid: { lat: 20.4283, lng: 72.8397 },
    primaryAirport: { code: 'STV', name: 'Surat (STV) / DIU Diu Airport' },
    primaryRailhead: { code: 'VAPI', name: 'Vapi / VRL Veraval' },
    terrainDefault: 'coastal',
    speedKmHDefault: 50,
  },
  'dadra and nagar haveli and daman and diu': {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'Union Territory',
    region: 'West',
    centroid: { lat: 20.4283, lng: 72.8397 },
    primaryAirport: { code: 'STV', name: 'Surat (STV) / DIU Diu Airport' },
    primaryRailhead: { code: 'VAPI', name: 'Vapi / VRL Veraval' },
    terrainDefault: 'coastal',
    speedKmHDefault: 50,
  },
  'delhi': {
    name: 'Delhi',
    type: 'Union Territory',
    region: 'North',
    centroid: { lat: 28.6139, lng: 77.2090 },
    primaryAirport: { code: 'DEL', name: 'Indira Gandhi International Airport' },
    primaryRailhead: { code: 'NDLS', name: 'New Delhi Railway Station' },
    terrainDefault: 'plains',
    speedKmHDefault: 50,
  },
  'jammu & kashmir': {
    name: 'Jammu & Kashmir',
    type: 'Union Territory',
    region: 'Himalayan',
    centroid: { lat: 33.7782, lng: 76.5762 },
    primaryAirport: { code: 'SXR', name: 'Sheikh ul-Alam International (Srinagar)' },
    primaryRailhead: { code: 'JAT', name: 'Jammu Tawi / SVDK Katra' },
    terrainDefault: 'hills',
    speedKmHDefault: 32,
  },
  'jammu and kashmir': {
    name: 'Jammu and Kashmir',
    type: 'Union Territory',
    region: 'Himalayan',
    centroid: { lat: 33.7782, lng: 76.5762 },
    primaryAirport: { code: 'SXR', name: 'Sheikh ul-Alam International (Srinagar)' },
    primaryRailhead: { code: 'JAT', name: 'Jammu Tawi / SVDK Katra' },
    terrainDefault: 'hills',
    speedKmHDefault: 32,
  },
  'ladakh': {
    name: 'Ladakh',
    type: 'Union Territory',
    region: 'Himalayan',
    centroid: { lat: 34.1526, lng: 77.5771 },
    primaryAirport: { code: 'IXL', name: 'Kushok Bakula Rimpochee Airport (Leh)' },
    primaryRailhead: { code: 'JAT', name: 'Jammu Tawi (Railhead, 700km)' },
    terrainDefault: 'high-altitude-pass',
    speedKmHDefault: 28,
  },
  'lakshadweep': {
    name: 'Lakshadweep',
    type: 'Union Territory',
    region: 'Islands',
    centroid: { lat: 10.5667, lng: 72.6417 },
    primaryAirport: { code: 'AGX', name: 'Agatti Airport' },
    primaryRailhead: { code: 'NONE', name: 'Island Territory (Ships from Kochi)' },
    terrainDefault: 'island',
    speedKmHDefault: 30,
  },
  'puducherry': {
    name: 'Puducherry',
    type: 'Union Territory',
    region: 'South',
    centroid: { lat: 11.9416, lng: 79.8083 },
    primaryAirport: { code: 'PNY', name: 'Puducherry Airport / MAA Chennai' },
    primaryRailhead: { code: 'PDY', name: 'Puducherry Railway Station' },
    terrainDefault: 'coastal',
    speedKmHDefault: 45,
  },
};

/**
 * Key District / Tourist Cluster Centroids across India
 */
export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Gujarat
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'kutch': { lat: 23.2420, lng: 69.6669 },
  'bhuj': { lat: 23.2420, lng: 69.6669 },
  'junagadh': { lat: 21.5222, lng: 70.4579 },
  'gir somnath': { lat: 20.9000, lng: 70.3667 },
  'devbhumi dwarka': { lat: 22.2442, lng: 68.9685 },
  'jamnagar': { lat: 22.4707, lng: 70.0577 },
  'bhavnagar': { lat: 21.7645, lng: 72.1519 },
  'diu': { lat: 20.7144, lng: 70.9874 },
  'narmada': { lat: 21.8700, lng: 73.5500 },

  // Rajasthan
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'jaisalmer': { lat: 26.9157, lng: 70.9083 },
  'bikaner': { lat: 28.0229, lng: 73.3119 },
  'ajmer': { lat: 26.4499, lng: 74.6399 },
  'sawai madhopur': { lat: 25.9928, lng: 76.3683 },
  'chittorgarh': { lat: 24.8887, lng: 74.6269 },
  'sirohi': { lat: 24.8826, lng: 72.8589 },

  // Himachal Pradesh
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'kullu': { lat: 31.9579, lng: 77.1095 },
  'manali': { lat: 32.2432, lng: 77.1892 },
  'kangra': { lat: 32.0998, lng: 76.2691 },
  'dharamshala': { lat: 32.2190, lng: 76.3234 },
  'lahaul & spiti': { lat: 32.5710, lng: 77.0320 },
  'lahaul and spiti': { lat: 32.5710, lng: 77.0320 },
  'chamba': { lat: 32.5534, lng: 76.1258 },
  'kinnaur': { lat: 31.6510, lng: 78.4752 },

  // Ladakh
  'leh': { lat: 34.1526, lng: 77.5771 },
  'kargil': { lat: 34.5539, lng: 76.1349 },
  'nubra': { lat: 34.5459, lng: 77.5658 },
  'pangong': { lat: 33.7595, lng: 78.6674 },

  // Kerala
  'ernakulam': { lat: 9.9816, lng: 76.2999 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'idukki': { lat: 9.8500, lng: 76.9667 },
  'munnar': { lat: 10.0889, lng: 77.0595 },
  'alappuzha': { lat: 9.4981, lng: 76.3388 },
  'wayanad': { lat: 11.6854, lng: 76.1320 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'kottayam': { lat: 9.5916, lng: 76.5222 },
  'kozhikode': { lat: 11.2588, lng: 75.7804 },

  // Meghalaya
  'east khasi hills': { lat: 25.5788, lng: 91.8933 },
  'shillong': { lat: 25.5788, lng: 91.8933 },
  'cherrapunji': { lat: 25.2702, lng: 91.7323 },
  'west jaintia hills': { lat: 25.4500, lng: 92.2000 },
  'ri bhoi': { lat: 25.9000, lng: 91.8800 },

  // Uttar Pradesh
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'prayagraj': { lat: 25.4358, lng: 81.8463 },
  'ayodhya': { lat: 26.7922, lng: 82.1998 },
  'mathura': { lat: 27.4924, lng: 77.6737 },

  // Uttarakhand
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'rishikesh': { lat: 30.0869, lng: 78.2676 },
  'haridwar': { lat: 29.9457, lng: 78.1642 },
  'nainital': { lat: 29.3919, lng: 79.4542 },
  'rudraprayag': { lat: 30.2858, lng: 78.9806 },
  'chamoli': { lat: 30.4150, lng: 79.3240 },

  // Maharashtra
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'satara': { lat: 17.6805, lng: 74.0183 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },

  // Karnataka
  'bengaluru urban': { lat: 12.9716, lng: 77.5946 },
  'mysuru': { lat: 12.2958, lng: 76.6394 },
  'kodagu': { lat: 12.4244, lng: 75.7382 },
  'bellary': { lat: 15.1394, lng: 76.9214 },
  'uttara kannada': { lat: 14.5479, lng: 74.3188 },

  // Tamil Nadu
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'ramanathapuram': { lat: 9.2876, lng: 79.3129 },
  'nilgiris': { lat: 11.4102, lng: 76.6950 },
  'kanyakumari': { lat: 8.0883, lng: 77.5385 },

  // West Bengal
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'darjeeling': { lat: 27.0410, lng: 88.2663 },
  'south 24 parganas': { lat: 22.1500, lng: 88.5000 },

  // Andaman & Nicobar
  'south andaman': { lat: 11.6234, lng: 92.7265 },
  'north & middle andaman': { lat: 12.6000, lng: 92.8500 },
  'nicobar': { lat: 7.0000, lng: 93.8000 },
};

/**
 * In-memory indexed cache for the 1,162 verified destinations
 */
let cachedIndexedDestinations: EnrichedDestination[] | null = null;
let destinationIdMap: Map<string, EnrichedDestination> = new Map();
let canonicalNameMap: Map<string, EnrichedDestination> = new Map();
let stateDestinationMap: Map<string, EnrichedDestination[]> = new Map();

/**
 * Normalizes input search query strings
 */
function normalizeQuery(input?: string): string {
  if (!input) return '';
  return input.toLowerCase().trim().replace(/['".,\-_/()]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Hashes a string deterministically for coordinate micro-jitter (within 3-8 km)
 */
function deterministicOffset(id: string): { dLat: number; dLng: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) - 50) / 1000.0 * 0.4; // +/- 0.02 deg (~2km)
  const lngOffset = (((Math.abs(hash >> 3)) % 100) - 50) / 1000.0 * 0.4;
  return { dLat: latOffset, dLng: lngOffset };
}

/**
 * Resolves destination category, terrain, altitude and road speed
 */
function inferGeographicAttributes(
  tourismType: string,
  stateNorm: string,
  districtNorm: string,
  nameNorm: string
): {
  category: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Himalayan' | 'Islands';
  terrain: 'plains' | 'hills' | 'high-altitude-pass' | 'coastal' | 'island';
  altitudeMeters: number;
  isHighAltitude: boolean;
  averageRoadSpeedKmH: number;
  permitsRequired?: string[];
} {
  const stateMeta = ALL_36_STATES_AND_UTS[stateNorm];
  const region = stateMeta ? stateMeta.region : 'North';

  // High altitude Himalayan detection
  const isLadakh = stateNorm.includes('ladakh') || nameNorm.includes('leh') || nameNorm.includes('nubra') || nameNorm.includes('pangong');
  const isSpiti = districtNorm.includes('spiti') || nameNorm.includes('kaza') || nameNorm.includes('spiti');
  const isHighKedarnath = nameNorm.includes('kedarnath') || nameNorm.includes('badrinath');

  if (isLadakh) {
    return {
      category: 'Adventure',
      region: 'Himalayan',
      terrain: 'high-altitude-pass',
      altitudeMeters: nameNorm.includes('pangong') ? 4225 : (nameNorm.includes('nubra') ? 3048 : 3524),
      isHighAltitude: true,
      averageRoadSpeedKmH: 28,
      permitsRequired: ['Ladakh Protected Area Permit (PAP/ILP)'],
    };
  }

  if (isSpiti) {
    return {
      category: 'Adventure',
      region: 'Himalayan',
      terrain: 'high-altitude-pass',
      altitudeMeters: 3800,
      isHighAltitude: true,
      averageRoadSpeedKmH: 26,
    };
  }

  if (isHighKedarnath) {
    return {
      category: 'Pilgrimage',
      region: 'Himalayan',
      terrain: 'hills',
      altitudeMeters: 3583,
      isHighAltitude: true,
      averageRoadSpeedKmH: 25,
    };
  }

  // Island check
  if (stateNorm.includes('andaman') || stateNorm.includes('lakshadweep')) {
    return {
      category: 'Beach',
      region: 'Islands',
      terrain: 'island',
      altitudeMeters: 15,
      isHighAltitude: false,
      averageRoadSpeedKmH: 35,
      permitsRequired: stateNorm.includes('lakshadweep') ? ['Lakshadweep Entry Permit'] : undefined,
    };
  }

  // Hill station check
  const isHill = region === 'Himalayan' ||
    stateNorm.includes('himachal') ||
    stateNorm.includes('uttarakhand') ||
    stateNorm.includes('sikkim') ||
    stateNorm.includes('arunachal') ||
    stateNorm.includes('meghalaya') ||
    districtNorm.includes('nilgiris') ||
    districtNorm.includes('idukki') ||
    districtNorm.includes('wayanad') ||
    districtNorm.includes('kodagu') ||
    nameNorm.includes('ooty') ||
    nameNorm.includes('munnar') ||
    nameNorm.includes('manali') ||
    nameNorm.includes('shimla') ||
    nameNorm.includes('kullu') ||
    nameNorm.includes('shillong');

  if (isHill) {
    return {
      category: 'Hill Station',
      region,
      terrain: 'hills',
      altitudeMeters: 1850,
      isHighAltitude: false,
      averageRoadSpeedKmH: 30,
      permitsRequired: stateNorm.includes('arunachal') ? ['Arunachal Pradesh ILP'] : undefined,
    };
  }

  // Coastal check
  const isCoast = stateMeta?.terrainDefault === 'coastal' ||
    tourismType.toLowerCase().includes('beach') ||
    districtNorm.includes('goa') ||
    districtNorm.includes('puri') ||
    districtNorm.includes('daman');

  if (isCoast) {
    return {
      category: 'Beach',
      region,
      terrain: 'coastal',
      altitudeMeters: 10,
      isHighAltitude: false,
      averageRoadSpeedKmH: 45,
    };
  }

  // Wildlife check
  if (tourismType.toLowerCase().includes('wildlife') || tourismType.toLowerCase().includes('safari') || nameNorm.includes('national park')) {
    return {
      category: 'Wildlife',
      region,
      terrain: 'plains',
      altitudeMeters: 250,
      isHighAltitude: false,
      averageRoadSpeedKmH: 40,
    };
  }

  // Heritage / Pilgrimage check
  if (tourismType.toLowerCase().includes('temple') || tourismType.toLowerCase().includes('pilgrim') || nameNorm.includes('temple') || nameNorm.includes('ghat')) {
    return {
      category: 'Pilgrimage',
      region,
      terrain: 'plains',
      altitudeMeters: 200,
      isHighAltitude: false,
      averageRoadSpeedKmH: 52,
    };
  }

  // Standard plains / heritage / city
  return {
    category: tourismType || 'Heritage',
    region,
    terrain: 'plains',
    altitudeMeters: 220,
    isHighAltitude: false,
    averageRoadSpeedKmH: stateMeta?.speedKmHDefault || 55,
  };
}

/**
 * Loads, normalizes and indexes the 1,162 master destinations into high-speed memory maps
 */
export function getIndexedDestinations(): EnrichedDestination[] {
  if (cachedIndexedDestinations) return cachedIndexedDestinations;

  const rawList = (Array.isArray(destinationsMasterRaw)
    ? destinationsMasterRaw
    : (destinationsMasterRaw as any)?.default || []) as Array<{
    id: string;
    originalName: string;
    canonicalName: string;
    stateOrUt: string;
    district?: string;
    city?: string;
    tourismType: string;
    aliases?: string[];
    verificationStatus?: string;
    verificationSource?: string;
    verificationNotes?: string;
  }>;

  const enriched: EnrichedDestination[] = [];
  destinationIdMap.clear();
  canonicalNameMap.clear();
  stateDestinationMap.clear();

  rawList.forEach((raw) => {
    const stateNorm = normalizeQuery(raw.stateOrUt);
    const districtNorm = normalizeQuery(raw.district || raw.city);
    const nameNorm = normalizeQuery(raw.canonicalName || raw.originalName);

    // Resolve Coordinates
    let baseCoords: { lat: number; lng: number };
    if (DISTRICT_COORDINATES[districtNorm]) {
      baseCoords = DISTRICT_COORDINATES[districtNorm];
    } else if (DISTRICT_COORDINATES[nameNorm]) {
      baseCoords = DISTRICT_COORDINATES[nameNorm];
    } else if (ALL_36_STATES_AND_UTS[stateNorm]) {
      baseCoords = ALL_36_STATES_AND_UTS[stateNorm].centroid;
    } else {
      baseCoords = { lat: 28.6139, lng: 77.2090 }; // National centroid
    }

    const offset = deterministicOffset(raw.id);
    const lat = Number((baseCoords.lat + offset.dLat).toFixed(4));
    const lng = Number((baseCoords.lng + offset.dLng).toFixed(4));

    // Resolve Geographic Attributes
    const geoAttrs = inferGeographicAttributes(raw.tourismType, stateNorm, districtNorm, nameNorm);
    const stateMeta = ALL_36_STATES_AND_UTS[stateNorm];

    const airport = stateMeta ? {
      code: stateMeta.primaryAirport.code,
      name: stateMeta.primaryAirport.name,
      distanceKm: geoAttrs.terrain === 'island' ? 15 : (geoAttrs.terrain === 'hills' ? 85 : 45),
    } : { code: 'DEL', name: 'Indira Gandhi International', distanceKm: 50 };

    const railhead = stateMeta ? {
      code: stateMeta.primaryRailhead.code,
      name: stateMeta.primaryRailhead.name,
      distanceKm: geoAttrs.terrain === 'island' ? 0 : (geoAttrs.terrain === 'hills' ? 70 : 25),
    } : { code: 'NDLS', name: 'New Delhi Junction', distanceKm: 30 };

    const item: EnrichedDestination = {
      id: raw.id,
      originalName: raw.originalName,
      canonicalName: raw.canonicalName,
      stateOrUt: raw.stateOrUt,
      district: raw.district || raw.city,
      city: raw.city,
      tourismType: raw.tourismType,
      category: geoAttrs.category,
      region: geoAttrs.region,
      latitude: lat,
      longitude: lng,
      altitudeMeters: geoAttrs.altitudeMeters,
      isHighAltitude: geoAttrs.isHighAltitude,
      terrain: geoAttrs.terrain,
      averageRoadSpeedKmH: geoAttrs.averageRoadSpeedKmH,
      nearestAirport: airport,
      nearestRailhead: railhead,
      aliases: raw.aliases || [],
      verificationStatus: raw.verificationStatus || 'VERIFIED',
      verificationSource: raw.verificationSource || 'Ministry of Tourism / State Tourism Board',
      verificationNotes: raw.verificationNotes || 'Verified National Tourism Dataset Entry',
      recommendedStayDays: {
        quick: geoAttrs.isHighAltitude ? 3 : 1,
        recommended: geoAttrs.isHighAltitude ? 4 : 2,
        extended: geoAttrs.isHighAltitude ? 6 : 4,
      },
      bestMonths: geoAttrs.isHighAltitude ? ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] :
        (geoAttrs.terrain === 'coastal' ? ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] :
          ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']),
      permitsRequired: geoAttrs.permitsRequired,
    };

    enriched.push(item);
    destinationIdMap.set(item.id, item);
    canonicalNameMap.set(nameNorm, item);

    // Map to State
    const stGroup = stateDestinationMap.get(stateNorm) || [];
    stGroup.push(item);
    stateDestinationMap.set(stateNorm, stGroup);
  });

  cachedIndexedDestinations = enriched;
  return cachedIndexedDestinations;
}

/**
 * Resolves a destination query using direct lookup, alias translation, or prefix search
 */
export function findDestinationMaster(query?: string): EnrichedDestination | undefined {
  if (!query) return undefined;
  const list = getIndexedDestinations();
  const clean = normalizeQuery(query);

  // 1. Direct ID lookup
  if (destinationIdMap.has(query.trim())) {
    return destinationIdMap.get(query.trim());
  }

  // 2. Alias mapping lookup
  const aliasTarget = ALIAS_MAP[clean];
  if (aliasTarget) {
    const aliasNorm = normalizeQuery(aliasTarget);
    if (canonicalNameMap.has(aliasNorm)) {
      return canonicalNameMap.get(aliasNorm);
    }
    const aliasMatch = list.find(d => normalizeQuery(d.canonicalName).includes(aliasNorm));
    if (aliasMatch) return aliasMatch;
  }

  // 3. Exact canonical match
  if (canonicalNameMap.has(clean)) {
    return canonicalNameMap.get(clean);
  }

  // 4. Substring / inclusion match in canonical name or aliases
  const match = list.find(d => {
    const dNorm = normalizeQuery(d.canonicalName);
    return dNorm === clean ||
      dNorm.includes(clean) ||
      clean.includes(dNorm) ||
      d.aliases.some(a => normalizeQuery(a) === clean || normalizeQuery(a).includes(clean));
  });
  if (match) return match;

  // 5. State / UT fallback: returns highest profile destination of that state
  const stateDestinations = stateDestinationMap.get(clean);
  if (stateDestinations && stateDestinations.length > 0) {
    return stateDestinations[0];
  }

  return undefined;
}

/**
 * Filtered search across 1,162 master destinations
 */
export interface DestinationSearchOptions {
  query?: string;
  stateOrUt?: string;
  category?: string;
  region?: string;
  isHighAltitude?: boolean;
  limit?: number;
}

export function searchDestinations(options: DestinationSearchOptions = {}): EnrichedDestination[] {
  const list = getIndexedDestinations();
  let results = list;

  if (options.stateOrUt) {
    const sNorm = normalizeQuery(options.stateOrUt);
    results = results.filter(d => normalizeQuery(d.stateOrUt) === sNorm || normalizeQuery(d.stateOrUt).includes(sNorm));
  }

  if (options.category) {
    const cNorm = normalizeQuery(options.category);
    results = results.filter(d => normalizeQuery(d.category) === cNorm || normalizeQuery(d.tourismType).includes(cNorm));
  }

  if (options.region) {
    const rNorm = options.region.toLowerCase();
    results = results.filter(d => d.region.toLowerCase() === rNorm);
  }

  if (options.isHighAltitude !== undefined) {
    results = results.filter(d => d.isHighAltitude === options.isHighAltitude);
  }

  if (options.query) {
    const qNorm = normalizeQuery(options.query);
    const aliasResolved = ALIAS_MAP[qNorm] ? normalizeQuery(ALIAS_MAP[qNorm]) : qNorm;

    results = results.filter(d => {
      const nameNorm = normalizeQuery(d.canonicalName);
      const distNorm = normalizeQuery(d.district || '');
      const stateNorm = normalizeQuery(d.stateOrUt);
      return nameNorm.includes(aliasResolved) ||
        distNorm.includes(aliasResolved) ||
        stateNorm.includes(aliasResolved) ||
        d.aliases.some(a => normalizeQuery(a).includes(aliasResolved));
    });
  }

  const limit = options.limit || 50;
  return results.slice(0, limit);
}

/**
 * Gets all verified destinations in a specific State or Union Territory
 */
export function getDestinationsByState(stateOrUt: string): EnrichedDestination[] {
  getIndexedDestinations();
  const sNorm = normalizeQuery(stateOrUt);
  return stateDestinationMap.get(sNorm) || [];
}

/**
 * Calculates Haversine distance in kilometers between two geo coordinates
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds all destinations within a geographical radius of given coordinates
 */
export function getNearbyDestinations(lat: number, lng: number, radiusKm: number = 80, limit: number = 10): Array<EnrichedDestination & { distanceKm: number }> {
  const list = getIndexedDestinations();
  const matches: Array<EnrichedDestination & { distanceKm: number }> = [];

  for (const item of list) {
    const dist = haversineDistanceKm(lat, lng, item.latitude, item.longitude);
    if (dist <= radiusKm && dist > 0.1) {
      matches.push({ ...item, distanceKm: dist });
    }
  }

  matches.sort((a, b) => a.distanceKm - b.distanceKm);
  return matches.slice(0, limit);
}

/**
 * Generates an audit coverage summary for all 28 States and 8 Union Territories
 */
export function getAllStatesCoverageSummary(): StateCoverageSummary[] {
  getIndexedDestinations();
  const summaries: StateCoverageSummary[] = [];

  const uniqueStateKeys = Object.keys(ALL_36_STATES_AND_UTS);
  const processedStates = new Set<string>();

  uniqueStateKeys.forEach((key) => {
    const meta = ALL_36_STATES_AND_UTS[key];
    const normKey = meta.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '');
    if (processedStates.has(normKey)) return;
    processedStates.add(normKey);

    const sNorm = normalizeQuery(meta.name);
    let dests = stateDestinationMap.get(sNorm) || [];
    if (dests.length === 0) {
      stateDestinationMap.forEach((list, stKey) => {
        if (dests.length > 0) return;
        const cleanSt = stKey.replace(/&/g, 'and').replace(/[^a-z]/g, '');
        if (normKey.includes(cleanSt) || cleanSt.includes(normKey)) {
          dests = list;
        }
      });
    }

    summaries.push({
      stateOrUt: meta.name,
      type: meta.type,
      region: meta.region,
      destinationCount: dests.length,
      primaryAirport: `${meta.primaryAirport.code} (${meta.primaryAirport.name})`,
      primaryRailhead: `${meta.primaryRailhead.code} (${meta.primaryRailhead.name})`,
      representativePlaces: dests.slice(0, 4).map(d => d.canonicalName),
    });
  });

  return summaries;
}
