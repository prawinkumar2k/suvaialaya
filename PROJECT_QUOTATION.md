# Startup-Friendly Cost Estimate & Quotation — Suvaialaya SaaS Platform

This document presents a highly optimized, startup-friendly cost estimate for the **Suvaialaya Event & Restaurant Management SaaS Platform**. The pricing is tailored for an early-stage launch, minimizing both the initial software engineering fees and ongoing hosting costs to keep run rates as close to zero as possible.

Estimates are provided in both **Indian Rupees (INR - ₹)** and **US Dollars (USD - $)**.

---

## 1. Summary of Startup Valuation

| Component | Cost (INR) | Cost (USD) | Frequency / Description |
| :--- | :--- | :--- | :--- |
| **A. Software Development & Engineering** | **₹1,80,000** | **$2,160** | One-time startup rate |
| **B. Monthly Infrastructure & APIs (MVP)** | **~₹500 / mo** | **~$6 / mo** | Pay-as-you-go (extremely lean hosting) |
| **C. Maintenance & Support** | **₹0** | **$0** | Handled on-demand (no recurring retainer) |

---

## 2. Detailed Breakdown (Startup Tier)

### A. One-Time Software Development & Engineering Costs
Calculated using aggressive freelance/startup rates (approx. ₹600 - ₹800 / hour or $8 - $10 / hour) for the same robust feature set.

| Module | Description | Estimated Cost (INR) | Estimated Cost (USD) |
| :--- | :--- | :--- | :--- |
| **Frontend UI/UX** | React 18 + Vite dashboard panels, responsive ticket explorer, slot selectors, and checkout flows. | ₹60,000 | $720 |
| **Backend & Databases** | Express API logic, MongoDB/Mongoose data models, BullMQ task workers, and seat allocation rules. | ₹80,000 | $960 |
| **DevOps & Security Hardening** | Docker local containerization, Nginx routing, and rate limiters. | ₹40,000 | $480 |
| **TOTAL** | | **₹1,80,000** | **$2,160** |

---

### B. Monthly Infrastructure & SaaS API Costs (Lean MVP Setup)
To keep hosting costs down, the entire stack (Node.js application + MongoDB database + Redis queues) is self-hosted on a single virtual private server.

| Service | Provider / Plan | Monthly Cost (INR) | Monthly Cost (USD) | How it stays cheap |
| :--- | :--- | :--- | :--- | :--- |
| **Virtual Private Server (VPS)** | Hetzner Cloud (CX22) or DigitalOcean ($6 Droplet) | ~₹500 / mo | $6 / mo | Runs the app, MongoDB, and Redis inside docker-compose. |
| **Database & Cache** | Self-hosted inside Docker containers | ₹0 / mo | $0 / mo | Runs locally on the VPS, avoiding expensive Atlas/Redis cloud subscription tiers. |
| **Emails & Tickets** | Resend API (Free Tier) | ₹0 / mo | $0 / mo | Free up to 3,000 emails per month. |
| **SMS & OTP** | MSG91 / Twilio | Pay-as-you-go | Pay-as-you-go | Billed per SMS (approx. ₹0.20 per SMS). |
| **Backups** | Local backup rotation synced to GDrive/OneDrive | ₹0 / mo | $0 / mo | Automates local backups and uploads them to a free-tier cloud drive. |
| **Payment Gateway** | Razorpay Standard Plan | 2.0% transaction fee | 2.0% transaction fee | No fixed monthly fees. Pay only when you make a sale. |
| **TOTAL (EST.)** | | **~₹500 / mo** | **~$6 / mo** | **Absolute minimum operational burn rate.** |

---

## 3. Maintenance Support Plan
Instead of paying a monthly retainer (which eats up startup capital), we recommend a pay-as-you-go support model:
*   **Monthly Retainer**: **₹0 ($0)**.
*   **On-Demand Bug Fixes & Feature Additions**: Billed hourly at a startup rate of **₹750 / hour ($10 / hour)** only when updates are requested.
