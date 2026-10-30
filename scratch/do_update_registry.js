const fs = require('fs');

let content = fs.readFileSync('lib/ai-planner/india-geo-registry.ts', 'utf8');

// Read anchor entries from earlier script
const helperContent = fs.readFileSync('scratch/update_registry.js', 'utf8');
const anchorMatch = helperContent.match(/const anchorEntries = `([\s\S]*?)`;/);
if (!anchorMatch) {
  console.log('Could not find anchorEntries');
  process.exit(1);
}
const anchorEntries = anchorMatch[1];

// Target: line with keyAttractions of Agra followed by closing brace
const targetEnd = `    keyAttractions: ['Taj Mahal (Closed Fridays)', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh Sunset View']\n  }\n};`;
const replacement = `    keyAttractions: ['Taj Mahal (Closed Fridays)', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh Sunset View']\n  },\n` + anchorEntries.trim() + `\n};`;

if (!content.includes(targetEnd)) {
  console.log('Target end not found in file!');
  process.exit(1);
}

content = content.replace(targetEnd, replacement);

// Add import at top
if (!content.includes('findDestinationMaster')) {
  content = "import { findDestinationMaster } from './destination-master-service';\n" + content;
}

// Replace findDestinationInfo
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
console.log('Successfully updated lib/ai-planner/india-geo-registry.ts inside registry object!');
