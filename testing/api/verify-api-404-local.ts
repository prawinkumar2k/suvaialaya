import axios from "axios";
import http from "http";
import { createServer } from "./server/index";

async function verify404() {
  console.log("==================================================");
  console.log("🛠️ VERIFYING API 404 ROUTING FIX (INTERNAL TEST)");
  console.log("==================================================\n");

  const app = createServer();
  const server = http.createServer(app);
  
  // Start server on random available port
  server.listen(0, "127.0.0.1", async () => {
    const address = server.address() as import("net").AddressInfo;
    const PORT = address.port;
    console.log(`[Test Server] Listening on port ${PORT}`);

    try {
      const axiosInstance = axios.create({
        validateStatus: () => true, // Don't throw on 4xx/5xx
      });

      const fakeRoute = "/api/fake-api-that-does-not-exist";
      console.log(`[Test Client] Sending GET request to: ${fakeRoute}...`);
      
      const res = await axiosInstance.get(`http://127.0.0.1:${PORT}${fakeRoute}`);
      
      console.log(`\nResponse Status: ${res.status} ${res.statusText}`);
      console.log(`Response Body:`);
      console.log(JSON.stringify(res.data, null, 2));

      console.log("\n==================================================");
      if (res.status === 404 && res.data?.error?.includes("API route not found")) {
        console.log("✅ SUCCESS: Server correctly returned 404 Not Found for undefined API route.");
      } else {
        console.log(`❌ FAILURE: Expected 404 with custom error, got ${res.status}`);
      }
      console.log("==================================================");

    } catch (error: any) {
      console.error("Test Script Failed:", error?.message || error.toString());
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

verify404();
