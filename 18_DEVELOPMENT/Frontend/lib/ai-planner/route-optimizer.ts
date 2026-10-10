/**
 * BharatYatra Route Optimization Engine
 * Implements Spatial Clustering & Nearest-Neighbor Route Ordering to Eliminate Backtracking
 */

import { DestinationNode } from './types';
import { calculateHaversineDistanceKm } from './destination-intelligence';

export interface OptimizedRoutePlan {
  orderedNodes: DestinationNode[];
  totalDistanceKm: number;
  routeScore: number;
  backtrackingDeductions: number;
  routeSummary: string[];
}

/**
 * Optimizes the travel route sequence for a list of target destinations from an origin city.
 */
export function optimizeRouteSequence(
  originCity: string,
  originCoords: { lat: number; lng: number },
  nodes: DestinationNode[],
  interests: string[] = []
): OptimizedRoutePlan {
  if (nodes.length === 0) {
    return {
      orderedNodes: [],
      totalDistanceKm: 0,
      routeScore: 100,
      backtrackingDeductions: 0,
      routeSummary: [originCity],
    };
  }

  // 1. Prioritize Must-Visits & High Popularity / Interest Match
  const scoredNodes = nodes.map(n => {
    let score = n.popularityScore;
    if (interests.some(i => n.categories.some(c => c.toLowerCase().includes(i.toLowerCase())))) {
      score += 20;
    }
    return { ...n, relevanceScore: score };
  });

  // Sort candidate nodes by relevance
  scoredNodes.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 2. Greedy Nearest Neighbor with Directional Consistency
  const unvisited = [...scoredNodes];
  const orderedNodes: DestinationNode[] = [];
  let currentLat = originCoords.lat;
  let currentLng = originCoords.lng;
  let totalDistanceKm = 0;
  let backtrackingDeductions = 0;

  let prevBearing: number | null = null;

  while (unvisited.length > 0) {
    let bestIndex = 0;
    let minCost = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i];
      const dist = calculateHaversineDistanceKm(currentLat, currentLng, candidate.latitude, candidate.longitude);
      
      // Calculate bearing / direction vector
      const bearing = calculateBearing(currentLat, currentLng, candidate.latitude, candidate.longitude);
      let directionPenalty = 0;
      if (prevBearing !== null) {
        const angleDiff = Math.abs(bearing - prevBearing);
        const normAngleDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;
        if (normAngleDiff > 135) { // Reverse direction (backtracking)
          directionPenalty = 50; 
        }
      }

      // Cost function balances distance, relevance, and backtracking penalty
      const cost = dist + directionPenalty - candidate.relevanceScore * 0.5;
      if (cost < minCost) {
        minCost = cost;
        bestIndex = i;
      }
    }

    const nextNode = unvisited.splice(bestIndex, 1)[0];
    const segmentDist = calculateHaversineDistanceKm(currentLat, currentLng, nextNode.latitude, nextNode.longitude);
    
    // Check if segment dist causes heavy backtracking
    if (prevBearing !== null) {
      const bearing = calculateBearing(currentLat, currentLng, nextNode.latitude, nextNode.longitude);
      const angleDiff = Math.abs(bearing - prevBearing);
      const normAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff;
      if (normAngle > 135 && segmentDist > 100) {
        backtrackingDeductions += 15;
      }
      prevBearing = bearing;
    } else {
      prevBearing = calculateBearing(currentLat, currentLng, nextNode.latitude, nextNode.longitude);
    }

    totalDistanceKm += segmentDist;
    currentLat = nextNode.latitude;
    currentLng = nextNode.longitude;
    orderedNodes.push(nextNode);
  }

  // 3. Return to Origin Distance Calculation
  const returnDist = calculateHaversineDistanceKm(currentLat, currentLng, originCoords.lat, originCoords.lng);
  totalDistanceKm += returnDist;

  // 4. Calculate Final Route Score (Target >= 85)
  let routeScore = 100 - backtrackingDeductions;
  if (totalDistanceKm > 3000) routeScore -= 10;
  routeScore = Math.max(60, Math.min(100, routeScore));

  const routeSummary = [originCity, ...orderedNodes.map(n => n.name), originCity];

  return {
    orderedNodes,
    totalDistanceKm: Math.round(totalDistanceKm),
    routeScore,
    backtrackingDeductions,
    routeSummary,
  };
}

/**
 * Helper to calculate compass bearing angle in degrees between two points
 */
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const y = Math.sin((lng2 - lng1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos((lng2 - lng1) * (Math.PI / 180));
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}
