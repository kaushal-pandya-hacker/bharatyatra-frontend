const { spawn } = require('child_process');
const http = require('http');

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\Pandya Kaushal\\AppData\\Local\\Temp\\edge_debug_profile',
    'http://localhost:3000'
  ]);

  // wait 2s for edge to start
  await new Promise(r => setTimeout(r, 2000));

  try {
    const list = await getJson('http://127.0.0.1:9222/json/list');
    console.log('Tabs:', list.length);
    const target = list.find(t => t.type === 'page');
    if (!target) {
      console.log('No page target found');
      edge.kill();
      return;
    }

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
      ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 4, method: 'Page.navigate', params: { url: 'http://localhost:3000/trips/1/expenses/' } }));
    });

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log(`[CONSOLE ${type.toUpperCase()}]:`, text);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('[EXCEPTION]:', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      }
    });

    await new Promise(r => setTimeout(r, 8000));
    ws.close();
  } catch (err) {
    console.error('Error connecting to Edge CDP:', err);
  } finally {
    edge.kill();
  }
}

main();
