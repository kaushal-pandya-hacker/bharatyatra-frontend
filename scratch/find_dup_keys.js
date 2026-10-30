const fs = require('fs');
const content = fs.readFileSync('lib/ai-planner/india-geo-registry.ts', 'utf8');

const keyRegex = /^\s{2}'([^']+)':\s*\{/gm;
let match;
const seen = new Map();
const duplicates = [];

while ((match = keyRegex.exec(content)) !== null) {
  const key = match[1];
  if (seen.has(key)) {
    duplicates.push({ key, firstLine: seen.get(key), secondPos: match.index });
  } else {
    seen.set(key, match.index);
  }
}

console.log('Duplicates found:', duplicates.length);
duplicates.forEach(d => console.log('Duplicate key:', d.key));
