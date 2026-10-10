/**
 * BharatYatra Natural Language Intent Parser Engine
 * Handles Multilingual Prompts (English, Gujarati, Hinglish, Conversational)
 */

import { TripPlanningRequest, ParsedIntent } from './types';

// State and city normalization map
const LOCATION_MAP: Record<string, { city: string; state: string }> = {
  'goa': { city: 'Goa', state: 'Goa' },
  'kashmir': { city: 'Srinagar', state: 'Jammu and Kashmir' },
  'srinagar': { city: 'Srinagar', state: 'Jammu and Kashmir' },
  'gulmarg': { city: 'Gulmarg', state: 'Jammu and Kashmir' },
  'pahalgam': { city: 'Pahalgam', state: 'Jammu and Kashmir' },
  'ahmedabad': { city: 'Ahmedabad', state: 'Gujarat' },
  'surat': { city: 'Surat', state: 'Gujarat' },
  'vadodara': { city: 'Vadodara', state: 'Gujarat' },
  'rajkot': { city: 'Rajkot', state: 'Gujarat' },
  'kutch': { city: 'Bhuj', state: 'Gujarat' },
  'rann of kutch': { city: 'Dhordo', state: 'Gujarat' },
  'gir': { city: 'Sasan Gir', state: 'Gujarat' },
  'somnath': { city: 'Somnath', state: 'Gujarat' },
  'dwarka': { city: 'Dwarka', state: 'Gujarat' },
  'statue of unity': { city: 'Kevadia', state: 'Gujarat' },
  'kevadia': { city: 'Kevadia', state: 'Gujarat' },
  'udaipur': { city: 'Udaipur', state: 'Rajasthan' },
  'jaipur': { city: 'Jaipur', state: 'Rajasthan' },
  'jaisalmer': { city: 'Jaisalmer', state: 'Rajasthan' },
  'jodhpur': { city: 'Jodhpur', state: 'Rajasthan' },
  'mount abu': { city: 'Mount Abu', state: 'Rajasthan' },
  'haridwar': { city: 'Haridwar', state: 'Uttarakhand' },
  'rishikesh': { city: 'Rishikesh', state: 'Uttarakhand' },
  'kedarnath': { city: 'Kedarnath', state: 'Uttarakhand' },
  'badrinath': { city: 'Badrinath', state: 'Uttarakhand' },
  'uttarakhand': { city: 'Dehradun', state: 'Uttarakhand' },
  'kerala': { city: 'Kochi', state: 'Kerala' },
  'munnar': { city: 'Munnar', state: 'Kerala' },
  'mumbai': { city: 'Mumbai', state: 'Maharashtra' },
  'delhi': { city: 'Delhi', state: 'Delhi' },
  'manali': { city: 'Manali', state: 'Himachal Pradesh' },
  'shimla': { city: 'Shimla', state: 'Himachal Pradesh' },
  'ladakh': { city: 'Leh', state: 'Ladakh' },
  'leh': { city: 'Leh', state: 'Ladakh' },
  'andaman': { city: 'Port Blair', state: 'Andaman and Nicobar Islands' },
};

/**
 * Parses structured or natural language input into a strongly typed ParsedIntent
 */
