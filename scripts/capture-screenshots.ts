/**
 * Capture screenshots and console output from the app.
 * Run: npx ts-node scripts/capture-screenshots.ts
 */
import {chromium} from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const PORTS = [5175, 5176, 5173, 5174];
const OUTPUT_DIR = path.join(__dirname, '../screenshots-capture');

function findWorkingPort(): Promise<number> {
  const http = require('http');
  return new Promise((resolve) => {
    let idx = 0;
    function tryNext() {
      if (idx >= PORTS.length) {
        resolve(0);
        return;
      }
      const p = PORTS[idx++];
      const req = http.get(
        {hostname: '127.0.0.1', port: p, path: '/'},
        (res: any) => {
          res.resume();
          if (res.statusCode === 200) resolve(p);
          else tryNext();
        }
      );
      req.on('error', () => tryNext());
      req.setTimeout(3000, () => {
        req.destroy();
        tryNext();
      });
    }
    tryNext();
  });
}

async function main() {
  let port = await findWorkingPort();
  if (!port) {
    console.log('Port scan failed, trying 5176 directly...');
    port = 5176;
  }
  console.log(`Using http://localhost:${port}/`);

  fs.mkdirSync(OUTPUT_DIR, {recursive: true});

  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({
    viewport: {width: 1260, height: 800},
    ignoreHTTPSErrors: true,
  });

  const consoleLogs: string[] = [];
  context.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const line = `[${type}] ${text}`;
    consoleLogs.push(line);
    console.log(line);
  });

  const page = await context.newPage();

  // 1. Home page
  await page.goto(`http://localhost:${port}/`, {waitUntil: 'networkidle', timeout: 15000});
  await page.waitForTimeout(1500);
  await page.screenshot({path: path.join(OUTPUT_DIR, 'home.png'), fullPage: true});

  // 2. Lobby page
  await page.goto(`http://localhost:${port}/lobby`, {waitUntil: 'networkidle', timeout: 15000});
  await page.waitForTimeout(1500);
  await page.screenshot({path: path.join(OUTPUT_DIR, 'lobby.png'), fullPage: true});

  await browser.close();

  console.log('\n--- Console messages captured ---');
  const errors = consoleLogs.filter((l) => l.startsWith('[error]') || l.startsWith('[warning]'));
  if (errors.length > 0) {
    console.log('\nErrors/Warnings:');
    errors.forEach((e) => console.log(e));
  } else {
    console.log('No JS errors or warnings in console.');
  }

  console.log(`\nScreenshots saved to ${OUTPUT_DIR}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
