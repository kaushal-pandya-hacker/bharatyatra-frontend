const fs = require('fs');
const content = fs.readFileSync('lib/ai-planner/india-geo-registry.ts', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes("'port blair'") || l.includes('"port blair"')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