export function parseTripIntent(request: TripPlanningRequest): ParsedIntent {
  const prompt = (request.naturalPrompt || '').trim();
  const lowerPrompt = prompt.toLowerCase();

  // 1. Detect Language
  let languageDetected: 'en' | 'gu' | 'hinglish' | 'unknown' = 'en';
  if (/[\u0A80-\u0AFF]/.test(prompt) || lowerPrompt.includes('thi') || lowerPrompt.includes('javanu') || lowerPrompt.includes('mate') || lowerPrompt.includes('loko')) {
    languageDetected = /[\u0A80-\u0AFF]/.test(prompt) ? 'gu' : 'hinglish';
  }

  // 2. Extract Duration Days
  let durationDays = request.durationDays || 4;
  const daysMatch = lowerPrompt.match(/(\d+)\s*(days|day|divas|d)/i) || prompt.match(/(\d+)\s*(દિવસે|દિવસ)/);
  if (daysMatch) {
    durationDays = parseInt(daysMatch[1], 10);
  }

  // 3. Extract Travelers Count
  let travelersCount = request.travelers?.adults || 2;
  const travelersMatch = lowerPrompt.match(/(\d+)\s*(people|person|persons|pax|travelers|travellers|loko|members)/i);
  if (travelersMatch) {
    travelersCount = parseInt(travelersMatch[1], 10);
  }

  // 4. Extract Budget
  let budgetInr = request.budget?.total;
  if (!budgetInr) {
    const budgetKMatch = lowerPrompt.match(/(?:budget|under|rs\.?|₹|inr)\s*(\d+)\s*k\b/i) || lowerPrompt.match(/(\d+)\s*k\s*(?:budget|under|mate)/i);
    if (budgetKMatch) {
      budgetInr = parseInt(budgetKMatch[1], 10) * 1000;
    } else {
      const budgetNumMatch = lowerPrompt.match(/(?:budget|under|rs\.?|₹|inr)\s*([\d,]+)/i);
      if (budgetNumMatch) {
        budgetInr = parseInt(budgetNumMatch[1].replace(/,/g, ''), 10);
      }
    }
  }

  // 5. Extract Origin
  let originCity = request.origin?.city || 'Ahmedabad';
  const originMatch = lowerPrompt.match(/from\s+([a-z\s]+?)(?=\s+to|\s+for|\s+with|\s+under|\.|,|$)/i) ||
                      lowerPrompt.match(/([a-z\s]+?)\s+thi\b/i);
  if (originMatch) {
    const candidate = originMatch[1].trim();
    if (LOCATION_MAP[candidate]) {
      originCity = LOCATION_MAP[candidate].city;
    } else if (candidate.length > 2 && candidate.length < 20) {
      originCity = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  // 6. Extract Target Destinations
  const targetDestinations: string[] = [];
  if (request.destinations && request.destinations.length > 0) {
    request.destinations.forEach(d => {
      if (d.city) targetDestinations.push(d.city);
      else if (d.state) targetDestinations.push(d.state);
      else if (d.place) targetDestinations.push(d.place);
    });
  }

  if (targetDestinations.length === 0) {
    const toMatch = lowerPrompt.match(/to\s+([a-z\s,]+?)(?=\s+for|\s+with|\s+under|\.|,|$)/i);
    if (toMatch) {
      const rawDestStr = toMatch[1];
      const parts = rawDestStr.split(/,|and|\s+ane\s+/i);
      parts.forEach(p => {
        const cleaned = p.trim();
        if (LOCATION_MAP[cleaned]) {
          targetDestinations.push(LOCATION_MAP[cleaned].state || LOCATION_MAP[cleaned].city);
        } else if (cleaned.length > 2) {
          targetDestinations.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
        }
      });
    }
  }

  // Fallback destination check across all known keys
  if (targetDestinations.length === 0) {
    Object.keys(LOCATION_MAP).forEach(key => {
      if (lowerPrompt.includes(key) && !key.includes(originCity.toLowerCase())) {
        const loc = LOCATION_MAP[key];
        if (!targetDestinations.includes(loc.state) && !targetDestinations.includes(loc.city)) {
          targetDestinations.push(loc.state || loc.city);
        }
      }
    });
  }

  if (targetDestinations.length === 0) {
    targetDestinations.push('Gujarat'); // Default default fallback
  }

  // 7. Extract Interests & Pace
  const interests: string[] = request.interests || [];
  if (lowerPrompt.includes('mountain') || lowerPrompt.includes('hill')) interests.push('Mountains');
  if (lowerPrompt.includes('temple') || lowerPrompt.includes('religious') || lowerPrompt.includes('spiritual')) interests.push('Temples');
  if (lowerPrompt.includes('beach') || lowerPrompt.includes('coastal')) interests.push('Beaches');
  if (lowerPrompt.includes('photo') || lowerPrompt.includes('scenic')) interests.push('Photography');
  if (lowerPrompt.includes('safari') || lowerPrompt.includes('wildlife') || lowerPrompt.includes('lion')) interests.push('Wildlife');
  if (lowerPrompt.includes('heritage') || lowerPrompt.includes('history') || lowerPrompt.includes('fort')) interests.push('Heritage');

  // 8. Travel Style
  let travelStyle: 'budget' | 'balanced' | 'premium' | 'luxury' = request.travelStyle || 'balanced';
  if (budgetInr) {
    const perDayPerPerson = budgetInr / (durationDays * travelersCount);
    if (perDayPerPerson < 2000) travelStyle = 'budget';
    else if (perDayPerPerson > 10000) travelStyle = 'luxury';
    else if (perDayPerPerson > 5000) travelStyle = 'premium';
  }

  // 9. Check Impossible Requests
  let isImpossibleRequest = false;
  let impossibleReason: string | undefined = undefined;

  if (durationDays <= 0) {
    isImpossibleRequest = true;
    impossibleReason = 'Trip duration must be at least 1 day.';
  } else if (travelersCount <= 0) {
    isImpossibleRequest = true;
    impossibleReason = 'Number of travelers must be at least 1 person.';
  } else if (budgetInr !== undefined && budgetInr < 500) {
    isImpossibleRequest = true;
    impossibleReason = `Budget of ₹${budgetInr} is impossibly low for a ${durationDays}-day trip.`;
  } else if (targetDestinations.length > 5 && durationDays < 3) {
    isImpossibleRequest = true;
    impossibleReason = `Visiting ${targetDestinations.length} distinct regions in ${durationDays} days is geographically impossible.`;
  }

  return {
    rawPrompt: prompt,
    languageDetected,
    originCity,
    targetDestinations: Array.from(new Set(targetDestinations)),
    durationDays,
    travelersCount,
    seniorCount: request.travelers?.seniors || 0,
    childCount: request.travelers?.children || 0,
    budgetInr,
    travelStyle,
    pace: request.pace || 'balanced',
    interests: Array.from(new Set(interests)),
    mustVisit: request.mustVisit || [],
    avoid: request.avoid || [],
    isImpossibleRequest,
    impossibleReason,
  };
}
