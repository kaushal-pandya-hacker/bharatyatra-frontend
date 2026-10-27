const fs = require('fs');

const res = JSON.parse(fs.readFileSync('testing/reports/nexi-evaluation-results.json', 'utf8'));
const ds = JSON.parse(fs.readFileSync('testing/nexi-evaluation-dataset-200.json', 'utf8'));

const failed = res.detailedResults.filter(r => !r.passed);
console.log('Total failed count:', failed.length);

const map = {};
failed.forEach(f => {
  const item = ds.dataset.find(d => d.id === f.id);
  if (!map[f.category]) map[f.category] = [];
  map[f.category].push({
    id: f.id,
    l: f.language,
    q: f.query,
    req: item ? item.requiredKeyPhrases : [],
    forb: item ? item.forbiddenClaims : [],
    reasons: f.failureReasons,
  });
});

for (const [c, items] of Object.entries(map)) {
  console.log(`\n================== ${c} (${items.length} failed) ==================`);
  items.forEach(i => {
    console.log(`[${i.id}] [${i.l}] "${i.q}"`);
    console.log(`   Expected req: ${JSON.stringify(i.req)}`);
    console.log(`   Forbidden:    ${JSON.stringify(i.forb)}`);
    console.log(`   Failure:      ${i.reasons.join(' | ')}`);
  });
}
