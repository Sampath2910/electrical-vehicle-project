# 04 — Codebase Map (Which File Does What)

This is your **"where is the code for X?"** reference. Paths are from the project root.

## Top-level folders

| Path | What it is |
|------|------------|
| `frontend/` | The Next.js website — **the main app**. |
| `backend/` | The optional Spring Boot (Java) server. |
| `iot/` | ESP32 firmware + hardware simulators. |
| `docs/` | Documentation (including this handbook) and the QA reports. |
| `README.md` | Project spec and quick start. |
| `SMART_EV_PROJECT_*` | The detailed project spec and beginner guide. |
| `Smart_EV_Charging_Platform_Blueprint.pdf/.docx` | The full design blueprint. |
| `*.png` | Architecture, sitemap, and payment-flow diagrams. |
| `docker-compose.yml` | Runs the whole stack in containers. |
| `.env.example` | Sample configuration values. |

---

## Frontend in detail (`frontend/`)

### Configuration & entry files
| File | Responsibility |
|------|----------------|
| `package.json` | Dependencies and scripts (`dev`, `build`, `start`, `lint`). |
| `next.config.ts` | Next.js configuration. |
| `tsconfig.json` | TypeScript settings (incl. the `@/` import alias → `src/`). |
| `postcss.config.mjs` / `eslint.config.mjs` | Tailwind and linting config. |
| `data/db.json` | **The local database file** (users, chargers, sessions, bills, wallets…). |
| `.env.local` / `.env.example` | Environment variables. |

### `frontend/src/app/` — Pages & API (Next.js App Router)
Each folder with a `page.tsx` is a **URL**. Each folder under `api/` with a `route.ts` is a **server endpoint**.

**Public / marketing pages**
| Route (URL) | File | Purpose |
|------|------|---------|
| `/` | `app/page.tsx` | Landing/home page |
| `/features` | `app/features/page.tsx` | Feature showcase |
| `/how-it-works` | `app/how-it-works/page.tsx` | Explainer |

**Authentication pages**
| Route | File |
|------|------|
| `/auth/login` + `/auth/login/{user,operator,admin}` | `app/auth/login/...page.tsx` |
| `/auth/register` + `/auth/register/{user,operator,admin}` | `app/auth/register/...page.tsx` |

**Driver (USER) pages**
| Route | File | Purpose |
|------|------|---------|
| `/dashboard` | `app/dashboard/page.tsx` | Driver home |
| `/chargers` | `app/chargers/page.tsx` | Browse stations |
| `/chargers/[id]` | `app/chargers/[id]/page.tsx` | One station's detail |
| `/charging/start` | `app/charging/start/page.tsx` | Begin a session |
| `/charging/[sessionId]` | `app/charging/[sessionId]/page.tsx` | Live charging screen |
| `/charging/[sessionId]/complete` | `.../complete/page.tsx` | Session finished summary |
| `/wallet` | `app/wallet/page.tsx` | Wallet balance & top-up |
| `/bills` + `/bills/[id]` | `app/bills/...` | Invoice list & detail |
| `/history` | `app/history/page.tsx` | Past sessions |
| `/vehicles` | `app/vehicles/page.tsx` | The rider's bikes ("Garage") |
| `/rfid` | `app/rfid/page.tsx` | RFID tap cards |
| `/notifications` | `app/notifications/page.tsx` | Alerts |
| `/profile`, `/settings` | `app/profile`, `app/settings` | Account settings |

**Operator pages**
| Route | File | Purpose |
|------|------|---------|
| `/operator` | `app/operator/page.tsx` | Single-station console |

