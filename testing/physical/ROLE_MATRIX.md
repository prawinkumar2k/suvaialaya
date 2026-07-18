# 🧑‍🤝‍🧑 Physical Test Matrix (UAT)

This matrix contains the exact step-by-step physical verification protocols for all human operators in the Suvaialaya ecosystem. 
Do not deploy to production until **every single checkbox** across all roles is marked green.

---

## 1. 👑 The Owner / Admin Role
**Objective:** Verify supreme control over the platform, financials, and event life-cycles.

- [ ] **Event Creation:** Can create a new event, assign slots, capacity, and dynamic pricing.
- [ ] **Dashboard Analytics:** The dashboard accurately reflects real-time bookings, revenue, and waitlist numbers.
- [ ] **Manual Overrides:** Can manually block out slots (e.g., for VIPs) and immediately see the capacity drop.
- [ ] **Refund Execution:** Can manually initiate a Razorpay refund via the Admin panel and verify the webhook hits.
- [ ] **Tenant Management:** Can switch between different sub-tenants/venues without data leakage.

## 2. 👨‍🍳 The Kitchen / Operations Role
**Objective:** Verify that the kitchen receives accurate, real-time prep data to minimize food waste and delays.

- [ ] **Live Guest Count:** The kitchen dashboard displays the exact number of confirmed guests arriving in the next 2 hours.
- [ ] **Dietary Restrictions:** (If applicable) Special requests passed from the booking form appear immediately on the prep screen.
- [ ] **No-Show Impact:** When a user is marked "No-Show" by Reception, the kitchen count automatically decrements.

## 3. 💁 The Reception / QR Scanner Role
**Objective:** Verify hyper-fast, frictionless entry for guests at the physical venue.

- [ ] **QR Scanning (Fast Path):** Scanning a valid QR code instantly marks the ticket as "Redeemed" within < 1 second.
- [ ] **Double-Scan Prevention:** Scanning the same QR code a second time triggers an immediate loud/red visual warning: "ALREADY REDEEMED".
- [ ] **Offline Resilience:** If the Wi-Fi drops, the scanner app caches offline scans and syncs them without loss when reconnected.
- [ ] **Manual Lookup:** Reception can manually search a guest by phone number or name if they lost their QR code.
- [ ] **Walk-in Handling:** Reception can quickly process a physical walk-in, bypass the payment gateway, and deduct capacity from the database.

## 4. 🛒 The Customer Role
**Objective:** Verify the friction, speed, and safety of the external user journey.

- [ ] **Frictionless Booking:** User can select a slot, fill out details, and reach Razorpay in under 30 seconds.
- [ ] **Waitlist Trigger:** User attempting to book a full slot is correctly waitlisted with an accurate "Position in Queue".
- [ ] **Concurrency Race:** If two users try to book the last remaining seat at the exact same millisecond, only one gets it (Redis Lock verification).
- [ ] **Payment Failure:** If a user cancels Razorpay halfway, the seat lock releases within the 10-minute TTL.
- [ ] **Ticket Delivery:** User receives the beautiful PDF ticket and QR code via email/WhatsApp immediately after successful payment.
- [ ] **Self-Service Cancellation:** User can cancel their booking 24 hours prior and instantly see the Razorpay refund triggered.

## 5. 💰 The Finance / Audit Role
**Objective:** Verify that every cent is tracked, and no reconciliation nightmare occurs.

- [ ] **Idempotency Check:** Verify that double-clicking "Pay" does not result in double-charges.
- [ ] **Reconciliation:** The `totalAmount` in MongoDB perfectly matches the Razorpay dashboard payout.
- [ ] **Tax & Fees:** Ensure convenience fees and GST are calculated correctly on the UI and passed to Razorpay.

---

### Execution Instructions
To execute this physical matrix:
1. Setup a controlled physical environment (3 phones, 2 laptops).
2. Assign roles to team members.
3. Run the scenarios exactly as written above.
4. If an unexpected behavior occurs, **STOP THE TEST**, document the issue, fix it, and restart the role test from the beginning.
