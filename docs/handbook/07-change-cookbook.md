# 07 — Change Cookbook ("If asked to change X, do Y")

This is the practical part. Each recipe says **what to edit, where, and what to check afterwards.** Paths are from the project root.

> **Golden rules before any change**
> 1. Make sure the app runs first (`cd frontend && npm run dev`).
> 2. Change one thing at a time.
> 3. After editing: `npx tsc --noEmit` (no type errors) and refresh the browser.
> 4. Commit working states with git so you can undo (`git add -A && git commit -m "..."`).
> 5. The `@/` in imports means `frontend/src/`.

---

## A. Change the prices / tariffs

**Request example:** "Make peak rate ₹16 instead of ₹14."

There are up to three places prices appear — update all that apply:

1. **The kW tier table** — `frontend/src/lib/tariffHelper.ts` → edit `pricePerKwh` in `KW_TARIFF_TIERS` and/or the fallback numbers in `getTariffForKw`.
2. **The seeded tariff records** — `frontend/src/lib/mockData.ts` → find the `mockTariffs` entries (`S_1/S_2/S_3/S_VIP`) and edit `pricePerKwh`.
3. **A station's own price** — `frontend/src/lib/mockData.ts` (`mockChargers`) and/or directly in `frontend/data/db.json` → `pricePerKwh` on the charger. Admins can also change this live at `/admin/tariffs` and `/admin/chargers` with no code change.

**Check:** reload `/admin/tariffs` and start a session — the bill should use the new rate.

---

## B. Change the service fee, GST, or the ₹500 penalty

**Request example:** "Service fee should be ₹10 and GST 12%." or "Penalty is ₹750 now."

**File:** `frontend/src/lib/db.ts`, inside the `stopSession` function. Find this block:

```ts
const serviceFee = 5.0;                         // ← change the fee here
...
const gstTax = +(taxableSubtotal * 0.18).toFixed(2);   // ← change 0.18 for GST %
const penaltyFee = penaltyApplies ? 500.0 : 0.0;       // ← change 500.0 for penalty
```

**Also update the displayed/hard-coded copies** so the UI matches:
- Search the codebase for `500` and `₹5` and `0.18` (e.g. in bill/complete pages and `README`) and update the labels.
- The `Bill`/`ChargingSession` type comments in `frontend/src/types/ev.ts` (cosmetic).

**Check:** complete a session and open the invoice at `/bills/[id]` — line items should reflect the new numbers.

---

## C. Change the emergency eviction timer (120 seconds)

**Request example:** "Give drivers 90 seconds instead of 120."

**File:** `frontend/src/lib/storeContext.tsx` → the eviction state `useState<number>(120)` (the `evictionCountdown` initial value) and any place the countdown resets to `120`. Search for `120` in that file.

**Check:** log in as admin, trigger an emergency on the VIP bay, and watch the countdown start from the new number.

---

## D. Add or edit a charging station / bay

**Request example:** "Add a third campus station."

- **Permanent/seed:** add a new object to `mockChargers` in `frontend/src/lib/mockData.ts` (copy an existing one, change `id`, `chargerCode`, `name`, `location`, `pricePerKwh`, etc.). Also add it to the `chargers` array in `frontend/data/db.json` (or delete `db.json` to let it reseed).
- **At runtime:** an admin can change status/price/operator from `/admin/chargers`.
- Set `isPriorityBay: true` to make it an emergency bay; set `stationType: 'BATTERY_SWAP_STATION'` for a swap hub.

**Check:** the new station appears on `/chargers` and `/admin/chargers`.

---

## E. Add or change a vehicle preset

**Request example:** "Add the Bajaj Chetak."

**File:** `frontend/src/lib/mockData.ts` → the vehicle/preset arrays (`mockVehicles`). Copy an entry and set `model`, `batteryCapacityKwh`, `connectorType`, `ridingRangeKm`, `imageUrl`. Vehicle model strings also appear in seed users (`vehicleModel`).

**Check:** the vehicle shows under `/vehicles` ("Bike Garage") and is selectable when starting a session.

---

## F. Rebrand (name, colors, logo)

**Request example:** "Rename it to 'VoltGo' and make the accent green."

- **App name / page title:** `frontend/src/app/layout.tsx` (`metadata.title` and `description`). Also search for `Smart Moto`, `KLETECH`, `SmartEV` across `frontend/src/` and update visible text (especially `Navbar.tsx`, `Footer.tsx`, `app/page.tsx`).
- **Colors / theme:** `frontend/src/app/globals.css` → edit the CSS variables under `:root` (light) and `.dark` (dark), e.g. `--accent-cyan`, `--accent-emerald`, `--accent-blue`, and the `--color-navy-*` tokens in the `@theme` block.
- **Logo/favicon:** replace `frontend/src/app/favicon.ico` and any logo asset referenced in `Navbar.tsx`; images live in `frontend/public/`.

