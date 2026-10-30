/**
 * BharatYatra Natural Language Intent Parser Engine
 * Handles Multilingual Prompts (English, Gujarati, Hinglish, Conversational)
 * Maps natural queries to national destinations across all 36 Indian States and UTs.
 */

import { TripPlanningRequest, ParsedIntent } from './types';
import { INDIA_DESTINATIONS_REGISTRY, MAJOR_ORIGIN_HUBS } from './india-geo-registry';

// Dynamic Location Map for cities, states, and regional abbreviations
const LOCATION_MAP: Record<string, { city: string; state: string }> = {
  // National Union Territories
  'ladakh': { city: 'Leh', state: 'Ladakh' },
  'leh': { city: 'Leh', state: 'Ladakh' },
  'nubra': { city: 'Nubra Valley', state: 'Ladakh' },
  'pangong': { city: 'Pangong Tso', state: 'Ladakh' },
  'kashmir': { city: 'Srinagar', state: 'Jammu and Kashmir' },
  'srinagar': { city: 'Srinagar', state: 'Jammu and Kashmir' },
  'gulmarg': { city: 'Gulmarg', state: 'Jammu and Kashmir' },
  'pahalgam': { city: 'Pahalgam', state: 'Jammu and Kashmir' },
  'sonamarg': { city: 'Sonamarg', state: 'Jammu and Kashmir' },
  'delhi': { city: 'New Delhi', state: 'Delhi' },
  'new delhi': { city: 'New Delhi', state: 'Delhi' },
  'andaman': { city: 'Port Blair', state: 'Andaman & Nicobar' },
  'port blair': { city: 'Port Blair', state: 'Andaman & Nicobar' },
  'havelock': { city: 'Port Blair', state: 'Andaman & Nicobar' },
  'chandigarh': { city: 'Chandigarh', state: 'Chandigarh' },
  'pondicherry': { city: 'Puducherry', state: 'Puducherry' },
  'puducherry': { city: 'Puducherry', state: 'Puducherry' },

  // West India
  'goa': { city: 'Goa', state: 'Goa' },
  'panaji': { city: 'Goa', state: 'Goa' },
  'mumbai': { city: 'Mumbai', state: 'Maharashtra' },
  'bombay': { city: 'Mumbai', state: 'Maharashtra' },
  'pune': { city: 'Pune', state: 'Maharashtra' },
  'lonavala': { city: 'Lonavala', state: 'Maharashtra' },
  'mahabaleshwar': { city: 'Mahabaleshwar', state: 'Maharashtra' },
  'shirdi': { city: 'Shirdi', state: 'Maharashtra' },
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

  // North India
  'jaipur': { city: 'Jaipur', state: 'Rajasthan' },
  'udaipur': { city: 'Udaipur', state: 'Rajasthan' },
  'jodhpur': { city: 'Jodhpur', state: 'Rajasthan' },
  'jaisalmer': { city: 'Jaisalmer', state: 'Rajasthan' },
  'pushkar': { city: 'Pushkar', state: 'Rajasthan' },
  'rajasthan': { city: 'Jaipur', state: 'Rajasthan' },
  'mount abu': { city: 'Mount Abu', state: 'Rajasthan' },
  'manali': { city: 'Manali', state: 'Himachal Pradesh' },
  'shimla': { city: 'Shimla', state: 'Himachal Pradesh' },
  'dharamshala': { city: 'Dharamshala', state: 'Himachal Pradesh' },
  'spiti': { city: 'Kaza', state: 'Himachal Pradesh' },
  'himachal': { city: 'Manali', state: 'Himachal Pradesh' },
  'rishikesh': { city: 'Rishikesh', state: 'Uttarakhand' },
  'haridwar': { city: 'Haridwar', state: 'Uttarakhand' },
  'kedarnath': { city: 'Kedarnath', state: 'Uttarakhand' },
  'badrinath': { city: 'Badrinath', state: 'Uttarakhand' },
  'nainital': { city: 'Nainital', state: 'Uttarakhand' },
  'mussoorie': { city: 'Mussoorie', state: 'Uttarakhand' },
  'uttarakhand': { city: 'Rishikesh', state: 'Uttarakhand' },
  'varanasi': { city: 'Varanasi', state: 'Uttar Pradesh' },
  'kashi': { city: 'Varanasi', state: 'Uttar Pradesh' },
  'agra': { city: 'Agra', state: 'Uttar Pradesh' },
  'ayodhya': { city: 'Ayodhya', state: 'Uttar Pradesh' },
  'lucknow': { city: 'Lucknow', state: 'Uttar Pradesh' },
  'amritsar': { city: 'Amritsar', state: 'Punjab' },

  // South India
  'kerala': { city: 'Munnar', state: 'Kerala' },
  'munnar': { city: 'Munnar', state: 'Kerala' },
  'alleppey': { city: 'Alleppey', state: 'Kerala' },
  'kochi': { city: 'Kochi', state: 'Kerala' },
  'cochin': { city: 'Kochi', state: 'Kerala' },
  'wayanad': { city: 'Wayanad', state: 'Kerala' },
  'varkala': { city: 'Varkala', state: 'Kerala' },
  'bengaluru': { city: 'Bengaluru', state: 'Karnataka' },
  'bangalore': { city: 'Bengaluru', state: 'Karnataka' },
  'mysuru': { city: 'Mysuru', state: 'Karnataka' },
  'coorg': { city: 'Coorg', state: 'Karnataka' },
  'hampi': { city: 'Hampi', state: 'Karnataka' },
  'gokarna': { city: 'Gokarna', state: 'Karnataka' },
  'karnataka': { city: 'Bengaluru', state: 'Karnataka' },
  'chennai': { city: 'Chennai', state: 'Tamil Nadu' },
  'ooty': { city: 'Ooty', state: 'Tamil Nadu' },
  'kodaikanal': { city: 'Kodaikanal', state: 'Tamil Nadu' },
  'madurai': { city: 'Madurai', state: 'Tamil Nadu' },
  'rameswaram': { city: 'Rameswaram', state: 'Tamil Nadu' },
  'tamil nadu': { city: 'Ooty', state: 'Tamil Nadu' },
  'hyderabad': { city: 'Hyderabad', state: 'Telangana' },
  'visakhapatnam': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  'tirupati': { city: 'Tirupati', state: 'Andhra Pradesh' },

  // Northeast & East India
  'meghalaya': { city: 'Shillong', state: 'Meghalaya' },
  'shillong': { city: 'Shillong', state: 'Meghalaya' },
  'cherrapunji': { city: 'Cherrapunji', state: 'Meghalaya' },
  'assam': { city: 'Guwahati', state: 'Assam' },
  'guwahati': { city: 'Guwahati', state: 'Assam' },
  'kaziranga': { city: 'Kaziranga', state: 'Assam' },
  'sikkim': { city: 'Gangtok', state: 'Sikkim' },
  'gangtok': { city: 'Gangtok', state: 'Sikkim' },
  'darjeeling': { city: 'Darjeeling', state: 'West Bengal' },
  'kolkata': { city: 'Kolkata', state: 'West Bengal' },
  'puri': { city: 'Puri', state: 'Odisha' },
  'bhubaneswar': { city: 'Bhubaneswar', state: 'Odisha' },

  // Central India
  'bhopal': { city: 'Bhopal', state: 'Madhya Pradesh' },
  'indore': { city: 'Indore', state: 'Madhya Pradesh' },
  'ujjain': { city: 'Ujjain', state: 'Madhya Pradesh' },
  'khajuraho': { city: 'Khajuraho', state: 'Madhya Pradesh' },
  'madhya pradesh': { city: 'Indore', state: 'Madhya Pradesh' },
};

