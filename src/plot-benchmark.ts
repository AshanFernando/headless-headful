import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
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

const width = 900;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

function getBarColor(mode: string) {
  return mode === 'Headful' ? '#4b6b4a' : '#e2c77a';
}

async function plot() {
  const resultsPath = path.join(__dirname, '../results', 'benchmark-results.json');
  const data: BenchmarkResult[] = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const modes = data.map(d => d.mode);
  const colors = modes.map(getBarColor);

  // MEMORY CHART
  const memoryChart = await chartJSNodeCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels: modes,
      datasets: [
        {
          label: 'Memory Usage (KB)',
          data: data.map(d => d.memory),
          backgroundColor: colors,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Memory Usage: Headful vs Headless',
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'KB',
          },
        },
      },
    },
  });
  fs.writeFileSync(path.join(__dirname, '../results', 'benchmark-memory.png'), memoryChart);

  // CPU CHART
  const cpuChart = await chartJSNodeCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels: modes,
      datasets: [
        {
          label: 'Total CPU Time (ms)',
          data: data.map(d => d.cpuTotal),
          backgroundColor: colors,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Total CPU Time: Headful vs Headless',
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'ms',
          },
        },
      },
    },
  });
  fs.writeFileSync(path.join(__dirname, '../results', 'benchmark-cpu.png'), cpuChart);

  // TIME CHART
  const timeChart = await chartJSNodeCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels: modes,
      datasets: [
        {
          label: 'Elapsed Time (ms)',
          data: data.map(d => d.timeMs),
          backgroundColor: colors,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Elapsed Time: Headful vs Headless',
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'ms',
          },
        },
      },
    },
  });
  fs.writeFileSync(path.join(__dirname, '../results', 'benchmark-time.png'), timeChart);

  console.log('Charts saved as benchmark-memory.png, benchmark-cpu.png, and benchmark-time.png');
}

plot(); 