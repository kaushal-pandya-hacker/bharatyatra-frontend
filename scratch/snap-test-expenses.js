const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(os.tmpdir(), 'chrome-snap-' + Date.now());

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9336',
  '--disable-gpu',
  '--no-first-run',
  '--user-data-dir=' + userDataDir,
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://127.0.0.1:9336/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    
    const socket = new WebSocket(pageTab.webSocketDebuggerUrl);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
      socket.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      socket.send(JSON.stringify({ id: 3, method: 'Page.navigate', params: { url: 'http://localhost:3000/trips/1/expenses' } }));
    };

    socket.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        if (msg.params.type === 'error' || msg.params.type === 'warning') {
          console.log(`[CONSOLE ${msg.params.type}]: ${text}`);
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.log(`[EXCEPTION]:`, JSON.stringify(msg.params.exceptionDetails));
      } else if (msg.method === 'Page.loadEventFired') {
        await new Promise(r => setTimeout(r, 3000));
        
        socket.send(JSON.stringify({
          id: 10,
          method: 'Runtime.evaluate',
          params: { expression: 'document.querySelector("nextjs-portal") ? (document.querySelector("nextjs-portal").shadowRoot ? document.querySelector("nextjs-portal").shadowRoot.innerHTML : "portal-no-shadow") : "no-portal"' }
        }));
      }

      if (msg.id === 10) {
        console.log('Portal check on expenses:', (msg.params?.result?.value || msg.result?.result?.value || '').substring(0, 300));
        
        socket.send(JSON.stringify({
          id: 11,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      }

      if (msg.id === 11) {
        const base64Data = msg.result.data;
        const outPath = path.resolve('scratch', 'localhost-expenses-snap.png');
        fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
        console.log('Saved screenshot to:', outPath);
        socket.close();
      }
    };

    await new Promise(r => setTimeout(r, 12000));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

run();

