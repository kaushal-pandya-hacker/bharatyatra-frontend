const fs = require('fs');
let content = fs.readFileSync('lib/ai-planner/india-geo-registry.ts', 'utf8');

// Find second 'port blair' block and remove it
const secondPbStart = content.lastIndexOf("  // ==========================================\n  // ANDAMAN & NICOBAR ISLANDS (UT)\n  // ==========================================\n  'port blair': {");
const secondPbEnd = content.indexOf("  'havelock': {", secondPbStart);

if (secondPbStart !== -1 && secondPbEnd !== -1) {
  content = content.substring(0, secondPbStart) + content.substring(secondPbEnd);
  fs.writeFileSync('lib/ai-planner/india-geo-registry.ts', content, 'utf8');
  console.log('Removed duplicate port blair block!');
} else {
  console.log('Could not find second port blair block');
}
