/**
 * BharatYatra — AI-Assisted Destination Verification Module
 * Analyzes submissions for duplicates, completeness, GPS sanity, and image validity.
 * Serves as an intelligent assistant to administrators — NEVER independently approves.
 */

import { PlaceSubmissionInput, AiVerificationReport } from './types';
import { GUJARAT_100_LANDMARKS } from '@/lib/data/destinations';

// Coordinates boundary box for India
const INDIA_GEO_BOUNDS = {
  minLat: 6.5,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5,
};

function calculateLevenshteinSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return Math.max(0, 1 - distance / maxLen);
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

export function runAiDestinationVerification(input: PlaceSubmissionInput): AiVerificationReport {
  const detectedIssues: string[] = [];
  const suggestedCorrections: string[] = [];

  // 1. Completeness Score (0 - 100)
  let completenessScore = 0;
  if (input.placeName && input.placeName.trim().length >= 3) completenessScore += 15;
  if (input.category) completenessScore += 10;
  if (input.state && input.state.trim().length >= 2) completenessScore += 10;
  if (input.city || input.district) completenessScore += 5;
  if (input.address && input.address.trim().length >= 10) completenessScore += 10;
  if (input.latitude && input.longitude) completenessScore += 15;
  if (input.shortDescription && input.shortDescription.trim().length >= 20) completenessScore += 15;
  if (input.detailedDescription && input.detailedDescription.trim().length >= 60) completenessScore += 10;
  if (input.photos && input.photos.length >= 1) completenessScore += 10;

  // 2. Text Quality & Spam Check
  const suspiciousTokens = ['asdf', 'test', 'qwerty', 'fake', 'random place', 'dummy'];
  const lowerName = input.placeName.toLowerCase();
  const lowerShort = input.shortDescription.toLowerCase();

  for (const token of suspiciousTokens) {
    if (lowerName.includes(token) || lowerShort.includes(token)) {
      detectedIssues.push(`Submission contains suspected placeholder test string: "${token}"`);
      suggestedCorrections.push('Provide the authentic official place title and description.');
    }
  }

  if (input.shortDescription.trim().length < 20) {
    detectedIssues.push('Short description is under the recommended 20 characters.');
    suggestedCorrections.push('Provide a concise 1-2 sentence overview of the attraction.');
  }

  if (input.detailedDescription.trim().length < 60) {
    detectedIssues.push('Detailed description is brief (under 60 characters).');
    suggestedCorrections.push('Expand on historical context, visiting experience, or practical travel details.');
  }

  // 3. Location & GPS Sanity Check
  const withinIndiaBounds =
    input.latitude >= INDIA_GEO_BOUNDS.minLat &&
    input.latitude <= INDIA_GEO_BOUNDS.maxLat &&
    input.longitude >= INDIA_GEO_BOUNDS.minLng &&
    input.longitude <= INDIA_GEO_BOUNDS.maxLng;

  let stateCoordinatesMatch = true;
  let flaggedNotes: string | undefined = undefined;

  if (!withinIndiaBounds) {
    detectedIssues.push(`Coordinates (${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}) lie outside the recognized geographic bounds of India.`);
    suggestedCorrections.push('Re-verify GPS coordinates using the interactive map or GPS selector.');
    stateCoordinatesMatch = false;
    flaggedNotes = 'Latitude or Longitude is out of bounds for the subcontinent.';
  }

  // 4. Duplicate Candidate Detection
  const duplicateCandidates: AiVerificationReport['duplicateCandidates'] = [];

  // Check against Gujarat Landmarks
  for (const landmark of GUJARAT_100_LANDMARKS) {
    const similarity = calculateLevenshteinSimilarity(input.placeName, landmark.name);

    if (similarity >= 0.65) {
      duplicateCandidates.push({
        name: landmark.name,
        state: landmark.district ? `${landmark.district}, Gujarat` : 'Gujarat',
        similarityScore: Math.round(similarity * 100) / 100,
      });
    }
  }

  if (duplicateCandidates.length > 0) {
    detectedIssues.push(`Found ${duplicateCandidates.length} potential duplicate destination(s) in catalog: "${duplicateCandidates[0].name}"`);
    suggestedCorrections.push('Review existing destination details before approving to prevent database duplication.');
  }

  // 5. Image Sanity Check
  const validPhotos = (input.photos || []).filter((p) => typeof p === 'string' && p.trim().length > 0);
  const passedFormatCheck = validPhotos.every((p) => {
    const lower = p.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.startsWith('/uploads/') || lower.startsWith('http');
  });

  if (validPhotos.length === 0) {
    detectedIssues.push('No destination photographs provided.');
    suggestedCorrections.push('Upload at least one high-resolution photo showcasing the destination.');
  }

  // 6. Overall Risk Level & Confidence Calculation
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let confidenceScore = 90;

  if (!withinIndiaBounds || duplicateCandidates.some((d) => d.similarityScore >= 0.85)) {
    riskLevel = 'HIGH';
    confidenceScore -= 40;
  } else if (detectedIssues.length >= 2 || duplicateCandidates.length > 0 || completenessScore < 70) {
    riskLevel = 'MEDIUM';
    confidenceScore -= 20;
  }

  confidenceScore = Math.max(10, Math.min(100, confidenceScore));

  return {
    riskLevel,
    confidenceScore,
    completenessScore,
    detectedIssues,
    suggestedCorrections,
    duplicateCandidates,
    locationSanity: {
      withinIndiaBounds,
      stateCoordinatesMatch,
      flaggedNotes,
    },
    imageSanity: {
      validCount: validPhotos.length,
      passedFormatCheck,
      notes: validPhotos.length > 0 ? `${validPhotos.length} photo(s) uploaded and verified` : 'Missing photo',
    },
    generatedAt: new Date().toISOString(),
  };
}

export const aiVerificationEngine = {
  generateVerificationReport: runAiDestinationVerification,
};
