import prebuiltStateData from '@/data/tourism/state-folder-tourism.json';

export interface PlaceFolderItem {
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

function normalizeString(str: string): string {
  return str.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}

/**
 * Returns the state folder dataset.
 * Data is prebuilt and kept 100% in sync with physical state folders
 * via predev & prebuild scripts.
 */
export function loadStateFolderDataset(): StateFolderDataset {
  return prebuiltStateData as StateFolderDataset;
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
