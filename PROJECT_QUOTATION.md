# Project Cost Proposal & Agreement — Suvaialaya SaaS Platform
### (Final Startup Plan — Standardized Charges)

This document outlines the final comprehensive cost breakdown for the development, setup, hosting, domain, and recurring maintenance support of the **Suvaialaya Event & Restaurant Booking SaaS Platform**.

All estimates are presented in both **Indian Rupees (INR - ₹)** and **US Dollars (USD - $)**.

---

## 1. Summary of Project Costs

| Component | Cost (INR) | Cost (USD) | Payment Model / Frequency |
| :--- | :--- | :--- | :--- |
| **A. One-Time Software Engineering** | **₹1,80,000** | **$2,160** | One-time (50% advance, 50% on completion) |
| **B. Domain Registration (`.com` / `.in`)**| **₹600** | **$8** | Yearly renewal |
| **C. Server VPS Hosting (Hetzner / Hostinger)**| **~₹779 / month** | **~$9.50 / month**| Monthly (KVM 2 Plan: 2 vCPU, 8GB RAM, 100GB NVMe)|
| **D. Monthly Active SRE Maintenance Support**| **₹3,000 / month** | **$36 / month** | Monthly subscription retainer |

---

## 2. Complete Cost Details

### A. One-Time Software Development & Setup (₹1,80,000 / $2,160)
This covers the complete implementation, database locking systems, and testing:
1. **Interactive Client UI (Vite + React 18)**: Masonry galleries, booking slot selector interface, checkout screens, user panels, and SMS/OTP verification screen.
2. **Operations Dashboard System**:
   * **Admin Console**: Sales/pax analytics charts, exportable logs, and system feature toggles.
   * **Reception Dashboard**: Live guest list, status tracking, and manual override check-ins.
   * **Kitchen dashboard**: Live order display, aggregate guest lists, and spice/dietary filters.
   * **QR Ticket Validator**: Built-in camera scanner for receptionist check-ins.
3. **Robust Backend REST API**: Mongoose schema integrations, multi-role RBAC security layers, and rate limit protection.
4. **DevOps & Infrastructure**: Docker container builds (App, self-hosted MongoDB, Redis cache/queues), free Let's Encrypt SSL configuration, and Winston logs.

---

### B. Setup & Launch Prerequisites (One-Time / Annual)
* **Domain Name Purchase (₹600 / $8 for Year 1)**: Registration of `suvaialaya.in` or `suvaialaya.com` (based on availability).
* **Let's Encrypt SSL (₹0 / $0 - Free Forever)**: Installed directly on Nginx proxy to enable secure `https://` access.

---

### C. Server VPS Hosting (₹779 / month or $9.50 / month)
We will run the app, database, and queue engine on a single **Hostinger/Hetzner CPX21 KVM VPS**:
* **Specs**: 2 vCPU Cores, 8 GB RAM, 100 GB NVMe Disk Space, 8 TB Bandwidth.
* **Why this plan**: The 8 GB RAM provides ample room to run MongoDB and Redis locally, while the 2 vCPUs prevent CPU bottlenecks during concurrent checkouts.

---

### D. Monthly SRE Maintenance & Support Retainer (₹3,000 / month or $36 / month)
A custom-tailored startup maintenance plan to ensure the platform stays online and secure without costing enterprise retainer fees:
1. **24/7 Endpoint Monitoring**: Auto-pingers to alert us if the app server goes offline.
2. **Backup Snapshot Health Checks**: Weekly verification of the database backup scheduler archives (verifying `.tar.gz` local backups).
3. **Emergency Patching**: Immediate application of security updates and NPM hotfixes to pass Gitleaks/Trivy CI/CD gates.
4. **Included Adjustments (2 hours/mo)**: Basic text adjustments, simple menu alterations, and logo changes.
5. **Support SLA**: Standard issue updates completed within 24 hours. Critical (P1) server-down issues addressed within 4 hours.

---

## 3. Project Deliverables Checklist

* [ ] Custom Vite/React SPA + Node.js API codebase pushed to GitHub.
* [ ] Hostinger/Hetzner KVM VPS Setup & Docker Deployment.
* [ ] Domain pointing DNS config (A records, SPF/DKIM for mail delivery).
* [ ] Automated database cron backup engine with local rotation retention.
* [ ] Admin, Receptionist, Kitchen, Scanner access controls.
* [ ] Completed handoff documentation (`README.md`, `DOCKER.md`, `ARCHITECTURE.md`).
