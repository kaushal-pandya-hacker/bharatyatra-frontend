const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let idx = 0;
    while ((idx = data.toLowerCase().indexOf('hydration', idx)) !== -1) {
      console.log('Hydration match at', idx, ':', data.substring(Math.max(0, idx - 100), Math.min(data.length, idx + 100)));
      idx += 9;
    }
    let errIdx = 0;
    while ((errIdx = data.toLowerCase().indexOf('error', errIdx)) !== -1) {
      console.log('Error match at', errIdx, ':', data.substring(Math.max(0, errIdx - 50), Math.min(data.length, errIdx + 100)));
      errIdx += 5;
    }
  });
});
