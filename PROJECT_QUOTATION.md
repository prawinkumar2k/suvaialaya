# Project Cost Estimate & Quotation — Suvaialaya SaaS Platform

This document presents a comprehensive, transparent, and honest cost estimate for the **Suvaialaya Event & Restaurant Management SaaS Platform**. The pricing is split into **One-Time Development Costs**, **Ongoing Hosting & Third-Party API Operations**, and **Monthly SRE Maintenance Support**.

Estimates are provided in both **Indian Rupees (INR - ₹)** and **US Dollars (USD - $)** based on average industry rates for senior MERN stack developers, DevOps engineers, and SRE specialists.

---

## 1. Summary of Project Valuation

| Component | Cost (INR) | Cost (USD) | Frequency |
| :--- | :--- | :--- | :--- |
| **A. Software Development & Engineering** | **₹8,50,000** | **$10,200** | One-time |
| **B. Monthly Infrastructure & Third-Party SaaS** | **~₹10,500 / mo** | **~$125 / mo** | Monthly (Usage dependent) |
| **C. SRE & Code Maintenance Retainer** | **₹30,000 / mo** | **$360 / mo** | Monthly (Optional) |

---

## 2. Detailed Breakdown

### A. One-Time Software Development & Engineering Costs
This covers the complete implementation of the codebase, including 21 React frontend pages, a secure Node/Express backend, BullMQ distributed worker queues, Redis locking/caching, security hardening, and test coverage.

| Module | Description | Estimated Hours | Estimated Cost (INR) | Estimated Cost (USD) |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Architecture** | React 18 + Vite, Radix UI accessibility, Tailwind CSS styling, masonry layout grids, responsive charts (Recharts), and Cmd+K command palettes. | 90 hrs | ₹2,50,000 | $3,000 |
| **Backend & Databases** | Express REST endpoints, MongoDB schemas with transactions, dynamic slots/seats allocation, and BullMQ worker queue setups. | 90 hrs | ₹3,00,000 | $3,600 |
| **DevOps & CI/CD Setup** | Multi-container Docker Compose configs, Nginx reverse proxy with SSL, Prometheus metrics exporter, Grafana dashboards, and GitHub Actions pipelines. | 40 hrs | ₹1,50,000 | $1,800 |
| **Security & SRE Engine** | Rate limiters, Helmet headers, Sanitization, Memory Watchdogs, local database backup rotation, and Gitleaks/Trivy dependency scanning. | 30 hrs | ₹1,00,000 | $1,200 |
| **Testing & QA Auditing** | Vitest unit/integration testing (100% coverage verification) and Redis database connection failure chaos tests. | 20 hrs | ₹50,000 | $600 |
| **TOTAL** | | **270 hrs** | **₹8,50,000** | **$10,200** |

---

### B. Monthly Infrastructure & Third-Party SaaS Operational Costs
These are direct costs billed by cloud providers and APIs. The estimate assumes a production environment handling up to **5,000 active bookings** per month.

| Service | Recommended Tier / Provider | Purpose | Estimated Cost (INR) | Estimated Cost (USD) |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js App VPS** | Hetzner Cloud (CPX21) / DigitalOcean (2 vCPUs, 4GB RAM) | Hosts the Express backend API and frontend Vite server. | ~₹1,250 / mo | $15 / mo |
| **Database Server** | MongoDB Atlas (M10 Dedicated Tier) | Secure cloud database hosting with automated replica sets (required for transactions). | ~₹5,000 / mo | $60 / mo |
| **Redis Cache / Queue** | Self-hosted on App VPS or Managed Redis (DigitalOcean) | Queue management for BullMQ seat reservations and rate limiting. | ~₹1,250 / mo | $15 / mo |
| **Email Services** | Resend API (Creator Tier) | Transactional receipt emails, PDF tickets, and cancellations. | ~₹1,650 / mo | $20 / mo |
| **Backup Storage** | AWS S3 or Backblaze B2 | Retention storage for the compressed 6-hourly database dumps. | ~₹400 / mo | $5 / mo |
| **SMS/OTP Services** | Twilio or MSG91 (Pay-as-you-go) | Phone number validation and OTP verification during checkout. | ~₹950 / mo | $10 / mo |
| **Payment Gateway** | Razorpay (2.0% transaction fee) | Direct payment gateway handling. | 2.0% per transaction (deducted from payout) | 2.0% per transaction (deducted from payout) |
| **TOTAL (EST.)** | | | **~₹10,500 / mo** | **~$125 / mo** |

---

### C. Monthly SRE & Code Maintenance Support (Optional Retainer)
To ensure the system remains online, secure, and compatible with evolving cloud environments.

*   **Includes**:
    *   24/7 endpoint uptime monitoring.
    *   Applying security patches and keeping NPM packages updated (resolving new Trivy/pnpm vulnerabilities).
    *   Validating backup snapshots and restoring data in case of disaster.
    *   Addressing minor bugs or operational changes (e.g. text/menu shifts).
*   **Cost**: **₹30,000 / month ($360 / month)**.

---

## 3. Cost Control Recommendations

1.  **Start Self-Hosted**: In the beginning (MVP/soft launch phase), MongoDB and Redis can be run on the same VPS as the Node application using Docker Compose (using `docker-compose.yml` configured with local folders). This reduces the monthly infrastructure cost to **under ₹2,000 / $25 per month**.
2.  **Scale Database as Traffic Grows**: Upgrade to MongoDB Atlas Dedicated (M10+) only when daily booking volumes exceed 100 transactions, ensuring the hosting costs match business revenue.
3.  **Resend Free Tier**: Utilize Resend's free tier (up to 3,000 emails per month) in the initial phases, saving ₹1,650 / $20 per month.
