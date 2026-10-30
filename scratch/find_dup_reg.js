const fs = require('fs');
const content = fs.readFileSync('lib/ai-planner/india-geo-registry.ts', 'utf8');

const regContent = content.substring(
  content.indexOf('export const INDIA_DESTINATIONS_REGISTRY'),
  content.indexOf('export const MAJOR_ORIGIN_HUBS')
);

const keyRegex = /^\s{2}'([^']+)':\s*\{/gm;
let match;
const seen = new Set();
const dups = [];

while ((match = keyRegex.exec(regContent)) !== null) {
  const k = match[1];
  if (seen.has(k)) dups.push(k);
  else seen.add(k);
}

console.log('Duplicates in INDIA_DESTINATIONS_REGISTRY:', dups);
