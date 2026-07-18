# 🧪 Suvaialaya — Master Testing Infrastructure

> *"The goal before deployment is not 'did all tests pass?' but 'can a real customer book, pay, attend, and leave happy — even if something unexpected happens?'"*

## 📁 Folder Map

| Folder | Type | Purpose |
|---|---|---|
| `smoke/` | Automated | App starts, 10 core routes respond |
| `sanity/` | Automated | Every endpoint returns expected shape |
| `regression/` | Automated | Known bugs never return |
| `security/` | Automated | OWASP Top 10, JWT, injection, replay |
| `performance/` | Automated | Response times, concurrency, load |
| `api/` | Automated | All API endpoints, all HTTP methods |
| `payments/` | Automated | Full Razorpay flow, edge cases |
| `rbac/` | Automated | Every role, every route, allow + deny |
| `database/` | Automated | Schema, indexes, atomic operations |
| `qr/` | Automated | QR generation, scan, duplicate prevention |
| `business/` | Automated | Full E2E user journey |
| `chaos/` | Automated | Redis down, MongoDB down, payment fail |
| `uat/` | Manual | Real users, real scenarios |
| `physical/` | Manual | Role-by-role operator checklists |
| `go-live/` | Manual | Pre-deployment gate checklist |
| `soft-launch/` | Manual | 50-user pilot monitoring |
| `production/` | Manual | Production acceptance report |
| `reports/` | Template | Dashboards and bug report templates |

## ▶️ Run Automated Tests

```bash
# All automated suites
pnpm test

# Individual suites
pnpm exec vitest run testing/smoke
pnpm exec vitest run testing/api
pnpm exec vitest run testing/security
pnpm exec vitest run testing/rbac
pnpm exec vitest run testing/payments
pnpm exec vitest run testing/business
pnpm exec vitest run testing/chaos
```

---

## 📊 LIVE TESTING DASHBOARD

> Update this table after every test run. Red = do not deploy.

**Last Updated:** _______________  
**Tester:** _______________  
**Build:** _______________  

| Category | Total Cases | Passed | Failed | Status |
|---|---|---|---|---|
| Smoke Tests | 30 | — | — | ⬜ |
| Sanity Tests | 40 | — | — | ⬜ |
| API Tests | 80 | — | — | ⬜ |
| Authentication | 75 | — | — | ⬜ |
| RBAC | 120 | — | — | ⬜ |
| Payments | 100 | — | — | ⬜ |
| QR Tests | 50 | — | — | ⬜ |
| Security | 500 | — | — | ⬜ |
| Database | 60 | — | — | ⬜ |
| Business Flow | 300 | — | — | ⬜ |
| Chaos Tests | 80 | — | — | ⬜ |
| Performance | 200 | — | — | ⬜ |
| Physical Testing | 150 | — | — | ⬜ |
| UAT | 200 | — | — | ⬜ |
| **TOTAL** | **1985** | **—** | **—** | **⬜** |

**Legend:** ✅ All Pass | 🟡 <5% Fail | 🔴 >5% Fail | ⬜ Not Run

---

## 🚦 GO / NO-GO GATES

| Gate | Target | Actual | Decision |
|---|---|---|---|
| Smoke Tests | 100% Pass | — | ⬜ |
| Critical API Tests | 100% Pass | — | ⬜ |
| Payment Flow | 100% Pass | — | ⬜ |
| RBAC Tests | 100% Pass | — | ⬜ |
| Security (OWASP) | 0 Critical Fail | — | ⬜ |
| Business Flow E2E | 100% Pass | — | ⬜ |
| Chaos Recovery | >80% Pass | — | ⬜ |
| UAT Satisfaction | >80% Users | — | ⬜ |
| Physical Testing | All Roles Sign Off | — | ⬜ |
| **DEPLOY DECISION** | **ALL GREEN** | — | **⬜** |
