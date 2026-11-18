# 00 — Project Overview

## What is this project?

The **Smart EV Charging Platform** is a web application (plus optional backend server and IoT hardware firmware) for charging **electric two-wheelers** — electric scooters and bikes such as the Ather 450X, Ola S1 Pro, TVS iQube, and Ultraviolette F77.

Think of it like a "Paytm + fuel station dashboard" but for electric bikes. A rider can:
- find a charging station,
- plug in and **start a charging session**,
- watch **live electrical readings** (voltage, current, power) while charging,
- **stop** and receive a detailed **bill** (energy used × price + fees + tax),
- pay from a **wallet** or by **UPI/QR**.

Meanwhile the people who run the stations get dashboards to monitor everything.

## The real-world problem it solves

Electricity is cheaper at night and more expensive in the evening (when everyone gets home and demand peaks). This project implements **Time-of-Day (ToD) tariffs** — the price per unit of energy changes depending on the time:

| Time window | Tier name | Price | Why |
|-------------|-----------|-------|-----|
| 10:00 PM – 06:00 AM | Off-Peak (`S_1`) | ₹8.00 / kWh | Cheapest — encourages overnight charging |
| 06:00 AM – 06:00 PM | Standard (`S_2`) | ₹10.50 / kWh | Normal daytime rate |
| 06:00 PM – 10:00 PM | Peak (`S_3`) | ₹14.00 / kWh | Most expensive — evening demand peak |

It also solves a **safety/priority problem**: one bay is reserved as a **VIP / Emergency bay**. If an ambulance or fire engine needs it, an admin can trigger an **Emergency Preemption** — the parked vehicle gets a **120-second countdown** to leave, with alarms and a flashing red UI. If they don't leave, power is cut and a **₹500 penalty** is added to their bill. (The driver agreed to this when they started charging in that bay.)

## The three user roles

The whole app is organised around **who you are logged in as**. This is the single most important concept to understand.

| Role | Who they are | What they can do | Where they land after login |
|------|--------------|------------------|------------------------------|
| **USER** (Driver) | A person charging their bike | Browse stations, charge, pay, see their own bills/history/wallet | `/dashboard` |
| **OPERATOR** | A staff member running **one** station | Monitor and manage **only their assigned station** | `/operator` |
| **ADMIN** | The fleet manager | Everything: all stations, all users, set tariffs, trigger emergencies, view analytics | `/admin` |

The app **enforces** these boundaries. For example, a Driver who tries to open an Admin page is redirected away, and a Driver who tries to call an Admin data endpoint gets a "403 Forbidden" error. (How this is enforced is explained in `01 — Architecture` and `05 — Feature Walkthroughs`.)

## What's in the box (high level)

```
ev- project/
├── frontend/     ← The website (Next.js). THIS is what runs in the demo.
├── backend/      ← Optional Java (Spring Boot) server.
├── iot/          ← Firmware + simulators for the ESP32 charging hardware.
├── docs/         ← Documentation, including this handbook.
└── README.md, *.pdf, *.png  ← Project spec, blueprint, diagrams.
```

A detailed file-by-file breakdown is in `04 — Codebase Map`.

## Key domain terms (quick version)

- **kWh (kilowatt-hour)** — the unit of energy you are billed for. Like "litres of petrol" but for electricity.
- **Tariff** — the price rules (how much per kWh, and when).
- **Session** — one charging event, from "start" to "stop".
- **Bill / Invoice** — the itemised receipt generated when a session ends.
- **Telemetry** — live measurements streaming from the hardware (voltage, current, power).
- **Preemption / Eviction** — the emergency "please vacate the VIP bay" procedure.
- **PZEM-004T** — the real sensor chip that measures voltage/current/power.
- **ESP32** — the small microcontroller ("brain") on the charging hardware.

A fuller glossary is in `09 — Glossary & Viva Q&A`.

## What to read next

- To understand **how the pieces connect**, read `01 — Architecture`.
- To understand **the technologies**, read `02 — Tech Stack`.
