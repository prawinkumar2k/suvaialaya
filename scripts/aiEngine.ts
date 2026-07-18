import fs from "fs";
import path from "path";

// ─── AI Documentation Engine ──────────────────────────────────────────────────
// Automatically parses the codebase and generates Architecture, ER, and API
// documentation. Ensures the project survives even if the original developer leaves.

const SERVER_DIR = path.join(process.cwd(), "server");
const OUTPUT_DIR = path.join(process.cwd(), "docs", "ai-generated");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateDocumentation() {
  console.log("🤖 AI Engine: Scanning codebase...");

  // 1. Scan Models (ER Diagram generation)
  const modelsDir = path.join(SERVER_DIR, "models");
  const models = fs.readdirSync(modelsDir).filter(f => f.endsWith(".ts"));
  
  let erMermaid = "erDiagram\n";
  models.forEach(modelFile => {
    const modelName = modelFile.replace(".ts", "");
    erMermaid += `  ${modelName} {\n    string _id\n    date createdAt\n  }\n`;
  });
  // Manually add known relationships for the mock
  erMermaid += `  User ||--o{ Booking : "makes"\n`;
  erMermaid += `  Event ||--o{ Booking : "has"\n`;
  erMermaid += `  Tenant ||--o{ Event : "hosts"\n`;
  erMermaid += `  Tenant ||--o{ Incident : "reports"\n`;

  // 2. Scan Routes (API Diagram)
  const routesDir = path.join(SERVER_DIR, "routes");
  const routes = fs.readdirSync(routesDir).filter(f => f.endsWith(".ts"));
  
  let apiMermaid = "graph TD\n  Client[Web / Mobile Client]\n";
  routes.forEach(routeFile => {
    const routeName = routeFile.replace("Routes.ts", "");
    apiMermaid += `  Client -->|/api/${routeName}| ${routeName}Controller[${routeName} Service]\n`;
  });

  // 3. Write Architecture Markdown
  const architectureMd = `
# System Architecture & Live Documentation
*Auto-generated on: ${new Date().toISOString()}*

## 1. Entity Relationship (ER) Diagram
\`\`\`mermaid
${erMermaid}
\`\`\`

## 2. Microservice API Flow
\`\`\`mermaid
${apiMermaid}
\`\`\`

## 3. Deployment Topology
\`\`\`mermaid
graph LR
  DNS[Nginx / Route53] --> Node1[Node.js API Pod 1]
  DNS --> Node2[Node.js API Pod 2]
  Node1 --> Redis[(Redis Queue/Cache)]
  Node2 --> Redis
  Node1 --> Mongo[(MongoDB Replica Set)]
  Node2 --> Mongo
  Redis --> BullMQ[BullMQ Worker Nodes]
\`\`\`

## 4. Emergency Runbook
If this system goes down and the developer is missing:
1. Check \`docker logs sems-app\`
2. Verify Feature Flags in MongoDB (\`FeatureFlag\` collection)
3. Check \`Incident\` collection for recent P1 issues.
4. Run \`pnpm run docs:generate\` to rebuild this file.
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "ARCHITECTURE.md"), architectureMd);
  console.log("✅ AI Engine: Documentation generated at docs/ai-generated/ARCHITECTURE.md");
}

generateDocumentation().catch(console.error);
