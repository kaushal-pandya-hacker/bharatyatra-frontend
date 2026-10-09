/**
 * BharatYatra Destination Intelligence Repository
 * Provides rich metadata, geographic coordinates, opening hours, visit durations, and seasonal rules across India.
 */

import { DestinationNode } from './types';
import { getAllStateFolderItems } from '@/lib/tourism/state-folder-loader';

// Coordinates registry for major Indian tourism hubs
const GEOGRAPHIC_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'dwarka': { lat: 22.2442, lng: 68.9685 },
  'somnath': { lat: 20.8880, lng: 70.4012 },
  'sasan gir': { lat: 21.1243, lng: 70.8242 },
  'gir': { lat: 21.1243, lng: 70.8242 },
  'dhordo': { lat: 23.7788, lng: 69.5126 },
  'kutch': { lat: 23.2420, lng: 69.6669 },
  'kevadia': { lat: 21.8380, lng: 73.7191 },
  'statue of unity': { lat: 21.8380, lng: 73.7191 },
  'haridwar': { lat: 29.9457, lng: 78.1642 },
  'rishikesh': { lat: 30.0869, lng: 78.2676 },
  'kedarnath': { lat: 30.7346, lng: 79.0669 },
  'badrinath': { lat: 30.7433, lng: 79.4938 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },
  'gulmarg': { lat: 34.0484, lng: 74.3805 },
  'pahalgam': { lat: 34.0161, lng: 75.3150 },
  'sonamarg': { lat: 34.3000, lng: 75.2900 },
  'panaji': { lat: 15.4989, lng: 73.8278 },
  'goa': { lat: 15.2993, lng: 74.1240 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'jaisalmer': { lat: 26.9157, lng: 70.9083 },
  'munnar': { lat: 10.0889, lng: 77.0595 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'manali': { lat: 32.2432, lng: 77.1892 },
  'leh': { lat: 34.1526, lng: 77.5771 },
  'port blair': { lat: 11.6234, lng: 92.7265 },
};

/**
 * Loads and enriches destination intelligence nodes based on query target
 */
export function getDestinationsForTarget(targetDestinations: string[], originCity: string): DestinationNode[] {
  const allFolderStates = getAllStateFolderItems();
  const nodes: DestinationNode[] = [];

  const normalizedTargets = targetDestinations.map(t => t.toLowerCase().trim());

  allFolderStates.forEach(st => {
    const isTargetState = normalizedTargets.some(t => 
      st.name.toLowerCase().includes(t) || 
      st.slug.toLowerCase().includes(t)
    );

    if (isTargetState || normalizedTargets.includes('all')) {
      st.places.forEach(p => {
        const placeNameLower = p.name.toLowerCase();
        const coords = GEOGRAPHIC_COORDINATES[placeNameLower] || 
                       GEOGRAPHIC_COORDINATES[p.slug] || 
                       GEOGRAPHIC_COORDINATES[st.slug] || 
                       { lat: 23.0 + (Math.random() * 2), lng: 72.0 + (Math.random() * 2) };

        const isTemple = p.category?.toLowerCase().includes('temple') || p.category?.toLowerCase().includes('religious') || placeNameLower.includes('temple');
        const isSafari = p.category?.toLowerCase().includes('safari') || p.category?.toLowerCase().includes('wildlife');

        nodes.push({
          id: `${st.slug}-${p.slug}`,
          name: p.name,
          displayName: p.displayName || p.name,
          city: p.city || p.district || st.name,
          district: p.district,
          state: st.name,
          country: 'India',
          latitude: coords.lat,
          longitude: coords.lng,
          categories: [p.category || (isTemple ? 'Religious & Pilgrimage' : 'Tourist Attraction')],
          averageVisitDurationMinutes: isSafari ? 240 : isTemple ? 90 : 120,
          openingTime: isTemple ? '06:00' : '09:00',
          closingTime: isTemple ? '21:00' : '18:00',
          bestMonths: isSafari ? ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'] : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          seasonalRestrictions: (p.name.includes('Kedarnath') || p.name.includes('Badrinath')) ? ['Monsoon High Risk', 'Winter Closure (Nov-Apr)'] : [],
          estimatedEntryFeeInr: isSafari ? 1200 : isTemple ? 0 : 100,
          popularityScore: ((p as any).priority === 1) ? 95 : ((p as any).priority === 2) ? 80 : 75,
          familyFriendly: true,
          seniorFriendly: !p.name.includes('Trek') && !p.name.includes('Peak'),
          accessibilityScore: isTemple ? 85 : 90,
          estimatedDailyCostInr: isSafari ? 3500 : 1500,
          imageUrl: p.imageUrl,
        });
      });
    }
  });

  return nodes;
}

/**
 * Calculate geographical Haversine distance in kilometers between two lat/lng coordinates
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
