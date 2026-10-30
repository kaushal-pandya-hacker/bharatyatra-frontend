/**
 * BharatYatra AI 2.0 — Seasonal & Environmental Intelligence Engine
 * Comprehensive India-Wide seasonal suitability, mountain pass status,
 * national park breeding closures, monsoon risks, heatwaves, and cultural festivals.
 */

export interface MountainPassStatus {
  name: string;
  state: string;
  elevationMeters: number;
  connectsRoute: string;
  winterClosureMonths: number[]; // 1-12
  isOpenInMonth: (month: number) => boolean;
  alternativeRoute?: string;
  advisory: string;
}

export interface WildlifeSanctuaryStatus {
  parkName: string;
  state: string;
  closedMonths: number[]; // 1-12
  closureReason: string;
  openAlternativeZone?: string;
}

export interface SeasonalCheckResult {
  isSuitable: boolean;
  suitabilityScore: number; // 1 - 10
  warnings: string[];
  recommendations: string[];
  festivalEvents: string[];
  mountainPassAlerts: string[];
  wildlifeParkAlerts: string[];
  weatherClassification: 'ideal' | 'favorable' | 'moderate' | 'challenging' | 'restricted';
}

/**
 * High-Altitude Mountain Passes Registry
 */
export const MOUNTAIN_PASSES_REGISTRY: Record<string, MountainPassStatus> = {
  'rohtang-pass': {
    name: 'Rohtang Pass',
    state: 'Himachal Pradesh',
    elevationMeters: 3978,
    connectsRoute: 'Manali to Lahaul & Spiti / Leh Highway',
    winterClosureMonths: [11, 12, 1, 2, 3, 4, 5], // Mid Nov to May 20
    isOpenInMonth: (m: number) => m >= 6 && m <= 10,
    alternativeRoute: 'Atal Tunnel (9.02 km, open all 12 months) bypasses Rohtang Pass to Lahaul Valley.',
    advisory: 'Rohtang Pass top is closed from mid-November to late May due to 15-20 feet of snow. National Green Tribunal (NGT) permits required during summer.',
  },
  'baralacha-la': {
    name: 'Baralacha La',
    state: 'Himachal Pradesh / Ladakh',
    elevationMeters: 4890,
    connectsRoute: 'Keylong (Himachal) to Sarchu / Leh',
    winterClosureMonths: [11, 12, 1, 2, 3, 4, 5], // Nov to May
    isOpenInMonth: (m: number) => m >= 6 && m <= 10,
    alternativeRoute: 'Direct flights to Leh (IXL) operate daily year-round.',
    advisory: 'Crucial pass on Manali-Leh Highway. Closed by Border Roads Organisation (BRO) during winter months due to extreme blizzards.',
  },
  'zoji-la': {
    name: 'Zoji La',
    state: 'Jammu & Kashmir / Ladakh',
    elevationMeters: 3528,
    connectsRoute: 'Srinagar to Dras, Kargil & Leh (NH-1)',
    winterClosureMonths: [12, 1, 2, 3, 4], // Dec to April
    isOpenInMonth: (m: number) => m >= 5 && m <= 11,
    alternativeRoute: 'Flight to Leh (IXL) or Srinagar (SXR). Zoji La Tunnel is currently under construction.',
    advisory: 'NH-1 Srinagar-Leh Highway closes around December due to heavy snowfall and avalanches.',
  },
  'khardung-la': {
    name: 'Khardung La',
    state: 'Ladakh',
    elevationMeters: 5359,
    connectsRoute: 'Leh to Nubra Valley & Siachen',
    winterClosureMonths: [], // Kept open by BRO, but subject to temporary snowfall closures
    isOpenInMonth: (_m: number) => true,
    advisory: 'World highest motorable pass. BRO keeps it open year-round, but winter travelers must carry oxygen cylinders and snow chains. Stay at top limited to 15 minutes.',
  },
  'chang-la': {
    name: 'Chang La',
    state: 'Ladakh',
    elevationMeters: 5360,
    connectsRoute: 'Leh to Pangong Tso Lake',
    winterClosureMonths: [],
    isOpenInMonth: (_m: number) => true,
    advisory: 'Pass to Pangong Lake. High altitude sickness hazard. Subject to temporary winter snow blocks.',
  },
  'kunzum-pass': {
    name: 'Kunzum Pass',
    state: 'Himachal Pradesh',
    elevationMeters: 4590,
    connectsRoute: 'Lahaul Valley to Spiti Valley (Kaza)',
    winterClosureMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6], // Mid Oct to mid-June
    isOpenInMonth: (m: number) => m >= 7 && m <= 9,
    alternativeRoute: 'Shimla -> Kinnaur -> Kaza road is kept open for longer durations in winter.',
    advisory: 'High pass connecting Manali/Lahaul to Spiti. Open only for 3 summer months (July-September).',
  },
  'sela-pass': {
    name: 'Sela Pass',
    state: 'Arunachal Pradesh',
    elevationMeters: 4170,
    connectsRoute: 'Bomdila to Tawang',
    winterClosureMonths: [],
    isOpenInMonth: (_m: number) => true,
    alternativeRoute: 'Sela Tunnel (twin-tube, open year-round).',
    advisory: 'High-altitude pass leading to Tawang Monastery. Heavy snowfall in Dec-Feb; Sela Tunnel ensures all-weather connectivity.',
  },
};

