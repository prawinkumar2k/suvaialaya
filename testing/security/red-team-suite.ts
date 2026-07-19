import axios from "axios";
import http from "http";

const BASE_URL = "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  validateStatus: () => true, // Don't throw on 4xx/5xx
  timeout: 5000
});

async function runRedTeamSuite() {
  console.log("==================================================");
  console.log("🔥 INITIATING LEVEL-4 RED TEAM AUTOMATED ATTACK 🔥");
  console.log("==================================================\n");

  let vulnerabilities = 0;

  const logResult = (testName: string, passed: boolean, details: string) => {
    if (passed) {
      console.log(`✅ DEFENDED: ${testName}`);
    } else {
      console.log(`❌ BREACHED: ${testName} - ${details}`);
      vulnerabilities++;
    }
  };

  try {
    // 1. PAGE ROUTE TESTING (Level -2)
    console.log("--- LEVEL -2: PAGE ROUTE INTEGRITY ---");
    const routes = ["/", "/slots", "/payment", "/login", "/register", "/admin", "/fake-page-that-should-404"];
    for (const route of routes) {
      const res = await axiosInstance.get(`${BASE_URL}${route}`);
      if (route === "/fake-page-that-should-404") {
        logResult(`404 Handling (${route})`, res.status === 404 || res.data.includes("Not Found"), `Returned ${res.status}`);
      } else {
        logResult(`Route Accessible (${route})`, res.status === 200, `Returned ${res.status}`);
      }
    }
    console.log();

    // 2. NoSQL INJECTION TEST (Level -8)
    console.log("--- LEVEL -8: SECURITY (NoSQL Injection) ---");
    const noSqlPayload = { email: { $gt: "" }, password: { $gt: "" } };
    const nosqlRes = await axiosInstance.post(`${API_URL}/auth/login`, noSqlPayload);
    logResult("NoSQL Injection Protection", nosqlRes.status !== 200 && nosqlRes.status !== 201, `VULNERABLE! Server accepted payload and returned ${nosqlRes.status}`);
    console.log();

    // 3. UNAUTHORIZED API ACCESS (Level -4)
    console.log("--- LEVEL -4: API SECURITY ---");
    const protectedRoutes = [
      { method: 'GET', path: '/bookings/my-bookings' },
      { method: 'GET', path: '/admin/stats' },
      { method: 'POST', path: '/payments/create-order' }
    ];

    for (const route of protectedRoutes) {
      const res = await axiosInstance({
        method: route.method,
        url: `${API_URL}${route.path}`
      });
      logResult(`Protected Route (${route.method} ${route.path})`, res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
    }
    console.log();

    // 4. RATE LIMITING / BRUTE FORCE (Level -8)
    console.log("--- LEVEL -8: BRUTE FORCE & RATE LIMITING ---");
    console.log("Spamming /api/auth/login with 20 requests in 1 second...");
    let rateLimitTriggered = false;
    const spamPromises = Array.from({ length: 20 }).map(() => 
      axiosInstance.post(`${API_URL}/auth/login`, { email: "fake@fake.com", password: "fake" })
    );
    
    const spamResults = await Promise.all(spamPromises);
    for (const res of spamResults) {
      if (res.status === 429) {
        rateLimitTriggered = true;
        break;
      }
    }
    logResult("Rate Limiting Protection", rateLimitTriggered, "Server did not block spam requests (No 429 status returned)");

  } catch (error: any) {
    console.error("Test Suite Crashed:", error.message);
  }

  console.log("\n==================================================");
  console.log(`🎯 RED TEAM REPORT: ${vulnerabilities} VULNERABILITIES FOUND`);
  console.log("==================================================");
}

runRedTeamSuite();