**Admin pages** (all share `app/admin/layout.tsx`)
| Route | File | Purpose |
|------|------|---------|
| `/admin` | `app/admin/page.tsx` | Fleet control tower |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | Graphs & KPIs |
| `/admin/chargers` + `/admin/chargers/[id]` | `app/admin/chargers/...` | Manage all stations |
| `/admin/live` | `app/admin/live/page.tsx` | Live telemetry (also allowed to Operators) |
| `/admin/tariffs` | `app/admin/tariffs/page.tsx` | Set prices |
| `/admin/operators` | `app/admin/operators/page.tsx` | Manage operators |
| `/admin/users` | `app/admin/users/page.tsx` | Manage users |
| `/admin/sessions` | `app/admin/sessions/page.tsx` | All sessions |
| `/admin/payments` | `app/admin/payments/page.tsx` | Payments |
| `/admin/faults` | `app/admin/faults/page.tsx` | Hardware faults |
| `/admin/settings` | `app/admin/settings/page.tsx` | Admin settings |

**API routes (server endpoints)** — full details in `08 — API Reference`.
| Endpoint | File | Purpose |
|------|------|---------|
| `POST /api/auth/login` | `app/api/auth/login/route.ts` | Log in, set cookie |
| `POST /api/auth/register` | `app/api/auth/register/route.ts` | Create account |
| `POST /api/auth/logout` | `app/api/auth/logout/route.ts` | Clear cookie |
| `GET/POST /api/user/state` | `app/api/user/state/route.ts` | Load user data; top-up/add-vehicle/start/stop session |
| `GET/PATCH /api/stations` | `app/api/stations/route.ts` | List stations; update status/price/operator |
| `GET /api/admin/stats` | `app/api/admin/stats/route.ts` | Admin dashboard data (admin-only) |
| `GET/POST /api/admin/users` | `app/api/admin/users/route.ts` | Manage users (admin-only) |
| `POST /api/admin/reset` | `app/api/admin/reset/route.ts` | Reset demo data (admin-only) |
| `GET /api/operator/stats` | `app/api/operator/stats/route.ts` | One operator's station stats |

**Special files**
| File | Responsibility |
|------|----------------|
| `app/layout.tsx` | The outer shell wrapping every page: Navbar, Footer, the global `StoreProvider`, the VivaDemoDock. |
| `app/globals.css` | Global styles and the color tokens (brand colors, dark mode). |
| `middleware.ts` | **Route guard** — decides who can open which page (see `01`). |

### `frontend/src/lib/` — The "brains" (logic & data)
| File | Responsibility — **learn these first** |
|------|----------------|
| `db.ts` | The **database layer**. Reads/writes `db.json`. Contains `startSession`, `stopSession` (the billing math!), `topUpWallet`, `addVehicle`, user lookups, charger updates. |
| `auth.ts` | **Login tokens**. Signs and verifies the HMAC session token; reads it from the request cookie. |
| `storeContext.tsx` | The **global store** (React Context). Holds current user, chargers, sessions, wallet, tariffs, the eviction countdown, theme/sound. All the client-side actions (`startChargingSession`, `stopChargingSession`, `triggerEmergencyOverride`, `topUpWallet`, tariff edits…). |
| `tariffHelper.ts` | The **price tiers** by kW (the `KW_TARIFF_TIERS` table and `getTariffForKw`). |
| `mockData.ts` | The **seed/demo data** (default users, chargers, sessions, vehicles, tariffs, faults, notifications). |
| `providers.ts` | Payment/data provider helpers. |

### `frontend/src/types/ev.ts`
The **single source of truth for data shapes**: `User`, `Charger`, `ChargingSession`, `Tariff`, `Bill`, `Wallet`, `Vehicle`, `Fault`, `Measurement`, etc. If you change a data structure, change it here first. (See `06 — Data Model`.)

### `frontend/src/components/ui/` — Reusable UI pieces
| File | What it renders |
|------|-----------------|
| `Navbar.tsx` | Top navigation; shows different links per role. |
| `Footer.tsx` | Page footer. |
| `MetricCard.tsx` | A KPI tile (number + label). |
| `StatusBadge.tsx` | Colored status pill (AVAILABLE/CHARGING/FAULT…). |
| `TelemetryGauge.tsx` | Live voltage/current/power gauge. |
| `EvBikeChargingVisual.tsx` / `EvDrivingChargingVisual.tsx` | Animated bike/charging visuals. |
| `BikeRangeCalculator.tsx` | Estimates range from battery %. |
| `QrScannerModal.tsx` | QR-code payment popup. |
| `RfidTapSimulatorModal.tsx` | Simulates tapping an RFID card. |
| `EeeHardwareBench.tsx` / `EceHardwareBench.tsx` / `ThingSpeakBench.tsx` | Hardware/IoT test-bench panels. |
| `VivaDemoDock.tsx` | The floating demo control panel. |

