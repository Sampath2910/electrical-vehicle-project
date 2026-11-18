# 05 — Feature Walkthroughs

Each major feature traced through the real code, using the pattern from `01`:
**React page → store (`storeContext.tsx`) → `/api/...` route → `db.ts` → `db.json`.**

---

## 1. Login & roles

**Pages:** `src/app/auth/login/{user,operator,admin}/page.tsx`
**API:** `src/app/api/auth/login/route.ts`
**Logic:** `src/lib/auth.ts`, `src/lib/db.ts` (`getUserByIdentifier`)

1. User types email + password and submits.
2. The page `POST`s to `/api/auth/login`.
3. The route tries the Java backend first; if offline, it looks the user up in `db.json`.
4. It compares the password. (In the local DB this is a plain-text match — fine for a demo; the Java backend uses BCrypt. See the security note in `09`.)
5. On success it calls `signSessionToken(...)` → builds a signed token containing `userId`, `role`, `email`, expiry.
6. The token is stored in an **httpOnly cookie** `jwt_token` (24h).
7. The route replies with where to go (`/dashboard`, `/operator`, or `/admin`).

**Logout** (`/api/auth/logout`) simply clears that cookie.

**Role enforcement** happens on every later request: `middleware.ts` guards pages, and sensitive API routes re-check (`getSessionFromRequest`).

---

## 2. Browsing stations

**Pages:** `src/app/chargers/page.tsx`, `src/app/chargers/[id]/page.tsx`
**API:** `GET /api/stations` → `src/app/api/stations/route.ts` → `db.getChargers()`
**Data:** chargers array in `db.json` (seeded from `mockData.ts`).

The list page fetches all stations and lets you search/filter. `[id]` shows one station: price, connector, power rating, status, live metrics. Two seeded stations matter:
- `ch-101` — KLETECH Station 1 (standard).
- `ch-102` — KLETECH Station 2 (`isPriorityBay: true`, the VIP/emergency bay).

---

## 3. The charging session (the core flow)

### Starting
**Page:** `src/app/charging/start/page.tsx`
**Store:** `startChargingSession(...)` in `src/lib/storeContext.tsx`
**API:** `POST /api/user/state` with `action: "start_session"`
**DB:** `db.startSession(...)` in `src/lib/db.ts`

What the API route checks before allowing a start (`api/user/state/route.ts`):
- you are logged in,
- the charger exists,
- it is **not already** `CHARGING` (returns **409** if busy — prevents two people booking the same bay),
- it is not `FAULT`/`OFFLINE`/`MAINTENANCE`,
- the tariff rate is a sane number (`> 0` and `<= 200`).

On success, the session is saved and the charger's status flips to `CHARGING`.

### While charging
**Page:** `src/app/charging/[sessionId]/page.tsx`

The live screen shows voltage/current/power via `TelemetryGauge.tsx` and the animated `EvBikeChargingVisual.tsx`. Energy accumulates over time. If this is the **priority bay**, the eviction machinery in the store is armed (see feature 5).

### Stopping & billing
**Store:** `stopChargingSession(...)` in `storeContext.tsx`
**API:** `POST /api/user/state` with `action: "stop_session"`
**DB:** `db.stopSession(...)` in `db.ts` — **this is where the bill is calculated.**

The billing math (in `stopSession`):
```
energySubtotal  = energyKwh × tariffRate
serviceFee      = ₹5.00
taxableSubtotal = energySubtotal + serviceFee
gstTax          = taxableSubtotal × 18%
penaltyFee      = ₹500 if the eviction was ignored, else ₹0
finalTotal      = taxableSubtotal + gstTax + penaltyFee
```

`stopSession` also:
- **blocks stopping someone else's session** (only the owner or an ADMIN) → 403,
- **blocks double-billing** — if the session is already `COMPLETED`/`FAILED` it throws 409,
- frees the charger (`status → AVAILABLE`) and adds revenue/energy to the station totals,
- creates a **Bill** record,
- **auto-debits the wallet** if the balance covers the invoice, otherwise records a direct UPI settlement (keeping the wallet ledger consistent).

**Complete page:** `src/app/charging/[sessionId]/complete/page.tsx` shows the summary; the invoice lives at `/bills/[id]`.

---

## 4. Wallet & payments

**Page:** `src/app/wallet/page.tsx`
**Store:** `topUpWallet(amount)`
**API:** `POST /api/user/state` with `action: "topup_wallet"` → `db.topUpWallet(...)`

Top-ups are validated (`amount > 0` and `<= 100000`). Each top-up and each session debit is recorded as a `WalletTransaction` (`CREDIT`/`DEBIT`). QR/UPI payment is simulated via `QrScannerModal.tsx`.

---

## 5. Emergency preemption (the signature feature)

**Trigger (admin/operator):** `triggerEmergencyOverride()` in `storeContext.tsx`; backend equivalent `POST /api/v1/preemption/trigger`.
**State in store:** `isEvictionWarningActive`, `evictionCountdown` (starts at **120**), `penaltyApplied`.

Sequence:
1. An admin (or the physical ESP32 button) triggers an emergency on the VIP bay (`ch-102`).
2. The store sets `isEvictionWarningActive = true` and starts a **120-second countdown**.
3. The UI flashes red "VACATE IMMEDIATELY"; a buzzer/alarm sound plays (`playSound('alarm')`); on hardware the ESP32 beeps.
4. **If the driver yields** (`yieldEmergencyBay()`): the session stops cleanly, **no penalty**.
5. **If the countdown hits 0**: the session is force-stopped **with `penaltyApplies = true`**, so `stopSession` adds the **₹500 penalty** to the bill, and the ESP32 relay cuts power.

The driver pre-agreed to this when starting in the priority bay (the digital consent pop-up), which is why the penalty is enforceable.

---

## 6. Operator console

**Page:** `src/app/operator/page.tsx`
**API:** `GET /api/operator/stats?stationId=...`, and `PATCH /api/stations`

An operator sees and controls **only their assigned station** (`assignedStationId`). The `PATCH /api/stations` route enforces this: if an operator tries to modify a station that isn't theirs, it returns **403**, and operators cannot reassign operators at all.

---

## 7. Admin suite

**Pages:** everything under `src/app/admin/*` (guarded by `middleware.ts` to ADMIN only, except `/admin/live` which Operators can also view).
**API:** `GET /api/admin/stats`, `GET/POST /api/admin/users`, `POST /api/admin/reset`, `PATCH /api/stations`.

Admins can: view fleet-wide KPIs and analytics, manage all stations (status/price/operator), manage users and operators, edit tariffs (`/admin/tariffs` → store tariff functions → affects pricing), view sessions/payments/faults, and trigger emergencies. Every admin API route calls `getSessionFromRequest` and returns **403** to non-admins.

---

## 8. Live telemetry (IoT)

**Page:** `src/app/admin/live/page.tsx`; components `TelemetryGauge.tsx`, `ThingSpeakBench.tsx`, `EeeHardwareBench.tsx`.
**Source of data:** either the Java backend's WebSocket stream (fed by MQTT from the ESP32 / `iot/simulator/mqtt_simulator.js`), or ThingSpeak (via the `NEXT_PUBLIC_THINGSPEAK_*` env vars), or simulated values. It displays voltage (~230V), current (≤14.3A), power (≤3.3kW), power factor (~0.98), THD (~2.1%), and sag/swell status.

---

Next: `06 — Data Model` defines every field these flows read and write.
