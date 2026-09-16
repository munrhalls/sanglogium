import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);

function parseFlag(prefix, fallback) {
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const positional = args.filter(a => !a.startsWith('--'));
const url = positional[0] || 'http://localhost:3000/products/headphones';
const outDir = positional[1] || '/tmp/scroll-captures';
const selector = parseFlag('--selector=', '');
const hint = parseFlag('--hint=', 'left');
const viewport = parseFlag('--viewport=', '1440x900');
const wait = Number(parseFlag('--wait=', '120'));
const [vw, vh] = viewport.split('x').map(Number);

if (!['left', 'right', 'body', 'largest'].includes(hint)) {
  console.error('Invalid --hint. Use left, right, body, or largest.');
  process.exit(1);
}

if (Number.isNaN(vw) || Number.isNaN(vh) || vw < 100 || vh < 100) {
  console.error('Invalid --viewport. Use WxH, e.g. 1440x900.');
  process.exit(1);
}

let browser, context, page, isNewContext;

try {
  const pw = await import('playwright');
  if (!pw.chromium) throw new Error('Playwright chromium module not found.');

  browser = await pw.chromium.connectOverCDP('http://127.0.0.1:9222');
  isNewContext = browser.contexts().length === 0;
  context = isNewContext ? await browser.newContext() : browser.contexts()[0];
  page = await context.newPage();

  await page.setViewportSize({ width: vw, height: vh });
  await fs.mkdir(outDir, { recursive: true });

  console.log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  let el;
  if (selector) {
    el = await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    if (!el) throw new Error(`Selector not found: ${selector}`);
  } else {
    const handle = await page.evaluateHandle((hint) => {
      const root = document.documentElement;
      if (hint === 'body') return root;

      const inView = (element) => {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = element.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 20) return false;
        if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
        return true;
      };

      const all = [...document.querySelectorAll('*')].filter(element => {
        if (!inView(element)) return false;
        const style = window.getComputedStyle(element);
        if (style.overflowY !== 'auto' && style.overflowY !== 'scroll') return false;
        if (element.scrollHeight <= element.clientHeight + 20) return false;
        return true;
      });

      if (!all.length) {
        if (root.scrollHeight > root.clientHeight + 20) return root;
        return null;
      }

      const midX = window.innerWidth / 2;
      if (hint === 'left') {
        const left = all.filter(element => element.getBoundingClientRect().right <= midX);
        if (left.length) return left.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
      }
      if (hint === 'right') {
        const right = all.filter(element => element.getBoundingClientRect().left >= midX);
        if (right.length) return right.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
      }
      return all.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
    }, hint);
    el = handle.asElement();
    if (!el) throw new Error(`No scrollable target found with hint=${hint}. Try --selector.`);
  }

  const isRoot = await el.evaluate(e => e === document.documentElement);
  const info = await el.evaluate((e, rootFlag) => {
    const rect = e.getBoundingClientRect();
    return {
      tag: e.tagName,
      id: e.id,
      className: e.className,
      isRoot: rootFlag,
      scrollHeight: e.scrollHeight,
      clientHeight: e.clientHeight,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }, isRoot);

  const classDesc = info.className ? '.' + info.className.split(/\s+/).join('.') : '';
  const idDesc = info.id ? '#' + info.id : '';
  const desc = info.isRoot ? 'html' : `<${info.tag.toLowerCase()}${idDesc}${classDesc}>`;
  console.log(`Target: ${desc}`);
  console.log(`scrollHeight=${info.scrollHeight}, clientHeight=${info.clientHeight}, top=${Math.round(info.top)}, left=${Math.round(info.left)}, viewport=${vw}x${vh}`);

  const clientHeight = info.clientHeight;
  const scrollHeight = info.scrollHeight;
  const positions = [];
  let pos = 0;
  while (pos < scrollHeight - clientHeight) {
    positions.push(pos);
    pos += clientHeight;
  }
  if (positions.length === 0 || positions[positions.length - 1] < scrollHeight - clientHeight) {
    positions.push(Math.max(0, scrollHeight - clientHeight));
  }

  console.log(`Capturing ${positions.length} screenshot(s) at scrollTop positions: ${positions.join(', ')}`);

  const paths = [];
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    if (info.isRoot) {
      await page.evaluate(pos => {
        window.scrollTo({ top: pos, behavior: 'auto' });
        document.documentElement.style.scrollBehavior = 'auto';
      }, p);
      await page.waitForTimeout(wait);
      const file = path.join(outDir, `scroll-${String(i + 1).padStart(3, '0')}.png`);
      await page.screenshot({ path: file });
      paths.push(file);
    } else {
      await el.evaluate((element, scrollPos) => {
        element.style.scrollBehavior = 'auto';
        element.scrollTop = scrollPos;
      }, p);
      await page.waitForTimeout(wait);
      const file = path.join(outDir, `scroll-${String(i + 1).padStart(3, '0')}.png`);
      await el.screenshot({ path: file });
      paths.push(file);
    }
    console.log(`file://${paths[i]}`);
  }

  console.log(`All saved to ${outDir}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exitCode = 1;
} finally {
  try {
    if (page && !isNewContext) await page.close();
    if (context && isNewContext) await context.close();
  } catch {}
}
