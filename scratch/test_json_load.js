const path = require('path');
const rootDir = path.resolve('.');

const jsonPath = path.resolve(rootDir, 'data/tourism/destinations-master.json');
const arr = require(jsonPath);
console.log('Direct require length:', arr.length);
