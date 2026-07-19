import axios from "axios";
import http from "http";

const BASE_URL = "http://127.0.0.1:9090/api";

const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  validateStatus: () => true, // Don't throw on 4xx/5xx
  timeout: 5000
});

async function verify404() {
  console.log("==================================================");
  console.log("🛠️ VERIFYING API 404 ROUTING FIX ON NEW SERVER INSTANCE");
  console.log("==================================================\n");

  try {
    const fakeRoute = "/api/fake-api-that-does-not-exist";
    console.log(`Sending GET request to: ${fakeRoute}...`);
    
    // Give the server 2 seconds to boot up before hitting it
    await new Promise(resolve => setTimeout(resolve, 2000));
    const res = await axiosInstance.get(`http://127.0.0.1:9090${fakeRoute}`);
    
    console.log(`\nResponse Status: ${res.status} ${res.statusText}`);
    console.log(`Response Body:`);
    console.log(JSON.stringify(res.data, null, 2));

    console.log("\n==================================================");
    if (res.status === 404) {
      console.log("✅ SUCCESS: Server correctly returned 404 Not Found for undefined API route.");
    } else {
      console.log(`❌ FAILURE: Expected 404, got ${res.status}`);
    }
    console.log("==================================================");

  } catch (error: any) {
    console.error("Test Script Failed:", error?.message || error.toString());
  }
}

verify404();
