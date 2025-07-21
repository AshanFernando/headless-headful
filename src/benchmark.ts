import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface BenchmarkResult {
  mode: string;
  cpuTotal: number;
  memory: number;
  timeMs: number;
}

function removeOutliersAndAverage(values: number[]): number {
  if (values.length <= 2) return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const sorted = [...values].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1); // remove min and max
  return Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
}

async function runTest(headless: boolean): Promise<{cpuTotal: number, memory: number, timeMs: number, mode: string}> {
  const mode = headless ? 'Headless' : 'Headful';
  try {
    const startUsage = process.cpuUsage();
    const startMem = process.memoryUsage().rss;
    const startTime = Date.now();
    const browser = await chromium.launch({ headless });
    const page = await browser.newPage();
    await page.goto('https://www.wikipedia.org');
    await page.waitForTimeout(3000);
    // Capture memory before closing the browser
    const endMem = process.memoryUsage().rss;
    await browser.close();
    const endUsage = process.cpuUsage(startUsage);
    const endTime = Date.now();
    const cpuTotal = Math.round((endUsage.user + endUsage.system) / 1000);
    const memory = Math.round((endMem - startMem) / 1024); // KB
    const timeMs = Math.round(endTime - startTime);
    return { mode, cpuTotal, memory, timeMs };
  } catch (err) {
    console.error(`${mode}: Playwright test failed:`, err);
    process.exit(1);
  }
}

async function runTestMultiple(headless: boolean, runs: number = 5): Promise<BenchmarkResult> {
  const results = [];
  for (let i = 0; i < runs; i++) {
    results.push(await runTest(headless));
  }
  return {
    mode: results[0].mode,
    cpuTotal: removeOutliersAndAverage(results.map(r => r.cpuTotal)),
    memory: removeOutliersAndAverage(results.map(r => r.memory)),
    timeMs: removeOutliersAndAverage(results.map(r => r.timeMs)),
  };
}

(async () => {
  const resultsDir = path.join(__dirname, '../results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);
  const results = [await runTestMultiple(false), await runTestMultiple(true)];
  fs.writeFileSync(path.join(resultsDir, 'benchmark-results.json'), JSON.stringify(results, null, 2));
  console.log('Averaged results (outliers removed) saved to', path.join('results', 'benchmark-results.json'));
})(); 