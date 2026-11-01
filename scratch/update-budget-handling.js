const fs = require('fs');
const path = require('path');

function updateFile(relPath, fn) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log('File not found, skipping:', relPath);
    return;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated = fn(original);
  if (original !== updated) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log('Successfully updated:', relPath);
  } else {
    console.log('No changes needed for:', relPath);
  }
}

// 1. trip-storage.ts
const tripStorageFiles = [
  'lib/trips/trip-storage.ts',
  '18_DEVELOPMENT/Frontend/lib/trips/trip-storage.ts',
  'BharatYatra-Vercel-Frontend/lib/trips/trip-storage.ts',
];

tripStorageFiles.forEach((file) => {
  updateFile(file, (content) => {
    // Interface update
    content = content.replace(
      /budgetInr:\s*number;/g,
      'budgetInr?: number | null;'
    );
    // fetchUserTripsFromApi
    content = content.replace(
      /budgetInr:\s*t\.budgetInr\s*\|\|\s*25000,/g,
      'budgetInr: t.budgetInr != null && !isNaN(Number(t.budgetInr)) && Number(t.budgetInr) > 0 ? Number(t.budgetInr) : (t.budgetInr === null ? null : undefined),'
    );
    // saveTripToApi
    content = content.replace(
      /budgetInr:\s*tripData\.budgetInr\s*\|\|\s*25000,/g,
      'budgetInr: tripData.budgetInr != null && !isNaN(Number(tripData.budgetInr)) && Number(tripData.budgetInr) > 0 ? Number(tripData.budgetInr) : (tripData.budgetInr === null ? null : null),'
    );
    return content;
  });
});

// 2. plan/page.tsx
const planFiles = [
  'app/(customer)/plan/page.tsx',
  '18_DEVELOPMENT/Frontend/app/(customer)/plan/page.tsx',
  'BharatYatra-Vercel-Frontend/app/(customer)/plan/page.tsx',
];

planFiles.forEach((file) => {
  updateFile(file, (content) => {
    // Replace budgetInr: 0 with user budget preference or null
    content = content.replace(
      /budgetInr:\s*0,/g,
      'budgetInr: (searchParams?.get("budgetInr") || searchParams?.get("budget")) ? Number(searchParams.get("budgetInr") || searchParams.get("budget")) : (userProfile?.budgetInr || null),'
    );
    return content;
  });
});

// 3. my-trips/page.tsx
const myTripsFiles = [
  'app/(customer)/my-trips/page.tsx',
  '18_DEVELOPMENT/Frontend/app/(customer)/my-trips/page.tsx',
  'BharatYatra-Vercel-Frontend/app/(customer)/my-trips/page.tsx',
];

myTripsFiles.forEach((file) => {
  updateFile(file, (content) => {
    // Total Fare card in trip list
    content = content.replace(
      /<div>\r?\n\s*<span className="text-\[10px\] text-slate-500 block uppercase font-bold">Total Fare<\/span>\r?\n\s*<span className="text-base font-black text-slate-900">₹\{t\.budgetInr\.toLocaleString\('en-IN'\)\}<\/span>\r?\n\s*<\/div>/g,
      `<div>
                      {t.budgetInr && t.budgetInr > 0 ? (
                        <>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Budget Preference</span>
                          <span className="text-base font-black text-slate-900">₹{t.budgetInr.toLocaleString('en-IN')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-emerald-600 block uppercase font-bold">Trip Format</span>
                          <span className="text-xs font-bold text-slate-800">AI Route Plan</span>
                        </>
                      )}
                    </div>`
    );
    return content;
  });
});

// 4. trips/page.tsx
const tripsFiles = [
  'app/(customer)/trips/page.tsx',
  '18_DEVELOPMENT/Frontend/app/(customer)/trips/page.tsx',
  'BharatYatra-Vercel-Frontend/app/(customer)/trips/page.tsx',
];

tripsFiles.forEach((file) => {
  updateFile(file, (content) => {
    content = content.replace(
      /<span className="font-bold text-emerald-700">₹\{\(trip\.budgetInr \|\| 25000\)\.toLocaleString\('en-IN'\)\}<\/span>/g,
      `{trip.budgetInr && trip.budgetInr > 0 ? (
                          <span className="font-bold text-emerald-700">₹{trip.budgetInr.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="font-semibold text-slate-500 text-xs">Custom Route</span>
                        )}`
    );
    return content;
  });
});

// 5. dashboard/page.tsx
const dashboardFiles = [
  'app/(customer)/dashboard/page.tsx',
  '18_DEVELOPMENT/Frontend/app/(customer)/dashboard/page.tsx',
];

dashboardFiles.forEach((file) => {
  updateFile(file, (content) => {
    content = content.replace(
      /budgetInr:\s*25000,/g,
      'budgetInr: (profile as any)?.budgetInr || null,'
    );
    return content;
  });
});

// 6. user-store.ts
updateFile('lib/user/user-store.ts', (content) => {
  content = content.replace(/budgetInr:\s*number;/g, 'budgetInr?: number | null;');
  content = content.replace(
    /budgetInr:\s*trip\.budgetInr\s*\|\|\s*25000,/g,
    'budgetInr: trip.budgetInr != null && trip.budgetInr > 0 ? trip.budgetInr : null,'
  );
  content = content.replace(
    /budget_inr:\s*trip\.budgetInr\s*\|\|\s*25000,/g,
    'budget_inr: trip.budgetInr != null && trip.budgetInr > 0 ? trip.budgetInr : null,'
  );
  content = content.replace(
    /budgetInr:\s*Number\(t\.budget_inr\s*\|\|\s*0\),/g,
    'budgetInr: t.budget_inr != null && Number(t.budget_inr) > 0 ? Number(t.budget_inr) : null,'
  );
  content = content.replace(
    /budgetInr:\s*Number\(data\.budget_inr\s*\|\|\s*0\),/g,
    'budgetInr: data.budget_inr != null && Number(data.budget_inr) > 0 ? Number(data.budget_inr) : null,'
  );
  return content;
});

console.log('Budget data handling updates applied.');

