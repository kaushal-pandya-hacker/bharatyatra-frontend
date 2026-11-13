const fs = require('fs');
let s = fs.readFileSync('lib/nexi-api.ts', 'utf8');
s = s.replace("'OPEN_PAYMENT_PAGE'", "'OPEN_PAYMENT_PAGE' | 'OPEN_DESTINATIONS' | 'OPEN_OFFERS'");
fs.writeFileSync('lib/nexi-api.ts', s, 'utf8');
console.log('Successfully patched lib/nexi-api.ts');

