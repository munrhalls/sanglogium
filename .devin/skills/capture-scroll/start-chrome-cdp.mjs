import { spawn, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const force = process.argv.includes('--force');

function existsExecutable(p) {
  try {
    fs.accessSync(p, fs.constants.X_OK);
    return fs.existsSync(p);
  } catch { return false; }
}

function findPlaywrightChromium() {
  const pwCache = '/home/jan/.cache/ms-playwright';
  if (!fs.existsSync(pwCache)) return null;
  const dirs = fs.readdirSync(pwCache).filter(d => d.startsWith('chromium-'));
  for (const dir of dirs) {
    const p = path.join(pwCache, dir, 'chrome-linux', 'chrome');
    if (existsExecutable(p)) return p;
    const p64 = path.join(pwCache, dir, 'chrome-linux64', 'chrome');
    if (existsExecutable(p64)) return p64;
  }
  return null;
}

function findChrome() {
  const pw = findPlaywrightChromium();
  if (pw) return pw;

  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const names = ['google-chrome', 'chromium', 'chromium-browser', 'chrome'];
  for (const dir of dirs) {
    for (const name of names) {
      const p = path.join(dir, name);
      if (existsExecutable(p)) return p;
    }
  }
  const fixed = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/local/bin/google-chrome',
    '/usr/local/bin/chromium',
    '/opt/google/chrome/google-chrome',
    '/opt/google/chrome/chrome',
    '/usr/lib/chromium/chromium',
    '/snap/bin/chromium'
  ];
  for (const p of fixed) if (existsExecutable(p)) return p;
  return null;
}

function canConnect(host, port, timeout = 5000) {
  return new Promise(resolve => {
    const socket = new net.Socket().setTimeout(500);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });
}

function runningChromeCount() {
  return new Promise(resolve => {
    execFile('pgrep', ['-c', 'chrome'], (err1, out1) => {
      const a = err1 ? 0 : (parseInt(out1, 10) || 0);
      execFile('pgrep', ['-c', 'chromium'], (err2, out2) => {
        const b = err2 ? 0 : (parseInt(out2, 10) || 0);
        resolve(a + b);
      });
    });
  });
}

const cdpUp = await canConnect('127.0.0.1', 9222);
if (cdpUp) {
  console.log('Chrome CDP already listening on http://127.0.0.1:9222');
  process.exit(0);
}

let procs = await runningChromeCount();
if (procs > 0 && !force) {
  console.error('A Chrome/Chromium process is already running but CDP is not on port 9222.');
  console.error('Close it and restart with: google-chrome --remote-debugging-port=9222');
  console.error('Or run with --force to kill it and start a headless Chrome.');
  process.exit(1);
}

if (procs > 0 && force) {
  console.log('Killing existing Chrome/Chromium processes...');
  await new Promise(resolve => {
    execFile('pkill', ['-TERM', 'chrome'], () => {
      execFile('pkill', ['-TERM', 'chromium'], () => {
        setTimeout(resolve, 3000);
      });
    });
  });
  procs = await runningChromeCount();
  if (procs > 0) {
    await new Promise(resolve => {
      execFile('pkill', ['-9', 'chrome'], () => {
        execFile('pkill', ['-9', 'chromium'], () => resolve());
      });
    });
  }
}

const binary = findChrome();
if (!binary) {
  console.error('No Chrome/Chromium binary found. Install google-chrome or chromium.');
  process.exit(1);
}

const log = fs.openSync('/tmp/chrome-cdp.log', 'w');
const child = spawn(binary, [
  '--remote-debugging-port=9222',
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--user-data-dir=/tmp/chrome-cdp-profile'
], { detached: true, stdio: ['ignore', log, log] });

fs.writeFileSync('/tmp/chrome-cdp.pid', String(child.pid));
child.unref();

console.log(`Started Chrome at ${binary} (pid ${child.pid}), waiting for CDP...`);

function waitForPort(host, port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = () => {
      const socket = new net.Socket().setTimeout(500);
      socket.once('connect', () => { socket.destroy(); resolve(); });
      socket.once('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Timed out waiting for CDP'));
        else setTimeout(attempt, 250);
      });
      socket.once('timeout', () => {
        socket.destroy();
        if (Date.now() - start > timeout) reject(new Error('Timed out waiting for CDP'));
        else setTimeout(attempt, 250);
      });
      socket.connect(port, host);
    };
    attempt();
  });
}

await waitForPort('127.0.0.1', 9222, 30000);
console.log('Chrome CDP is listening on http://127.0.0.1:9222');
