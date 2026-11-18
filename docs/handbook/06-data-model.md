# 06 — Data Model

This explains **what data the app stores** and its exact shape. The authoritative definitions are in `frontend/src/types/ev.ts`. The live data is in `frontend/data/db.json`.

## Where data lives

- **Shapes (TypeScript types):** `frontend/src/types/ev.ts` — change a structure here first.
- **Actual records (the "database"):** `frontend/data/db.json`.
- **Seed/defaults:** `INITIAL_DATA` in `frontend/src/lib/db.ts` and `frontend/src/lib/mockData.ts`.
- **Backend equivalents (Java entities):** `backend/src/main/java/com/smart/ev/domain/`.

## The database file (`db.json`) — top-level collections

```jsonc
{
  "users":              [ ... ],   // accounts (drivers, operators, admins)
  "chargers":           [ ... ],   // charging stations / bays
  "sessions":           [ ... ],   // charging sessions (active + past)
  "bills":              [ ... ],   // invoices generated when sessions end
  "wallets":            { userId: Wallet },      // one wallet per user
  "walletTransactions": [ ... ],   // credit/debit ledger
  "vehicles":           [ ... ]    // riders' bikes
}
```

## Core entities (fields that matter most)

### User
`id, name, email, phone, role('USER'|'OPERATOR'|'ADMIN'), createdAt`
Operators also have `assignedStationId` and `operatorBadgeId`. Drivers may have `vehicleModel`.
(In `db.json` a `passwordHash` field holds the password — plain text locally; BCrypt on the Java backend.)

### Charger (a station / bay)
`id, chargerCode, name, location, latitude, longitude, powerRating(kW), connectorType, status, pricePerKwh, maxCurrentA, voltageV, firmwareVersion`
Important flags:
- `status`: `AVAILABLE | PREPARING | CONNECTED | CHARGING | PAUSED | COMPLETED | FAULT | OFFLINE | MAINTENANCE`
- `isPriorityBay`: `true` for the VIP/emergency bay (subject to eviction + penalty).
- `stationType`: `PLUG_CHARGER` or `BATTERY_SWAP_STATION`.
- `assignedOperatorId` / `assignedOperatorName`: which operator runs it.
- `totalEarnedRevenue`, `totalEnergyConsumedKwh`: running totals per station.

### ChargingSession
`id, sessionCode, userId, chargerId, chargerName, startTime, endTime?, status, energyKwh, durationSeconds, tariffRate, estimatedCost, finalCost?`
Billing fields filled on stop: `serviceFee(₹5)`, `gstAmount(18%)`, `penaltyAmount(₹500?)`.
Status flow: `CREATED → AUTHORIZED → STARTED → CHARGING → STOPPING → COMPLETED` (or `FAILED/CANCELLED`).
Flags: `isPriorityBay`, `evictionTriggered`, `paymentStatus`.

### Bill (invoice)
`id, billNumber, sessionId, userId, chargerName, energyKwh, tariffRate, subtotal, serviceFee, tax, penaltyAmount?, totalAmount, todSlotActive, status('UNPAID'|'PAID'|...), issuedAt, paidAt?`
Also logs `maxCurrentA` and `avgVoltageV` as a power-quality audit (spec Section 6).

### Tariff (pricing rule)
`id, name, slotCode('S_1'|'S_2'|'S_3'|'S_VIP'), slotName, timeWindow, pricePerKwh, status('ACTIVE'|'INACTIVE'), conditions?`
`conditions` are special overrides (`TariffCondition`): holiday/festival/weekend price adjustments with a date range and an `adjustedPricePerKwh`.

### Wallet & WalletTransaction
`Wallet: { id, userId, balance, currency, updatedAt }`
`WalletTransaction: { id, walletId, type('CREDIT'|'DEBIT'|'REFUND'|'ADJUSTMENT'), amount, reference, description, sessionId?, createdAt }`

### Vehicle
`id, userId, model, registration, connectorType, batteryCapacityKwh, vehicleType?('MOTORCYCLE'|'SCOOTER'|'DELIVERY_BIKE'), ridingRangeKm?, isBatterySwappable?, ridingModes?, imageUrl?`

### Measurement (one telemetry sample)
`voltageV(~230), currentA(≤14.3), powerW(≤3300), energyKwh, frequencyHz, powerFactor(~0.98), thdPercent(~2.1), voltageSagSwellStatus('NORMAL'|'SAG'|'SWELL'), todSlotActive, todRate`

### Others
- **Fault** — hardware problems: `faultCode, faultType('CRITICAL'|'WARNING'|'INFO'), severity, message, status`.
- **Payment** — a payment attempt (`method: 'QR_UPI'`, `provider: 'MOCK_UPI'|...`, `status`).
- **NotificationItem** — in-app alerts (`CHARGING_COMPLETED`, `PAYMENT_SUCCESS`, `EMERGENCY_PREEMPTION`, …).
- **RfidCard** — marked deprecated in the types but kept for compatibility.

## The pricing tiers (`tariffHelper.ts`)

`KW_TARIFF_TIERS` maps charging power to a base price:

| kW | Label | ₹/kWh |
|----|-------|-------|
| 1 | Slow Eco AC | 8.00 |
| 3.3 | Standard 2W AC | 10.50 |
| 7 | Fast Commercial AC | 14.00 |
| 12 | Rapid Booster AC | 18.50 |

`getTariffForKw(kw)` returns the right price (exact match, else by range).

## The billing formula (authoritative, from `db.ts` → `stopSession`)

```
energySubtotal  = round(energyKwh × tariffRate, 2)
serviceFee      = 5.00
taxableSubtotal = energySubtotal + serviceFee
gstTax          = round(taxableSubtotal × 0.18, 2)
penaltyFee      = 500.00  if eviction ignored, else 0
TOTAL           = taxableSubtotal + gstTax + penaltyFee
```

## How to change the data model safely

1. Edit the type in `frontend/src/types/ev.ts`.
2. Update any code that reads/writes that field (search the codebase for the field name).
3. Update seed data in `frontend/src/lib/mockData.ts` and/or `INITIAL_DATA` in `db.ts`.
4. If records already exist in `db.json`, either add the new field there too or give it a safe default in code.
5. (If using the Java backend) mirror the change in the matching `backend/.../domain/` entity.

Next: `07 — Change Cookbook` gives copy-paste recipes for the most common change requests.
