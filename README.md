# Playwright Chromium Benchmark

This project benchmarks Chromium browser performance in headless and headful modes using Playwright, and generates a combined chart for CPU and memory usage.

## Project Structure

```
playwright/
├── src/
│   ├── benchmark.ts
│   └── plot-benchmark.ts
├── results/
│   ├── benchmark-results.json
│   └── benchmark-comparison.png
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
└── node_modules/
```

- **src/**: Source scripts for benchmarking and plotting
- **results/**: Output data and charts
- **README.md**: Project documentation
- **package.json**: Project dependencies
- **tsconfig.json**: TypeScript configuration

## Prerequisites
- Node.js (v14+ recommended)

## Install dependencies
```
npm install
```

## Run the benchmark (TypeScript)
```
npx ts-node src/benchmark.ts
```

## Generate the combined chart
```
npx ts-node src/plot-benchmark.ts
```

This will output results to the `results/` directory:
- `benchmark-results.json`: Averaged results for headful and headless modes
- `benchmark-comparison.png`: Combined chart comparing CPU and memory usage

---

