# Project Cost Proposal & Agreement — Suvaialaya SaaS Platform
**Prepared for:** Executive Review & Project Stakeholders  
**Document Reference:** SUVA-PROP-2026-V1.2  
**Status:** Approved for Commercial Review  

---

## Executive Summary
This document presents the formal project proposal, scope of work, technical architecture, cost breakdown, and maintenance agreement for the **Suvaialaya Event & Restaurant Booking SaaS Platform**. 

The platform is designed to handle high-concurrency ticket reservations, slot allocations, real-time kitchen queues, check-in validation scanners, and admin reporting dashboards. The architecture leverages modern, high-performance, containerized services optimized to run efficiently on single-host virtual servers to minimize operational overhead.

---

## 1. Consolidated Project Pricing

The project pricing is structured to support startup scalability, minimizing initial capital expenditures (CapEx) and monthly operating costs (OpEx).

| Pricing Item | Cost (INR - ₹) | Billing Frequency / Nature |
| :--- | :--- | :--- |
| **A. One-Time Software Engineering & Setup** | **₹1,80,000** | One-time fee (Billed in 2 Milestones) |
| **B. Domain Registration (`.in` / `.com`)**| **₹600** | Annual Renewal (Paid directly to registrar) |
| **C. Server VPS Hosting (2 vCPU, 8GB RAM)** | **~₹779 / month** | Monthly (Paid directly to VPS host) |
| **D. Platform SRE Maintenance Retainer** | **₹3,00,0 / month** | Monthly Subscription Retainer |

---

## 2. Business Justification: Market Rate Comparison

To ensure transparency, the proposed startup rates are compared below against standard software engineering and system administrator industry rates in India:

| Component / Phase | Proposed Startup Fee | Standard Freelancer Market Rate | Professional Agency Rate | Startup Savings |
| :--- | :--- | :--- | :--- | :--- |
| **One-Time Engineering** | **₹1,80,000** | ₹3,50,000 - ₹5,00,000 | ₹6,00,000 - ₹10,00,000 | **Over 60% Savings** |
| **Monthly Hosting** | **~₹779 / month** | ₹4,500 - ₹8,000 / month | ₹8,000 - ₹12,000 / month | **Over 85% Savings** |
| **Monthly Maintenance**| **₹3,000 / month** | ₹10,000 - ₹15,000 / month | ₹20,000 - ₹30,000 / month | **Over 70% Savings** |

### Why this proposal is highly cost-effective:
1. **Strategic Architectural Optimization (Self-Hosting)**: Standard development setups rely on paid managed databases (like MongoDB Atlas) and cloud queue instances (like Redis Cloud) which scale monthly bills to ₹8,000+. By packaging MongoDB and Redis into a containerized Docker architecture, the entire platform runs securely on a single ₹779/mo virtual private server (VPS).
2. **Integrated Security & Backup Tools**: Rather than paying for third-party security audit software or offsite backup SaaS providers, the platform uses integrated, automated open-source workflows (Trivy, Gitleaks, Nginx Certbot SSL, and local gzip backup rotations) costing ₹0/mo.
3. **Fair Engineering Rate**: The one-time fee is based on **270 hours** of senior development and deployment configuration. This equates to an effective rate of **₹666 per hour**, which is highly competitive for enterprise-grade MERN stack engineering.

---

## 3. Comprehensive Project Deliverables

The development scope includes the deployment and validation of the following modular systems:

### A. Customer-Facing Web Client (React 18 SPA + Vite)
1. **Interactive Showcase Pages (`Index.tsx`, `Menu.tsx`, `Gallery.tsx`)**: High-performance responsive layouts displaying food menus, photo galleries, and ticket reservation status.
2. **Seat & Slot Reservation Flow (`SlotSelection.tsx`, `BookingForm.tsx`)**: Automated checkout interface validating capacity and user inputs using Zod schemas.
3. **SMS/OTP Verification Screen (`VerifyOTP.tsx`)**: Secure verification flow to validate customer contact numbers before payment completion.
4. **Client Dashboard (`UserDashboard.tsx`)**: Profile portal showing reservation history, download pathways for PDF tickets, and booking cancellation buttons.

### B. Role-Based Operations Control Panels (RBAC)
* **Admin Dashboard**: Full sales analytics charts (revenue, guest counts), capacity configuration panels, system activity auditing logs, and emergency feature flag switches.
* **Receptionist Portal**: Real-time guest ledger, status switches, and receptionist check-in overrides.
* **Kitchen Order Queue**: Direct order grid highlighting spice levels, dietary preferences, and guest count summaries.
* **Camera Ticket Scanner**: Browser-native QR code validator that checks tickets and validates check-in at the door.

---

## 4. Payment Milestones (One-Time Engineering Fee)

* **Milestone 1 (50% Advance - ₹90,000)**: Project initiation, database schema setup, backend API development, and frontend page layouts.
* **Milestone 2 (50% Upon Delivery - ₹90,000)**: Completion of integration tests, Docker container setup, domain setup, payment gateway verification, and deployment handoff.

---

## 5. Maintenance Service Level Agreement (SLA)

The monthly support fee of **₹3,000 / month** ensures the platform remains operational, secure, and up to date:
* **Uptime Monitoring**: 24/7 automated ping tests to notify developers if the application server is offline.
* **Backup Management**: Weekly checks on local database backups and rotation configurations.
* **Dependency Upkeep**: Automatic resolution of newly detected NPM vulnerabilities to protect client databases.
* **Edits Allowance**: Includes up to 2 hours of active configuration updates (e.g. changing menu items, adjusting booking rules, updating logo details) per month.
* **Incident Response**: Critical (P1) issues investigated within 4 hours; standard updates resolved within 24-48 hours.
