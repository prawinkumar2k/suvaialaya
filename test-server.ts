import http from "http";
import { createServer } from "./server/index";

const app = createServer();
const PORT = 9090;

const server = http.createServer(app).listen(PORT, "127.0.0.1", () => {
  console.log(`\n>>> TEST SERVER LISTENING ON PORT ${PORT} <<<\n`);
  
  // Exit gracefully after 15 seconds to not leave hanging process
  setTimeout(() => {
    server.close();
    process.exit(0);
  }, 60000);
});
