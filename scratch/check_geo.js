const fs = require('fs');
const content = fs.readFileSync('lib/ai-planner/india-geo-registry.ts', 'utf8');

// Count keys
const lines = content.split('\n');
let inRegistry = false;
let count = 0;
const destinations = [];
for (const line of lines) {
  if (line.includes('export const INDIA_DESTINATIONS_REGISTRY')) {
    inRegistry = true;
    continue;
  }
  if (inRegistry && line.startsWith('};')) {
    inRegistry = false;
    break;
  }
  if (inRegistry && /^\s{2}['"]?([a-zA-Z0-9_\-]+)['"]?:\s*\{/.test(line)) {
    const key = line.trim().split(':')[0].replace(/['"]/g, '');
    destinations.push(key);
    count++;
  }
}
console.log('Registry count in india-geo-registry.ts:', count);
console.log('Destinations in registry:', destinations);
