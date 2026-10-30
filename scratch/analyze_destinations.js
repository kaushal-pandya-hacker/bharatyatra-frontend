const fs = require('fs');

const dMaster = require('../data/tourism/destinations-master.json');
console.log('Total destinations in destinations-master.json:', dMaster.length);

const stateCounts = {};
for (const d of dMaster) {
  const s = d.stateOrUt || 'Unknown';
  stateCounts[s] = (stateCounts[s] || 0) + 1;
}

console.log('States/UTs count in destinations-master.json:', Object.keys(stateCounts).length);
console.log('State breakdown:');
const sortedStates = Object.entries(stateCounts).sort((a,b) => b[1] - a[1]);
sortedStates.forEach(([st, cnt]) => console.log(`  ${st}: ${cnt}`));

// Check state-folder-tourism.json
try {
  const sFolder = require('../data/tourism/state-folder-tourism.json');
  console.log('\nstate-folder-tourism.json keys/items:', Array.isArray(sFolder) ? sFolder.length : Object.keys(sFolder).length);
  if (Array.isArray(sFolder) && sFolder.length > 0) {
    console.log('Sample item from state-folder-tourism:', JSON.stringify(sFolder[0], null, 2));
  }
} catch (e) {
  console.log('Error reading state-folder-tourism:', e.message);
}
