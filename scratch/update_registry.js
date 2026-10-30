const fs = require('fs');

const anchorEntries = `
  // ==========================================
  // ANDAMAN & NICOBAR ISLANDS (UT)
  // ==========================================
  'port blair': {
    id: 'an-port-blair',
    name: 'Port Blair',
    displayName: 'Port Blair (Island Capital & Cellular Jail)',
    stateOrUt: 'Andaman & Nicobar',
    region: 'Islands',
    latitude: 11.6234,
    longitude: 92.7265,
    altitudeMeters: 16,
    isHighAltitude: false,
    category: 'Heritage',
    terrain: 'island',
    averageRoadSpeedKmH: 35,
    nearestAirport: { code: 'IXZ', name: 'Veer Savarkar International Airport', distanceKm: 4 },
    nearestRailhead: { code: 'NONE', name: 'Island Territory (Air & Sea only)', distanceKm: 0 },
    bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    typicalStayDays: { quick: 2, recommended: 3, extended: 4 },
    keyAttractions: ['Cellular Jail National Memorial & Light Show', 'Corbyn Cove Beach', 'Ross Island (Netaji Subhash Chandra Bose Dweep)', 'Chidiya Tapu Sunset Point']
  },
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
`;

// Read current file
let content = fs.readFileSync('lib/ai-planner/india-geo-registry.ts', 'utf8');

// Insert anchor entries right before `export const MAJOR_ORIGIN_HUBS`
const target = 'export const MAJOR_ORIGIN_HUBS';
if (content.includes(target) && !content.includes('wb-darjeeling')) {
  content = content.replace(target, anchorEntries + '\n};\n\n' + target);
  // Also clean up any extra trailing `};` before `MAJOR_ORIGIN_HUBS` if double
  content = content.replace(/\};\s*\n\};\s*\n\nexport const MAJOR_ORIGIN_HUBS/, '};\n\nexport const MAJOR_ORIGIN_HUBS');
  
  // Add import for findDestinationMaster at top of file
  if (!content.includes('findDestinationMaster')) {
    content = "import { findDestinationMaster } from './destination-master-service';\n" + content;
  }

  // Update findDestinationInfo
  const oldFindRegex = /export function findDestinationInfo\(query\?: string\): GeoDestinationInfo \| undefined \{[\s\S]*?\n\}/;
  const newFindFunc = `export function findDestinationInfo(query?: string): GeoDestinationInfo | undefined {
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
        displayName: \`\${masterDest.canonicalName} (\${masterDest.stateOrUt})\`,
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
}`;

  content = content.replace(oldFindRegex, newFindFunc);
  fs.writeFileSync('lib/ai-planner/india-geo-registry.ts', content, 'utf8');
  console.log('Successfully updated lib/ai-planner/india-geo-registry.ts with all 36 States/UTs anchor destinations!');
} else {
  console.log('Already contains wb-darjeeling or target not found');
}