/**
 * National Wildlife Parks Breeding & Flood Closures Registry
 */
export const WILDLIFE_PARKS_REGISTRY: Record<string, WildlifeSanctuaryStatus> = {
  'gir': {
    parkName: 'Sasan Gir National Park & Lion Sanctuary',
    state: 'Gujarat',
    closedMonths: [6, 7, 8, 9, 10], // June 16 to October 15
    closureReason: 'Annual breeding season of Asiatic Lions and heavy monsoon breeding preservation.',
    openAlternativeZone: 'Gir Interpretation Zone (Devalia Safari Park) remains open year-round weather permitting.',
  },
  'kaziranga': {
    parkName: 'Kaziranga National Park (One-Horned Rhino)',
    state: 'Assam',
    closedMonths: [5, 6, 7, 8, 9, 10], // May 1 to October 31
    closureReason: 'Brahmaputra River monsoon flooding inundates up to 70% of park grasslands.',
    openAlternativeZone: 'Tea garden tours in Golaghat and scenic Brahmaputra river dolphin cruises operate in buffer areas.',
  },
  'corbett': {
    parkName: 'Jim Corbett National Park',
    state: 'Uttarakhand',
    closedMonths: [6, 7, 8, 9, 10], // June 15 to Nov 14 (Dhikala/Bijrani)
    closureReason: 'Monsoon flooding of Ramganga River and road erosion in core forest.',
    openAlternativeZone: 'Jhirna and Dhela eco-tourism safari zones remain open year-round.',
  },
  'ranthambore': {
    parkName: 'Ranthambore National Park',
    state: 'Rajasthan',
    closedMonths: [7, 8, 9], // July 1 to Sept 30
    closureReason: 'Monsoon season breeding closure for Bengal Tigers in core zones 1 to 5.',
    openAlternativeZone: 'Buffer safari zones 6 to 10 remain accessible for daytime safaris.',
  },
  'bandhavgarh': {
    parkName: 'Bandhavgarh National Park',
    state: 'Madhya Pradesh',
    closedMonths: [7, 8, 9],
    closureReason: 'Core safari zones closed for annual monsoon rejuvenation.',
    openAlternativeZone: 'Buffer zones (Dhamokhar, Johila) remain open for safari drives.',
  },
};

/**
 * Major Indian Cultural & Regional Festivals Calendar
 */
export const CULTURAL_FESTIVALS_CALENDAR: Array<{
  name: string;
  destination: string;
  state: string;
  months: number[];
  highlights: string;
}> = [
  {
    name: 'Rann Utsav (White Desert Cultural Festival)',
    destination: 'Kutch',
    state: 'Gujarat',
    months: [11, 12, 1, 2],
    highlights: 'Full moon white salt desert nights, Gujarati folk music, tent city, handicrafts and camel safaris at Dhordo.',
  },
  {
    name: 'Pushkar Camel Fair',
    destination: 'Pushkar',
    state: 'Rajasthan',
    months: [11],
    highlights: 'World-famous livestock fair, hot-air ballooning, colorful Rajasthani folk dances, and sacred holy dip at Pushkar Lake.',
  },
  {
    name: 'Hornbill Festival (Festival of Festivals)',
    destination: 'Kohima',
    state: 'Nagaland',
    months: [12],
    highlights: 'Kisama Heritage Village showcase of 17 indigenous Naga tribes, traditional warrior dances, music, and ethnic cuisine (Dec 1-10).',
  },
  {
    name: 'Hemis Monastery Festival',
    destination: 'Leh',
    state: 'Ladakh',
    months: [6, 7],
    highlights: 'Vibrant Cham mask dances celebrating Guru Padmasambhava at Hemis Gompa, accompanied by traditional Tibetan trumpets.',
  },
  {
    name: 'Durga Puja Carnival',
    destination: 'Kolkata',
    state: 'West Bengal',
    months: [10],
    highlights: 'UNESCO Intangible Cultural Heritage extravaganza with thousands of artistic pandals, dhak drums, and city-wide illuminated celebrations.',
  },
  {
    name: 'Onam Harvest Festival',
    destination: 'Kochi',
    state: 'Kerala',
    months: [8, 9],
    highlights: 'Vallam Kali snake boat races at Aranmula, Onasadya 26-dish grand feast, and Kathakali performances.',
  },
  {
    name: 'Mysore Dasara',
    destination: 'Mysuru',
    state: 'Karnataka',
    months: [10],
    highlights: 'Illumination of Mysore Palace with 100,000 bulbs, grand Jamboo Savari elephant procession carrying Goddess Chamundeshwari idol.',
  },
  {
    name: 'International Kite Festival (Uttarayan)',
    destination: 'Ahmedabad',
    state: 'Gujarat',
    months: [1],
    highlights: 'Sabarmati Riverfront kite flying spectacle, undhiyu and jalebi feasts across Ahmedabad rooftop gatherings (Jan 14-15).',
  },
];