/**
 * Parses structured or natural language input into strongly typed ParsedIntent
 */
export function parseTripIntent(request: TripPlanningRequest): ParsedIntent {
  const prompt = (request.naturalPrompt || '').trim();
  const lowerPrompt = prompt.toLowerCase();

  // 1. Detect Language
  let languageDetected: 'en' | 'gu' | 'hinglish' | 'unknown' = 'en';
  if (/[\u0A80-\u0AFF]/.test(prompt) || lowerPrompt.includes('thi') || lowerPrompt.includes('javanu') || lowerPrompt.includes('mate') || lowerPrompt.includes('loko')) {
    languageDetected = /[\u0A80-\u0AFF]/.test(prompt) ? 'gu' : 'hinglish';
  }

  // 2. Extract Duration Days (Do NOT blindly default to 4; preserve request or calculate)
  let durationDays = request.durationDays || 0;
  const daysMatch = lowerPrompt.match(/(\d+)\s*(days|day|divas|d)\b/i) || prompt.match(/(\d+)\s*(દિવસે|દિવસ)/);
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
  let originCity = request.origin?.city || '';
  const originMatch = lowerPrompt.match(/from\s+([a-z\s]+?)(?=\s+to|\s+for|\s+with|\s+under|\.|,|$)/i) ||
                      lowerPrompt.match(/([a-z\s]+?)\s+thi\b/i);
  if (originMatch) {
    const candidate = originMatch[1].trim();
    if (LOCATION_MAP[candidate]) {
      originCity = LOCATION_MAP[candidate].city;
    } else if (candidate.length > 2 && candidate.length < 25) {
      originCity = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  if (!originCity) {
    originCity = 'Ahmedabad'; // Default origin fallback
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
        const val = loc.state || loc.city;
        if (!targetDestinations.includes(val)) {
          targetDestinations.push(val);
        }
      }
    });
  }

  if (targetDestinations.length === 0) {
    targetDestinations.push('Goa'); // Balanced national default
  }

  // 7. Travel Style / Tier
  let travelStyle = request.travelStyle || 'balanced';
  if (lowerPrompt.includes('budget') || lowerPrompt.includes('cheap') || lowerPrompt.includes('economical') || lowerPrompt.includes('sastu')) {
    travelStyle = 'budget';
  } else if (lowerPrompt.includes('luxury') || lowerPrompt.includes('5-star') || lowerPrompt.includes('five star') || lowerPrompt.includes('palace')) {
    travelStyle = 'luxury';
  } else if (lowerPrompt.includes('premium') || lowerPrompt.includes('boutique') || lowerPrompt.includes('resort')) {
    travelStyle = 'premium';
  }

  // 8. Pace
  let pace = request.pace || 'balanced';
  if (lowerPrompt.includes('relax') || lowerPrompt.includes('slow') || lowerPrompt.includes('chill') || lowerPrompt.includes('shanti')) {
    pace = 'relaxed';
  } else if (lowerPrompt.includes('fast') || lowerPrompt.includes('packed') || lowerPrompt.includes('quick')) {
    pace = 'fast';
  }

  // 9. Interests Extraction
  const interests: string[] = request.interests ? [...request.interests] : [];
  if (lowerPrompt.includes('beach') || lowerPrompt.includes('sea')) interests.push('Beaches');
  if (lowerPrompt.includes('mountain') || lowerPrompt.includes('snow') || lowerPrompt.includes('hill')) interests.push('Mountains');
  if (lowerPrompt.includes('temple') || lowerPrompt.includes('mandir') || lowerPrompt.includes('spiritual') || lowerPrompt.includes('darshan')) interests.push('Pilgrimage');
  if (lowerPrompt.includes('safari') || lowerPrompt.includes('wildlife') || lowerPrompt.includes('tiger') || lowerPrompt.includes('lion')) interests.push('Wildlife');
  if (lowerPrompt.includes('heritage') || lowerPrompt.includes('fort') || lowerPrompt.includes('history')) interests.push('Heritage');
  if (lowerPrompt.includes('food') || lowerPrompt.includes('culinary') || lowerPrompt.includes('thali')) interests.push('Food');

  // 10. Check Impossible or Contradictory Constraints
  let isImpossibleRequest = false;
  let impossibleReason: string | undefined = undefined;

  if (durationDays !== 0 && durationDays < 1) {
    isImpossibleRequest = true;
    impossibleReason = 'Trip duration must be at least 1 day.';
  } else if (budgetInr !== undefined && budgetInr < 1000) {
    isImpossibleRequest = true;
    impossibleReason = `A budget of ₹${budgetInr} is unfeasible for multi-day travel.`;
  }

  return {
    rawPrompt: prompt,
    languageDetected,
    originCity,
    targetDestinations,
    durationDays: durationDays || 5, // Fallback if still unset
    travelersCount,
    seniorCount: request.travelers?.seniors || 0,
    childCount: request.travelers?.children || 0,
    budgetInr,
    travelStyle,
    pace,
    interests: Array.from(new Set(interests)),
    mustVisit: request.mustVisit || [],
    avoid: request.avoid || [],
    isImpossibleRequest,
    impossibleReason,
  };
}