**Check:** every page header/footer and the browser tab show the new brand; colors update in both light and dark mode.

---

## G. Add a brand-new page

**Request example:** "Add an 'About Us' page at /about."

1. Create `frontend/src/app/about/page.tsx` that exports a default React component returning your content. (Copy a simple existing page like `app/features/page.tsx` as a template.)
2. Add a link to it in `frontend/src/components/ui/Navbar.tsx` or `Footer.tsx`.
3. If the page must require login, add its path to the `AUTH_REQUIRED_PREFIXES` array and the `matcher` in `frontend/src/middleware.ts`.

**Check:** visiting `/about` renders your page; the nav link works.

> **Reminder:** this project uses a newer Next.js. If a page needs server data or new APIs, check `frontend/node_modules/next/dist/docs/` for the current conventions (noted in `frontend/AGENTS.md`).

---

## H. Add a new API endpoint

**Request example:** "Add an endpoint to export sessions as CSV."

1. Create `frontend/src/app/api/<name>/route.ts`.
2. Export an async function named after the HTTP method: `export async function GET(request: Request) { ... }`.
3. For protected data, start with:
   ```ts
   import { getSessionFromRequest } from '@/lib/auth';
   const session = await getSessionFromRequest(request);
   if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
   // role check if needed:
   if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   ```
4. Read/write data through `db` from `@/lib/db`.
5. Return `NextResponse.json(...)`.

**Check:** call it with `curl` or from a page; verify auth returns 401/403 as expected.

---

## I. Change who can access a page (permissions)

**File:** `frontend/src/middleware.ts`. The rules are a series of `if (pathname...)` blocks. To protect a new area for admins only, follow the existing `/admin` block; for a driver-only page, add the prefix to `AUTH_REQUIRED_PREFIXES` **and** to the `matcher` list at the bottom.

**Important:** the middleware guards *pages*. If the page loads sensitive data from an API, also add a role check in that API route (see recipe H). Both gates matter — see `01 — Architecture`.

---

## J. Add / edit / remove a demo account

**File:** `frontend/data/db.json` → the `users` array. Copy an entry and set `id`, `name`, `email`, `role`, `passwordHash` (the password), and for operators `assignedStationId`.
Mirror it in `INITIAL_DATA` inside `frontend/src/lib/db.ts` so a reseed keeps it.

**Check:** log in with the new credentials (see `03` for the table of existing ones).

---

## K. Change the live-telemetry data source

**File:** environment variables in `frontend/.env.local` (copy from `.env.example`).
- `NEXT_PUBLIC_DATA_MODE` — `thingspeak` vs mock.
- `NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID` / keys — point at your ThingSpeak channel.
- `NEXT_PUBLIC_WS_URL` — the backend WebSocket for live MQTT data.
To generate fake data without hardware, run a simulator in `iot/simulator/` (`node mqtt_simulator.js`).

---

## L. Change something in the Java backend

**Request example:** "The backend should reject power ratings above 20 kW."

Backends follow **Controller → Service → Repository**:
- Endpoint/validation entry: `backend/src/main/java/com/smart/ev/controller/ChargerController.java`.
- Business rule: the matching `service/ChargerService.java`.
- Data shape: `domain/Charger.java`; data access: `repository/ChargerRepository.java`.
- Access rules: `security/SecurityConfig.java`.

**Rebuild & test:** `cd backend && mvn compile && mvn test` then `mvn spring-boot:run`.

> **Known backend hardening task** (good to mention to a manager): in `SecurityConfig.java`, the charger `PATCH` endpoints are currently `permitAll()` (open). For production they should require an authenticated ADMIN/OPERATOR, matching how the frontend already protects `PATCH /api/stations`.

---

## General workflow for *any* change request

1. **Locate** — use `04 — Codebase Map` or search the repo for a visible label/number (`grep -rn "500" frontend/src`).
2. **Understand** — read the surrounding code and the relevant walkthrough in `05`.
3. **Edit** the smallest number of files.
4. **Verify** — `npx tsc --noEmit`, reload the page, click through the flow.
5. **Commit** — `git commit` so the change is saved and reversible.

Next: `08 — API Reference` lists every endpoint you might call.