/**
 * Evaluates seasonal suitability across all 36 States & UTs
 */
export function evaluateSeasonalSuitability(
  destinations: string[],
  startDate?: string
): SeasonalCheckResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const festivalEvents: string[] = [];
  const passAlerts: string[] = [];
  const parkAlerts: string[] = [];

  const targetDate = startDate ? new Date(startDate) : new Date();
  const month = targetDate.getMonth() + 1; // 1 - 12
  let suitabilityScore = 9;

  destinations.forEach(dest => {
    const dLower = dest.toLowerCase().trim();

    // 1. Mountain Pass Verification
    if (dLower.includes('manali') || dLower.includes('leh') || dLower.includes('ladakh') || dLower.includes('spiti')) {
      // Rohtang Check
      if (dLower.includes('rohtang') || dLower.includes('manali')) {
        const rohtang = MOUNTAIN_PASSES_REGISTRY['rohtang-pass'];
        if (rohtang.winterClosureMonths.includes(month)) {
          passAlerts.push(`Rohtang Pass (3,978m) is closed in Month ${month} due to heavy snow. Atal Tunnel is active for direct passage to Lahaul.`);
          suitabilityScore = Math.min(suitabilityScore, 7);
        }
      }

      // Baralacha La / Highway Check
      if (dLower.includes('leh') || dLower.includes('ladakh')) {
        const baralacha = MOUNTAIN_PASSES_REGISTRY['baralacha-la'];
        if (baralacha.winterClosureMonths.includes(month)) {
          passAlerts.push(`Manali-Leh Highway (Baralacha La 4,890m) is closed in Month ${month}. Only domestic commercial flights to Leh (IXL) are operational.`);
          recommendations.push(`Fly into Leh Kushok Bakula Rimpochee Airport (IXL) with 48h mandatory acclimatization.`);
          suitabilityScore = Math.min(suitabilityScore, 6);
        }
      }

      // Kunzum Pass Check
      if (dLower.includes('spiti') || dLower.includes('kaza')) {
        const kunzum = MOUNTAIN_PASSES_REGISTRY['kunzum-pass'];
        if (kunzum.winterClosureMonths.includes(month)) {
          passAlerts.push(`Kunzum Pass (4,590m) connecting Manali to Spiti is closed in Month ${month}. Access Spiti Valley via Shimla-Kinnaur route only.`);
        }
      }
    }

    // 2. Chardham Shrines (Kedarnath / Badrinath)
    if (dLower.includes('kedarnath') || dLower.includes('badrinath')) {
      if (month >= 11 || month <= 4) {
        warnings.push(`Kedarnath & Badrinath high shrines are closed in winter (Nov–Apr) due to heavy snowfall. Portals open around Akshaya Tritiya in May.`);
        recommendations.push(`Visit Haridwar, Rishikesh, or Mussoorie for winter mountain retreats.`);
        suitabilityScore = Math.min(suitabilityScore, 4);
      } else if (month === 7 || month === 8) {
        warnings.push(`Heavy monsoon rainfall (July–August) triggers landslide risks on Uttarakhand Chardham highways.`);
        recommendations.push(`Maintain buffer days and check daily Uttarakhand Police road advisories.`);
        suitabilityScore = Math.min(suitabilityScore, 6);
      }
    }

    // 3. Wildlife Parks Closures
    // Gir Check
    if (dLower.includes('gir') || dLower.includes('sasan')) {
      const gir = WILDLIFE_PARKS_REGISTRY['gir'];
      if (gir.closedMonths.includes(month)) {
        parkAlerts.push(`${gir.parkName} core sanctuary is closed in Month ${month} (${gir.closureReason}).`);
        recommendations.push(gir.openAlternativeZone || 'Explore Somnath coastal heritage instead.');
        suitabilityScore = Math.min(suitabilityScore, 6);
      }
    }

    // Kaziranga Check
    if (dLower.includes('kaziranga')) {
      const kazi = WILDLIFE_PARKS_REGISTRY['kaziranga'];
      if (kazi.closedMonths.includes(month)) {
        parkAlerts.push(`${kazi.parkName} is closed in Month ${month} due to Brahmaputra monsoon flooding.`);
        recommendations.push(`Plan Kaziranga wildlife safari between November and April for prime elephant & jeep safaris.`);
        suitabilityScore = Math.min(suitabilityScore, 3);
      }
    }

    // Ranthambore Check
    if (dLower.includes('ranthambore')) {
      const ranth = WILDLIFE_PARKS_REGISTRY['ranthambore'];
      if (ranth.closedMonths.includes(month)) {
        parkAlerts.push(`${ranth.parkName} core zones (1-5) are closed during monsoon (July-Sept). Buffer zones remain accessible.`);
        suitabilityScore = Math.min(suitabilityScore, 7);
      }
    }

    // Jim Corbett Check
    if (dLower.includes('corbett')) {
      const corb = WILDLIFE_PARKS_REGISTRY['corbett'];
      if (corb.closedMonths.includes(month)) {
        parkAlerts.push(`${corb.parkName} Dhikala/Bijrani zones are closed in Month ${month}. Jhirna/Dhela zones remain open.`);
      }
    }

    // 4. Extreme Weather: Desert & Northern Heat
    if (dLower.includes('jaisalmer') || dLower.includes('bikaner') || dLower.includes('jodhpur') || dLower.includes('varanasi')) {
      if (month === 5 || month === 6) {
        warnings.push(`Extreme summer heatwaves in ${dest} (temperatures frequently reach 44°C–48°C in May–June). Daytime outdoor activities restricted.`);
        recommendations.push(`Schedule sightseeing before 09:30 AM or after 05:30 PM, carry hydration salts, and book AC vehicle transport.`);
        suitabilityScore = Math.min(suitabilityScore, 5);
      }
    }

    // 5. Heavy Monsoon & Landslides (Meghalaya & Western Ghats)
    if (dLower.includes('cherrapunji') || dLower.includes('sohra') || dLower.includes('shillong') || dLower.includes('meghalaya')) {
      if (month >= 6 && month <= 8) {
        warnings.push(`Peak monsoon season in Meghalaya (Cherrapunji receives world's heaviest rainfall in June–August). Trekking routes to Double Decker Root Bridge are wet and slippery.`);
        recommendations.push(`Spectacular gushing waterfalls (Nohkalikai, Wei Sawdong); carry waterproof trekking footwear, rain ponchos, and extra day buffers.`);
        suitabilityScore = Math.min(suitabilityScore, 7);
      }
    }

    if (dLower.includes('munnar') || dLower.includes('wayanad') || dLower.includes('coorg')) {
      if (month === 7 || month === 8) {
        warnings.push(`Heavy Southwest Monsoon in Western Ghats. Possible landslide advisories on narrow mountain passes.`);
        recommendations.push(`Ideal for lush tea estate aesthetics and Ayurvedic wellness rejuvenations.`);
      }
    }

    // 6. Coastal Beach Monsoon (Goa & Andaman)
    if (dLower.includes('goa')) {
      if (month >= 6 && month <= 9) {
        warnings.push(`Southwest monsoon in Goa: Beach shacks and water sports are closed. Sea swimming is prohibited due to high tides.`);
        recommendations.push(`Visit Dudhsagar Waterfalls at peak flow, lush spice plantations, and heritage Portuguese quarters of Panaji.`);
        suitabilityScore = Math.min(suitabilityScore, 6);
      }
    }

    if (dLower.includes('andaman') || dLower.includes('havelock') || dLower.includes('port blair')) {
      if (month >= 5 && month <= 9) {
        warnings.push(`Monsoon season in Andaman: Inter-island ferry sailings between Port Blair, Havelock, and Neil are subject to cyclone/weather delays.`);
        suitabilityScore = Math.min(suitabilityScore, 6);
      }
    }

    // 7. Cultural Festival Matches
    CULTURAL_FESTIVALS_CALENDAR.forEach(fest => {
      const matchDest = fest.destination.toLowerCase();
      if (dLower.includes(matchDest) && fest.months.includes(month)) {
        festivalEvents.push(`🎉 ${fest.name} in ${fest.destination} (${fest.state}): ${fest.highlights}`);
      }
    });
  });

  // Weather classification
  let weatherClassification: SeasonalCheckResult['weatherClassification'] = 'ideal';
  if (suitabilityScore <= 4) weatherClassification = 'restricted';
  else if (suitabilityScore <= 6) weatherClassification = 'challenging';
  else if (suitabilityScore <= 7) weatherClassification = 'moderate';
  else if (suitabilityScore <= 8) weatherClassification = 'favorable';

  return {
    isSuitable: suitabilityScore >= 5,
    suitabilityScore,
    warnings,
    recommendations,
    festivalEvents,
    mountainPassAlerts: passAlerts,
    wildlifeParkAlerts: parkAlerts,
    weatherClassification,
  };
}
