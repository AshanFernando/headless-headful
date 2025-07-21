import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { createCanvas, loadImage } from 'canvas';
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

const chartWidth = 500;
const chartHeight = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: chartWidth, height: chartHeight });

function getBarColor(mode: string) {
  return mode === 'Headful' ? '#4b6b4a' : '#e2c77a';
}

async function createIndividualChart(data: BenchmarkResult[], title: string, dataKey: keyof BenchmarkResult, yAxisLabel: string): Promise<Buffer> {
  const modes = data.map(d => d.mode);
  const colors = modes.map(getBarColor);
  
  return await chartJSNodeCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels: modes,
      datasets: [
        {
          label: title,
          data: data.map(d => d[dataKey] as number),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 18,
            weight: 'bold',
          },
        },
        legend: {
          display: false, // Hide legend for individual charts
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 14,
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisLabel,
            font: {
              size: 14,
            },
          },
          ticks: {
            font: {
              size: 12,
            },
          },
        },
      },
    },
  });
}

async function combineCharts(cpuChart: Buffer, memoryChart: Buffer, timeChart: Buffer): Promise<Buffer> {
  const combinedWidth = chartWidth * 3;
  const combinedHeight = chartHeight + 50; // Extra space for title
  
  const canvas = createCanvas(combinedWidth, combinedHeight);
  const ctx = canvas.getContext('2d');
  
  // Set background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, combinedWidth, combinedHeight);
  
  // Add main title
  ctx.fillStyle = 'black';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Chromium Performance Comparison: Headful vs Headless', combinedWidth / 2, 30);
  
  // Load and draw the three charts
  const cpuImage = await loadImage(cpuChart);
  const memoryImage = await loadImage(memoryChart);
  const timeImage = await loadImage(timeChart);
  
  // Draw charts side by side
  ctx.drawImage(cpuImage, 0, 50);
  ctx.drawImage(memoryImage, chartWidth, 50);
  ctx.drawImage(timeImage, chartWidth * 2, 50);
  
  // Add subplot labels
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CPU Time (ms)', chartWidth / 2, chartHeight + 80);
  ctx.fillText('Memory Usage (KB)', chartWidth * 1.5, chartHeight + 80);
  ctx.fillText('Elapsed Time (ms)', chartWidth * 2.5, chartHeight + 80);
  
  return canvas.toBuffer('image/png');
}

async function plot() {
  const resultsPath = path.join(__dirname, '../results', 'benchmark-results.json');
  const data: BenchmarkResult[] = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  
  // Create individual charts
  console.log('Generating individual charts...');
  const cpuChart = await createIndividualChart(data, 'CPU Time Comparison', 'cpuTotal', 'CPU Time (ms)');
  const memoryChart = await createIndividualChart(data, 'Memory Usage Comparison', 'memory', 'Memory (KB)');
  const timeChart = await createIndividualChart(data, 'Elapsed Time Comparison', 'timeMs', 'Time (ms)');
  
  // Save individual charts
  fs.writeFileSync(path.join(__dirname, '../results', 'benchmark-cpu.png'), cpuChart);
  fs.writeFileSync(path.join(__dirname, '../results', 'benchmark-memory.png'), memoryChart);
  fs.writeFileSync(path.join(__dirname, '../results', 'benchmark-time.png'), timeChart);
  
  // Combine charts
  console.log('Combining charts...');
  const combinedChart = await combineCharts(cpuChart, memoryChart, timeChart);
  fs.writeFileSync(path.join(__dirname, '../results', 'benchmark-combined.png'), combinedChart);
  
  console.log('Charts saved:');
  console.log('- benchmark-cpu.png (individual)');
  console.log('- benchmark-memory.png (individual)');
  console.log('- benchmark-time.png (individual)');
  console.log('- benchmark-combined.png (combined side-by-side)');
}

plot(); 