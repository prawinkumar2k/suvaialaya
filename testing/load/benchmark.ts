/**
 * SUVAIALAYA API LOAD TESTING TOOL (ZERO TRUST)
 * Fiers high concurrency requests to measure server throughput and latencies.
 */

const TARGET_URL = process.argv[2] || "http://localhost:8080/api/ping";
const CONCURRENCY = parseInt(process.argv[3] || "50", 10);
const TOTAL_REQUESTS = parseInt(process.argv[4] || "2500", 10);

console.log("\n=======================================================");
console.log("🔥 SUVAIALAYA LOAD TEST RUNNER");
console.log(`Target URL:   ${TARGET_URL}`);
console.log(`Concurrency:  ${CONCURRENCY} parallel requests`);
console.log(`Total count:  ${TOTAL_REQUESTS} requests`);
console.log("=======================================================\n");

interface RequestMetric {
  latency: number;
  success: boolean;
  status: number;
}

async function runBenchmark() {
  const metrics: RequestMetric[] = [];
  let completed = 0;
  const startTime = performance.now();

  const worker = async () => {
    while (completed < TOTAL_REQUESTS) {
      const id = completed++;
      if (id >= TOTAL_REQUESTS) break;

      const reqStart = performance.now();
      try {
        const res = await fetch(TARGET_URL);
        const reqEnd = performance.now();
        metrics.push({
          latency: reqEnd - reqStart,
          success: res.ok,
          status: res.status
        });
      } catch (err: any) {
        const reqEnd = performance.now();
        metrics.push({
          latency: reqEnd - reqStart,
          success: false,
          status: 0
        });
      }
    }
  };

  // Spawn parallel workers matching CONCURRENCY
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const endTime = performance.now();
  const durationMs = endTime - startTime;
  const durationSec = durationMs / 1000;

  // Compute stats
  const latencies = metrics.map((m) => m.latency).sort((a, b) => a - b);
  const successCount = metrics.filter((m) => m.success).length;
  const failedCount = metrics.length - successCount;

  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const sumLatency = latencies.reduce((sum, lat) => sum + lat, 0);
  const avgLatency = sumLatency / metrics.length || 0;

  // Percentiles
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

  const rps = metrics.length / durationSec;

  console.log("📈 RESULTS SUMMARY:");
  console.log("-------------------------------------------------------");
  console.log(`Total Duration:     ${durationSec.toFixed(2)} seconds`);
  console.log(`Successful Req:     \x1b[32m${successCount}\x1b[0m`);
  console.log(`Failed Req:         \x1b[31m${failedCount}\x1b[0m`);
  console.log(`Throughput:         \x1b[36m${rps.toFixed(1)} req/sec\x1b[0m`);
  console.log("-------------------------------------------------------");
  console.log("⏱️ LATENCY PERCENTILES:");
  console.log(`Average Latency:    ${avgLatency.toFixed(1)} ms`);
  console.log(`Min Latency:        ${minLatency.toFixed(1)} ms`);
  console.log(`P50 (Median):       ${p50.toFixed(1)} ms`);
  console.log(`P90:                ${p90.toFixed(1)} ms`);
  console.log(`P95:                ${p95.toFixed(1)} ms`);
  console.log(`P99:                ${p99.toFixed(1)} ms`);
  console.log(`Max Latency:        ${maxLatency.toFixed(1)} ms`);
  console.log("=======================================================\n");
}

runBenchmark().catch((err) => {
  console.error("Benchmark crashed", err);
});
