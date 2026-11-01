# Comprehensive Test Plan & Matrix (TEST_PLAN.md)

**Project:** Smart EV Charging Platform (2-Wheeler Fleet & Battery Swapping Network)  
**Execution Environment:** Windows Shell, Node.js v20, Java 17, Chrome/Edge Browser Automation  

---

## 1. Test Strategy & Scope
The test suite validates:
1. **Frontend Presentation & Routes (Next.js 16 App Router):** Server & client component rendering, route protection middleware, and responsive layout across 7 viewports.
2. **Backend API & Microservices (Spring Boot 3.2.4):** Authentication endpoints, Station REST operations, Metrology WebSockets, ToD tariff calculations, and Admin/Operator stats.
3. **Database Operations (Spring Data JPA):** Entity persistence, relational constraints, and transaction isolation.
4. **Hardware Simulation & Safety Protocols (PZEM-004T / ESP32):** Priority Preemption (120s countdown, ₹500 penalty), voltage sag/swell monitoring, and relay tripping.
5. **Billing & Invoicing (Section 6 Metrology):** Precise formula execution: $(\text{Energy} \times \text{ToD Rate}) + \text{Service Fee} + 18\%\text{ GST}$.

---

## 2. Test Scenarios & Execution Matrix

| Test ID | Category | Scenario / Action | Preconditions | Inputs | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Auth | Driver Login | User exists in DB | `alex.rivera@example.com` / `password123` | JWT cookie issued, redirects to `/dashboard` | Authenticated successfully | **PASS** |
| **TC-AUTH-02** | Auth | Operator Login | Operator exists in DB | `operator1@kletech.ac.in` / `operator123` | Redirects to `/operator` console | Authenticated with station scope | **PASS** |
| **TC-AUTH-03** | Auth | Admin Login | Admin exists in DB | `admin@smartev.com` / `admin123` | Redirects to `/admin` fleet tower | Authenticated with fleet scope | **PASS** |
| **TC-AUTH-04** | Auth | Invalid Credentials | Any portal | `admin@smartev.com` / `wrongpass` | 401 Unauthorized, displays error | Error alert shown | **PASS** |
| **TC-ADM-01** | Admin | Operators Page Render | Logged in as Admin | GET `/admin/operators` | Displays 2 registered operators | Ramesh Kumar & Pooja Patil shown | **PASS** |
| **TC-ADM-02** | Admin | Reassign Operator | Logged in as Admin | Station: BSS Hub, Op: Pooja Patil | PATCH `/api/stations` updates custody | Custody transferred, banner shown | **PASS** |
| **TC-ADM-03** | Admin | Fleet KPIs & Matrix | Logged in as Admin | GET `/admin` | Displays total revenue ₹12,490, 5 stations | Revenue & matrix table verified | **PASS** |
| **TC-ADM-04** | Admin | Live Telemetry Stream | Logged in as Admin | GET `/admin/live` | Real-time charts for V, I, THD | Gauges & IEEE-519 limits render | **PASS** |
| **TC-OP-01** | Operator | Scoped Station View | Logged in as Operator 1 | GET `/operator` | Restricted to KLETECH Station 1 | Displays assigned station only | **PASS** |
| **TC-OP-02** | Operator | Cross-Station Access | Logged in as Operator 1 | Navigate to `/chargers/ch-102` | Access Restricted banner | Blocked with return link | **PASS** |
| **TC-OP-03** | Operator | Power Rating Override | Logged in as Operator 1 | Select rating: 7 kW | Updates power ceiling | Power rating updated to 7 kW | **PASS** |
| **TC-RIDE-01** | Rider | Start Session (Dynamic QR) | Logged in as Driver | Scan KLETECH Station 1 QR | Session initialized, relay latched | Session started successfully | **PASS** |
| **TC-RIDE-02** | Rider | Priority Bay Consent | Logged in as Driver | Select Bay #02 (VIP Priority) | Mandatory consent dialog shown | Consent required to proceed | **PASS** |
| **TC-RIDE-03** | Rider | 120s Eviction Sequence | Active session at Bay #02 | Trigger Emergency Override | Active buzzer, 120s countdown | Countdown fires, penalty applies | **PASS** |
| **TC-RIDE-04** | Rider | Digital Invoice Settlement | Completed session | Stop session | (Energy × ToD) + Fee + 18% GST | Accurate digital bill generated | **PASS** |
| **TC-RIDE-05** | Rider | Wallet Top-Up via UPI | Logged in as Driver | Amount: ₹500 | Wallet balance increased | Balance updated & logged | **PASS** |
| **TC-HARD-01** | Hardware | PZEM-004T Metrology | Telemetry provider running | 1Hz tick | Voltage 230V, Current ≤14.3A | Values within Indian 2W limits | **PASS** |
| **TC-HARD-02** | Hardware | Voltage Sag/Swell Guard | Live stream | Voltage >253V AC | Relay cutoff triggered | Safety alert & trip simulated | **PASS** |
| **TC-OP-04** | Operator | In-Page Operator Register | Logged in as Admin | Click `+ Register New Operator`, fill form | In-page modal saves operator without logout | Operator saved, table updated | **PASS** |
| **TC-OP-05** | Operator | Confirm Station Custody | Logged in as Admin | Select bay & operator, submit | Updates station custody in DB & UI | Custody transferred, success toast | **PASS** |
| **TC-ADM-05** | Admin | Rupee Vector Icon Render | Logged in as Admin | View Total Fleet Revenue card | Displays official `₹` vector icon | Clean `₹` icon verified | **PASS** |
| **TC-AUTH-05** | Auth | Offline Local DB Login | Backend port 8080 offline | `admin@smartev.com` / `admin123` | Authenticates via local DB fallback | Login successful, cookie set | **PASS** |

---

## 3. Boundary & Edge Case Testing

1. **Station Power Ceiling Boundary:**
   - 2-Wheeler ceiling is 3.3 kW single-phase AC (14.3A at 230V). Verified that ratings outside 1 kW – 12 kW are clamped.
2. **Time-of-Day Tariff Boundaries:**
   - S_1 (Off-Peak): 10:00 PM – 06:00 AM (₹8.00/kWh)
   - S_2 (Standard): 06:00 AM – 06:00 PM (₹10.50/kWh)
   - S_3 (Peak): 06:00 PM – 10:00 PM (₹14.00/kWh)
   - Verified automated slot transition logic in `getCurrentToDSlot()`.
3. **Emergency Preemption Penalty Boundary:**
   - If user unplugs within 120 seconds: ₹0 penalty.
   - If countdown reaches 0: ESP32 trips relay and applies ₹500 fine to session total. Verified in `storeContext.tsx`.

---

## 4. Limitations & Excluded Tests
- **Physical Relay Switching:** Tested via software simulation and Web Audio synth haptics. Physical 5V optocoupled relays require connected ESP32 hardware via serial USB/UART.
- **Production Payment Gateways:** Real UPI transactions (Razorpay / Cashfree) were tested in digital sandbox mode; production merchant keys require corporate bank registration.
