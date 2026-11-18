# 08 — API Reference

Two sets of endpoints exist: the **Frontend API** (Next.js, port 3000, backed by `db.json`) and the **Backend API** (Spring Boot, port 8080). The website uses the frontend API, which falls back to `db.json` when the backend is offline.

**Auth:** protected endpoints read the `jwt_token` cookie (or `Authorization: Bearer <token>`). Missing/invalid → **401**. Wrong role → **403**.

---

## Frontend API (`frontend/src/app/api/`, port 3000)

### `POST /api/auth/login`
Log in. **Body:** `{ identifier, password, expectedRole? }` (`identifier` = email/username/phone).
**Returns:** `{ success, user, token, role, redirectTo }` and sets the `jwt_token` cookie.
**Errors:** 400 (missing fields), 401 (wrong password), 404 (no such account).
File: `api/auth/login/route.ts`.

### `POST /api/auth/register`
Create an account. **Body:** `{ name, email, password, role?, phone?, ... }`. Sets cookie on success.
File: `api/auth/register/route.ts`.

### `POST /api/auth/logout`
Clears the `jwt_token` cookie. File: `api/auth/logout/route.ts`.

### `GET /api/user/state`  *(auth required)*
Returns the logged-in user's full state (profile, wallet, vehicles, sessions, bills, etc.).

### `POST /api/user/state`  *(auth required)*
One endpoint, many actions via `{ action: ... }`:
| `action` | Body | Does |
|----------|------|------|
| `topup_wallet` | `{ amount }` | Adds funds (0 < amount ≤ 100000). |
| `add_vehicle` | `{ vehicle: {...} }` | Adds a bike to the garage. |
| `start_session` | `{ session: { id, chargerId, tariffRate, ... } }` | Starts charging (checks bay free, status, rate). → 409 if busy. |
| `stop_session` | `{ sessionId, energyKwh, durationSeconds, penaltyApplies }` | Stops, bills, frees bay. → 403 if not yours, 409 if already settled. |
File: `api/user/state/route.ts`.

### `GET /api/stations`
Public. Returns all chargers. File: `api/stations/route.ts`.

### `PATCH /api/stations`  *(ADMIN or OPERATOR)*
Update a station. **Body:** `{ stationId, status?, powerRating?, pricePerKwh?, operatorId?, action? }`.
Validations: status must be a known value; `0 < powerRating ≤ 50`; `0 < pricePerKwh ≤ 500`.
Operators may modify **only their own** station and **cannot** reassign operators (else 403).
`action: "clear_history"` clears that station's sessions.

### `GET /api/admin/stats`  *(ADMIN only)*
Fleet-wide dashboard data (stations, operators, revenue, KPIs). → 403 for others. File: `api/admin/stats/route.ts`.

### `GET /api/admin/users` / `POST /api/admin/users`  *(ADMIN only)*
List or create/manage users. File: `api/admin/users/route.ts`.

### `POST /api/admin/reset`  *(ADMIN only)*
Resets the demo database to seed state. File: `api/admin/reset/route.ts`.

### `GET /api/operator/stats?stationId=...`  *(OPERATOR/ADMIN)*
Stats for one station. File: `api/operator/stats/route.ts`.

---

## Backend API (Spring Boot, port 8080, base `/api/v1`)

Public (no auth): `POST /auth/login`, `POST /auth/register`, `GET /chargers/**`, `PATCH /chargers/**` *(currently open — see hardening note)*, `GET /tariffs`, `GET /tariffs/current-slot`, `/ws-ev/**`. Everything else under `/api/v1/**` requires a valid JWT.

| Method & path | Controller | Purpose |
|---------------|-----------|---------|
| `POST /api/v1/auth/login` | `AuthController` | Authenticate, return JWT. |
| `POST /api/v1/auth/register` | `AuthController` | Create account (BCrypt-hashed). |
| `GET /api/v1/auth/me` | `AuthController` | Current user from token. |
| `GET /api/v1/chargers` | `ChargerController` | List chargers. |
| `GET /api/v1/chargers/{id}` | `ChargerController` | One charger. |
| `PATCH /api/v1/chargers/{id}/status` | `ChargerController` | Set status. |
| `PATCH /api/v1/chargers/{id}/rating` | `ChargerController` | Set power rating. |
| `PATCH /api/v1/chargers/{id}/operator` | `ChargerController` | Assign operator. |
| `GET /api/v1/tariffs` | `TariffController` | List tariffs. |
| `GET /api/v1/tariffs/current-slot` | `TariffController` | Active ToD slot now. |
| `PUT /api/v1/tariffs/{id}` | `TariffController` | Update a tariff. |
| `POST /api/v1/sessions/start` | `ChargingSessionController` | Start a session. |
| `POST /api/v1/sessions/{id}/stop` | `ChargingSessionController` | Stop + bill. |
| `GET /api/v1/sessions/active` | `ChargingSessionController` | Active sessions. |
| `GET /api/v1/sessions/history` | `ChargingSessionController` | Past sessions. |
| `GET /api/v1/wallet` | `WalletController` | Wallet balance. |
| `POST /api/v1/wallet/topup` | `WalletController` | Add funds. |
| `POST /api/v1/preemption/trigger` | `PreemptionController` | Start emergency eviction. |
| `POST /api/v1/preemption/yield` | `PreemptionController` | Driver yields the bay. |
| `GET /api/v1/preemption/status` | `PreemptionController` | Eviction status. |
| `GET /api/v1/admin/stats` | `AdminController` | Fleet stats (JWT). |
| `GET /api/v1/operator/stats` | `OperatorController` | Operator station stats. |

Live telemetry is pushed over the **WebSocket/STOMP** endpoint `ws-ev` (configured in `backend/.../websocket/WebSocketConfig.java`), fed by MQTT messages on `ev/chargers/{id}/telemetry`.

### Quick test commands
```bash
# Login (frontend) and save the cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"driver@smartev.com","password":"password123"}'

# Use the cookie to load user state
curl -b cookies.txt http://localhost:3000/api/user/state

# A driver calling an admin endpoint should get 403
curl -b cookies.txt -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/admin/stats
```

Next: `09 — Glossary & Viva Q&A`.