### `frontend/scripts/`
| File | Purpose |
|------|---------|
| `comprehensive_audit.mjs` | A script that visits every route and reports pass/fail (a quick health check). |

---

## Backend in detail (`backend/src/main/java/com/smart/ev/`)

The backend follows the classic **Controller → Service → Repository → Domain** layering.

| Folder | Responsibility |
|--------|----------------|
| `controller/` | Receives HTTP requests, returns responses. One per feature: `AuthController`, `ChargerController`, `ChargingSessionController`, `TariffController`, `WalletController`, `PreemptionController`, `AdminController`, `OperatorController`. |
| `service/` | The business logic. e.g. `ChargingSessionService` (billing), `PriorityPreemptionService` (eviction), `WalletService`, `TariffService`, `AuthService`, `DataInitializerService` (seeds the DB with BCrypt-hashed passwords). |
| `repository/` | Database access interfaces (Spring Data JPA). One per entity. |
| `domain/` | The database entities (tables): `User`, `Charger`, `ChargingSession`, `Bill`, `Payment`, `Tariff`, `Wallet`, `WalletTransaction`, `RfidCard`, `Fault`, `Measurement`. |
| `dto/` | "Data Transfer Objects" — the shapes sent over the API (`AuthDto`, `ChargerDto`, `SessionDto`, `TariffDto`, `WalletDto`, `StatsDto`, `PreemptionDto`). |
| `security/` | `SecurityConfig` (rules + BCrypt), `JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetailsService`. |
| `websocket/` | `WebSocketConfig` + `TelemetryBroadcastService` (push live data to browsers). |
| `SmartEvApplication.java` | The program entry point. |
| `src/main/resources/application.yml` | Backend configuration (DB, ports, etc.). |
| `src/test/java/...` | JUnit tests. |
| `pom.xml` | Maven dependencies/build. |
| `Dockerfile` | Builds the backend container image. |

---

## IoT in detail (`iot/`)

| File | Responsibility |
|------|----------------|
| `firmware/esp32_smart_ev.ino` | The real ESP32 firmware: PZEM-004T readings, relay cutoff, buzzer, MQTT publish, emergency button. |
| `simulator/mqtt_simulator.js` | Fakes an ESP32 publishing MQTT telemetry. |
| `simulator/thingspeak_publisher.js` | Pushes sample data to ThingSpeak. |
| `simulator/thingspeak_continuous_stream.m` | MATLAB continuous-stream script. |

---

## The "I need to change X" quick index
(Full recipes in `07 — Change Cookbook`.)

| Want to change… | Start in this file |
|-----------------|--------------------|
| Prices / tariffs | `frontend/src/lib/tariffHelper.ts`, `frontend/src/lib/mockData.ts`, `/admin/tariffs` page |
| Billing formula (fees/GST/penalty) | `frontend/src/lib/db.ts` → `stopSession` |
| The ₹500 penalty or 120-second timer | `frontend/src/lib/db.ts` + `frontend/src/lib/storeContext.tsx` |
| Stations / bays | `frontend/src/lib/mockData.ts`, `frontend/data/db.json` |
| Vehicle presets | `frontend/src/lib/mockData.ts` |
| Branding (name/colors/logo) | `frontend/src/app/layout.tsx`, `globals.css`, `Navbar.tsx`, `Footer.tsx` |
| A new page | add a folder under `frontend/src/app/` with `page.tsx` |
| Who can access a page | `frontend/src/middleware.ts` |
| Demo accounts | `frontend/data/db.json` + `frontend/src/lib/db.ts` |

Next: `05 — Feature Walkthroughs` traces the big flows through these files.
