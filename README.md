# Smart EV Charging Station: Time-of-Day Tariff & Priority Preemption System

An engineering prototype and IoT power quality telemetry platform specialized for **Electric Two-Wheelers (1 kW to 3.3 kW single-phase AC)**, featuring **Commercial LT-6 Time-of-Day (ToD) tariffs**, **Priority Preemption Emergency Eviction Protocol**, **PZEM-004T AC metrology**, and **Dynamic QR / Online UPI Payments**.

---

## ⚡ Architecture Overview

```
ESP32 DevKit Single-Phase Metrology Engine
  ├── GPIO 26: 5V Relay Contactor (Autonomous Cutoff >253V AC & 120s Eviction Trip)
  ├── UART2 (TX 17 / RX 16): PZEM-004T Multi-Function AC Sensor (V, I ≤14.3A, kW, PF 0.98, THD 2.1%)
  ├── GPIO 27: Active Buzzer Module (Rapid beeping during 120-second emergency preemption eviction)
  ├── GPIO 4: Physical Emergency Override Trigger (Ambulance / Fire Brigade arrival interrupt)
  └── Dynamic Bharat-QR & UPI Gateway (Google Pay, PhonePe, Paytm, BHIM UPI)
        ↓ (MQTT 1Hz Telemetry: ev/chargers/{id}/telemetry)
Spring Boot 3 Backend Server & Redis Live Cache
        ↓ (WebSockets / STOMP Stream)
Next.js Frontend Web Application & EEE Hardware Test Bench
```

---

## 📋 Comprehensive System Specifications & Parameters (PDF Conformance)

### 1. Time-of-Day (ToD) Tariff Structure (Commercial LT-6 Retail Markup)
- **Normal / Off-Peak (10:00 PM to 06:00 AM)**: **₹8.00 per kWh** (`S_1`) — Cheapest tier to encourage overnight charging when grid demand is lowest.
- **Mid / Standard (06:00 AM to 06:00 PM)**: **₹10.50 per kWh** (`S_2`) — Daytime rate covering solar-generation hours and standard grid load.
- **Peak (06:00 PM to 10:00 PM)**: **₹14.00 per kWh** (`S_3`) — Heavy surcharge applied during evening domestic peak grid load.

### 2. Reserved "Emergency / VIP" Bay #02 (Priority Preemption Protocol)
- **Surge Rate**: Current ToD Rate + **₹8.00/kWh Premium** (e.g., Standard hours = ₹18.50/kWh).
- **Digital Consent**: Mandatory pop-up agreement before charging begins acknowledging a **₹500 penalty** if failing to yield to an emergency vehicle.
- **Emergency Override Trigger**: Digital trigger on Admin Dashboard and physical button on hardware test bench.
- **120-Second Eviction Sequence**: Active buzzer beeps rapidly, UI flashes red "VACATE IMMEDIATELY", and 120-second countdown runs.
- **Auto-Cutoff & Penalty**: If not unplugged within 120 seconds, the ESP32 automatically trips the 5V relay, cuts power, and adds **₹500.00 penalty** to the final invoice.

### 3. Dashboard Scope & Hardware Alignment
- **Power & Current Limit**: Restricted strictly to 2-wheelers at **maximum 14.3 Amps at 230V** (eliminating 7.18 kW / 31.4 A 4-wheeler values).
- **Vehicle Presets**: Indian 2-wheelers: Ather 450X (3.7 kWh), Ola S1 Pro (4.0 kWh), TVS iQube (3.4 kWh), Ultraviolette F77 (10.3 kWh).
- **Connector Standards**: IEC 60309 (Industrial 3-pin), Standard 16A Socket, and LEV AC (IS 17017).
- **Hardware Bay Labeling**: "KLETECH EV Station 1 (3.3kW 2W AC - Reserved)" and "KLETECH EV Station 2 (Priority Reserved VIP / Emergency Bay)".
- **Power Quality Metrics**: Total Harmonic Distortion (**THD: 2.1%**, IEEE-519 compliant < 5%), Power Factor (0.98), and Voltage Sag (<207V) / Swell (>253V) logging.

### 4. Charging kW Setpoints (Slow vs. Fast Charging)
- **Slow/Standard Charging**: 0.5 kW to 1.5 kW (5A to 10A draw, takes 4–6 hours).
- **Fast Charging**: 2.0 kW to 3.3 kW (Maximum 15A draw on single-phase 230V, takes 1–2 hours).

### 5. Official State Discom EV Tariff Benchmarks (2025/2026)
- **Karnataka (BESCOM)**: LT-6 category flat rate of ₹4.50 to ₹5.50 per unit.
- **Delhi (DERC)**: ~₹4.50 per unit (LT).
- **Maharashtra (MSEDCL)**: ~₹6.08 per unit (LT).
- **Tamil Nadu (TANGEDCO)**: Mandatory ToD tariffs ranging from ₹6.00 to ₹9.00 per unit.

### 6. Billing Formula & Data Logging Structure
- **Formula**:
  $$\text{Total Billed Amount} = (\text{Energy kWh Delivered} \times \text{ToD Rate}) + \text{Service Fee (₹5.00)} + 18\% \text{ GST} (+ \text{₹500 Penalty if applicable})$$
- **Audited Parameters Logged Per Session**:
  - `Session_ID`: Unique alphanumeric identifier.
  - `Start_Time & End_Time`: Verified session timestamps.
  - `Energy_Delivered_kWh`: Sampled continuously via PZEM-004T sensor.
  - `Max_Current_A & Avg_Voltage_V`: Proves power quality stability throughout session.
  - `ToD_Slot_Active`: Identifies tariff block used (`S_1`, `S_2`, `S_3`, `S_VIP`).
  - `Final_Billed_Amount_INR`: Total amount paid via Dynamic QR / UPI.

---

## 🚀 Quick Start Guide

### Frontend Development (Next.js 16)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```
EV -Project/
├── frontend/             # Next.js 16 App Router, TypeScript, Tailwind CSS, Recharts
│   ├── src/app/          # Pages: /charging, /chargers, /admin, /bills, /history, /vehicles
│   ├── src/components/   # EeeHardwareBench, VivaDemoDock, EvBikeChargingVisual, RangeCalculator
│   ├── src/lib/          # storeContext, providers, mockData
│   └── src/types/ev.ts   # Metrology, ToD slots, Indian 2W connectors, Section 6 types
├── backend/              # Spring Boot 3, Java 17, JPA Entities, WebSockets, MQTT Paho
├── iot/firmware/         # Arduino ESP32 firmware with PZEM-004T UART2 and relay cutoff
└── SMART_EV_PROJECT_AGENT_SPEC.md
```


