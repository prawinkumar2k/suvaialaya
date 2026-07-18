
# System Architecture & Live Documentation
*Auto-generated on: 2026-07-17T07:30:05.042Z*

## 1. Entity Relationship (ER) Diagram
```mermaid
erDiagram
  AuditLog {
    string _id
    date createdAt
  }
  Booking {
    string _id
    date createdAt
  }
  Event {
    string _id
    date createdAt
  }
  FeatureFlag {
    string _id
    date createdAt
  }
  Incident {
    string _id
    date createdAt
  }
  Tenant {
    string _id
    date createdAt
  }
  User {
    string _id
    date createdAt
  }
  Waitlist {
    string _id
    date createdAt
  }
  User ||--o{ Booking : "makes"
  Event ||--o{ Booking : "has"
  Tenant ||--o{ Event : "hosts"
  Tenant ||--o{ Incident : "reports"

```

## 2. Microservice API Flow
```mermaid
graph TD
  Client[Web / Mobile Client]
  Client -->|/api/admin| adminController[admin Service]
  Client -->|/api/analytics| analyticsController[analytics Service]
  Client -->|/api/auth| authController[auth Service]
  Client -->|/api/booking| bookingController[booking Service]
  Client -->|/api/demo.ts| demo.tsController[demo.ts Service]
  Client -->|/api/engine| engineController[engine Service]
  Client -->|/api/event| eventController[event Service]
  Client -->|/api/payment| paymentController[payment Service]
  Client -->|/api/waitlist| waitlistController[waitlist Service]

```

## 3. Deployment Topology
```mermaid
graph LR
  DNS[Nginx / Route53] --> Node1[Node.js API Pod 1]
  DNS --> Node2[Node.js API Pod 2]
  Node1 --> Redis[(Redis Queue/Cache)]
  Node2 --> Redis
  Node1 --> Mongo[(MongoDB Replica Set)]
  Node2 --> Mongo
  Redis --> BullMQ[BullMQ Worker Nodes]
```

## 4. Emergency Runbook
If this system goes down and the developer is missing:
1. Check `docker logs sems-app`
2. Verify Feature Flags in MongoDB (`FeatureFlag` collection)
3. Check `Incident` collection for recent P1 issues.
4. Run `pnpm run docs:generate` to rebuild this file.
