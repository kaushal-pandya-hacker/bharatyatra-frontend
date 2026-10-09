import prebuiltStateData from '@/data/tourism/state-folder-tourism.json';
import verifiedDestinationsData from '@/data/tourism/verified-destinations.json';

export interface PlaceFolderItem {
  id?: string;
  name: string;
  displayName?: string;
  slug: string;
  rawFileName: string;
  imageUrl: string;
  stateName: string;
  stateSlug: string;
  location?: string;
  district?: string;
  city?: string;
  category?: string;
}

export interface StateFolderItem {
  folderName: string;
  name: string;
  slug: string;
  code?: string;
  coverFileName: string;
  coverImage: string;
  placesCount: number;
  places: PlaceFolderItem[];
}

export interface StateFolderDataset {
  version: string;
  generatedAt: string;
  totalStates: number;
  totalPlaces: number;
  states: StateFolderItem[];
}

interface VerifiedItem {
  id: string;
  originalName: string;
  canonicalName: string;
  stateOrUt: string;
  district?: string;
  city?: string;
  tourismType?: string;
  imageUrl: string;
}

function normalizeString(str: string): string {
  return str.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}

let cachedDataset: StateFolderDataset | null = null;

/**
 * Returns the state folder dataset.
 * Data is prebuilt and kept 100% in sync with physical state folders.
 * Automatically enriches any state lacking places with verified destinations.
 */
export function loadStateFolderDataset(): StateFolderDataset {
  if (cachedDataset) return cachedDataset;

  const dataset = JSON.parse(JSON.stringify(prebuiltStateData)) as StateFolderDataset;
  const verified = verifiedDestinationsData as VerifiedItem[];

  let grandTotalPlaces = 0;

  dataset.states.forEach((state) => {
    if (!state.places || state.places.length === 0) {
      const stateNorm = normalizeString(state.name);
      const stateSlugNorm = normalizeString(state.slug);
      const folderNorm = normalizeString(state.folderName);

      const matchingVerified = verified.filter((v) => {
        const vNorm = normalizeString(v.stateOrUt);
        return vNorm === stateNorm || vNorm === stateSlugNorm || vNorm === folderNorm;
      });

      state.places = matchingVerified.map((v) => {
        const name = v.canonicalName || v.originalName || 'Destination';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return {
          id: v.id,
          name: name,
          displayName: name,
          slug: slug,
          rawFileName: v.originalName || '',
          imageUrl: v.imageUrl,
          stateName: state.name,
          stateSlug: state.slug,
          location: v.city || v.district || state.name,
          district: v.district,
          city: v.city,
          category: v.tourismType || 'Attraction',
        };
      });
      state.placesCount = state.places.length;
    }
    grandTotalPlaces += state.places.length;
  });

  dataset.totalPlaces = grandTotalPlaces;
  cachedDataset = dataset;
  return cachedDataset;
}

/**
 * Get all states derived directly from folder hierarchy with official cover images.
 */
export function getAllStateFolderItems(): StateFolderItem[] {
  const dataset = loadStateFolderDataset();
  return dataset.states;
}

/**
 * Find a state by slug or state name.
 */
export function getStateFolderItemBySlug(slugOrName: string): StateFolderItem | undefined {
  const states = getAllStateFolderItems();
  const targetNorm = normalizeString(slugOrName);
  return states.find(
    s => normalizeString(s.slug) === targetNorm || normalizeString(s.name) === targetNorm || normalizeString(s.folderName) === targetNorm
  );
}

/**
 * Get all places belonging ONLY to a specific state.
 */
export function getPlacesForStateFolder(slugOrName: string): PlaceFolderItem[] {
  const state = getStateFolderItemBySlug(slugOrName);
  return state ? state.places : [];
}
