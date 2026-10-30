const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(os.tmpdir(), 'chrome-snap-' + Date.now());

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9337',
  '--disable-gpu',
  '--no-first-run',
  '--user-data-dir=' + userDataDir,
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://127.0.0.1:9337/json/list');
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
      if (msg.method === 'Page.loadEventFired') {
        await new Promise(r => setTimeout(r, 2000));
        
        socket.send(JSON.stringify({
          id: 20,
          method: 'Runtime.evaluate',
          params: { expression: `
            Array.from(document.querySelectorAll('button')).map(b => ({
              text: b.innerText,
              aria: b.getAttribute('aria-label'),
              classes: b.className
            }))
          `, returnByValue: true }
        }));
      }

      if (msg.id === 20) {
        console.log('Buttons on page:', JSON.stringify(msg.result?.result?.value, null, 2));
        socket.close();
      }
    };

    await new Promise(r => setTimeout(r, 8000));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

run();

