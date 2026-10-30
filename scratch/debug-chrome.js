const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(os.tmpdir(), 'chrome-test-' + Date.now());

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9334',
  '--disable-gpu',
  '--no-first-run',
  '--user-data-dir=' + userDataDir,
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://127.0.0.1:9334/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    
    const socket = new WebSocket(pageTab.webSocketDebuggerUrl);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      socket.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
      socket.send(JSON.stringify({ id: 3, method: 'Network.enable' }));
      socket.send(JSON.stringify({ id: 4, method: 'Page.enable' }));
      socket.send(JSON.stringify({ id: 5, method: 'Page.navigate', params: { url: 'http://localhost:3000' } }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log(`[CONSOLE ${msg.params.type}]: ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.log(`[EXCEPTION]:`, JSON.stringify(msg.params.exceptionDetails));
      } else if (msg.method === 'Log.entryAdded') {
        console.log(`[LOG ${msg.params.entry.level}]: ${msg.params.entry.text}`);
      } else if (msg.method === 'Network.responseReceived') {
        if (msg.params.response.status >= 400) {
          console.log(`[HTTP ${msg.params.response.status}]: ${msg.params.response.url}`);
        }
      }
    };

    await new Promise(r => setTimeout(r, 6000));
    socket.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
  }
}

run();

