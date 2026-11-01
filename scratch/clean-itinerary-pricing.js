const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'lib/trips/itinerary-generator.ts',
  '18_DEVELOPMENT/Frontend/lib/trips/itinerary-generator.ts',
  'BharatYatra-Vercel-Frontend/lib/trips/itinerary-generator.ts',
];

for (const rel of filesToUpdate) {
  const fullPath = path.resolve(rel);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. In PlanningResult interface: make totalPackageCost and pricePerPaxPerDay optional
  content = content.replace(
    /totalPackageCost:\s*number;/,
    'totalPackageCost?: number;'
  );
  content = content.replace(
    /pricePerPaxPerDay:\s*number;/,
    'pricePerPaxPerDay?: number;'
  );

  // 2. Remove let pricePerPaxPerDay = 0;
  content = content.replace(
    /\s*\/\/\s*Pure Itinerary Planning \(No pricing\)\r?\n\s*let pricePerPaxPerDay = 0;\r?\n/,
    '\n'
  );

  // 3. In early return (selectedPlaces.length === 0): remove totalPackageCost and pricePerPaxPerDay
  content = content.replace(
    /\r?\n\s*totalPackageCost:\s*0,\r?\n\s*pricePerPaxPerDay,\r?\n/,
    '\n'
  );

  // 4. In mid-calculation: remove const totalPackageCost = 0; pricePerPaxPerDay = 0;
  content = content.replace(
    /\s*\/\/\s*8\.\s*Pure Travel Planning[^\n]*\r?\n\s*const totalPackageCost = 0;\r?\n\s*pricePerPaxPerDay = 0;\r?\n/,
    '\n'
  );

  // 5. In final return object: remove totalPackageCost and pricePerPaxPerDay
  content = content.replace(
    /\r?\n\s*totalPackageCost,\r?\n\s*pricePerPaxPerDay,\r?\n/,
    '\n'
  );

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Successfully updated:', rel);
}

