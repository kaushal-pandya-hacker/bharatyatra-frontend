const fs = require('fs');
const destMasterService = require('./lib/ai-planner/destination-master-service');

const summaries = destMasterService.getAllStatesCoverageSummary();
console.log('Total summaries:', summaries.length);
const states = summaries.filter(s => s.type === 'State');
const uts = summaries.filter(s => s.type === 'Union Territory');
console.log('States count:', states.length);
console.log('UTs count:', uts.length);
uts.forEach(u => console.log(`  ${u.stateOrUt}: ${u.destinationCount} places`));
