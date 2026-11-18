# 09 — Glossary & Viva Q&A

## Glossary (plain-English)

**General web terms**
- **Frontend** — the part of the app that runs in the browser (what users see/click).
- **Backend / server** — code that runs on a server, not visible to users; handles data and logic.
- **API (endpoint)** — a URL the frontend calls to get or save data; returns JSON, not a web page.
- **JSON** — a text format for data: `{ "key": "value" }`.
- **HTTP methods** — `GET` (read), `POST` (create/do), `PATCH`/`PUT` (update), `DELETE` (remove).
- **Status codes** — `200` OK, `400` bad request, `401` not logged in, `403` logged in but not allowed, `404` not found, `409` conflict (e.g. already done).
- **Cookie** — a small piece of data the browser stores and sends back each request; here it holds the login token.
- **Component** — a reusable UI building block in React.
- **Route / page** — a URL in the app (e.g. `/wallet`).
- **Middleware** — code that runs before a page to check permissions.
- **State / store** — the app's in-memory data while you use it; here the global store is `storeContext.tsx`.
- **Environment variable** — a setting kept outside the code (in `.env`), e.g. a URL or secret.
- **Build / compile** — turning the source code into the optimised version that runs.
- **Lint** — automatic checks for code style and likely mistakes.

**Security terms**
- **Authentication** — proving *who you are* (login).
- **Authorization** — deciding *what you're allowed to do* (roles).
- **JWT / signed token** — a login token with a signature so it can't be faked.
- **HMAC-SHA256** — the signing method used for the frontend token.
- **BCrypt** — a secure way to store passwords (one-way hash) used by the Java backend.
- **httpOnly cookie** — a cookie JavaScript can't read, which blocks a common theft trick.
- **IDOR** — "Insecure Direct Object Reference": accessing someone else's data by guessing an id. The app blocks this (e.g. you can't stop another user's session).

**Domain (EV) terms**
- **kW (kilowatt)** — rate of power (how fast energy flows). Stations here are ≤ 3.3 kW.
- **kWh (kilowatt-hour)** — amount of energy delivered — *what you pay for*.
- **ToD (Time-of-Day) tariff** — price that changes with the time (off-peak/standard/peak).
- **LT-6** — a commercial low-tension electricity tariff category in India.
- **Tariff slot** — `S_1` off-peak, `S_2` standard, `S_3` peak, `S_VIP` premium.
- **Session** — one charging event from start to stop.
- **Preemption / eviction** — forcing a vehicle out of the VIP bay for an emergency vehicle.
- **Telemetry** — live sensor data (voltage, current, power) streamed from hardware.
- **Power Factor (PF)** — how efficiently power is used (~0.98 here; 1.0 is ideal).
- **THD (Total Harmonic Distortion)** — a power-quality measure (~2.1%; must stay < 5% per IEEE-519).
- **Sag / Swell** — voltage dropping too low / rising too high.
- **ESP32** — the microcontroller ("brain") on the charging hardware.
- **PZEM-004T** — the AC power sensor chip.
- **Relay** — an electronic switch that cuts power.
- **MQTT** — a lightweight IoT messaging protocol.
- **WebSocket** — an always-open connection for live updates to the browser.
- **BSS (Battery Swap Station)** — swap an empty battery for a full one instead of charging.
- **RFID** — tap-card identification (a card type exists but is marked deprecated in the code).

---

## Likely viva / manager questions (with answers)

**Q: Explain your architecture in one minute.**
Three layers: a Next.js frontend that also serves its own API and uses a `db.json` file as a database; an optional Spring Boot (Java) backend with a real database, JWT security, WebSockets and MQTT; and ESP32 IoT firmware with a PZEM-004T sensor. The frontend prefers the backend but falls back to its local database, so it always works in a demo.

**Q: How does login and role security work?**
On login we issue an HMAC-signed token stored in an httpOnly cookie. `middleware.ts` guards which pages each role can open, and every sensitive API route re-checks the role, returning 403 if it's wrong. The token is signed, so a user can't edit it to become an admin.

**Q: Walk me through what happens when a session is billed.**
`stopSession` in `db.ts` computes: energy × tariff rate, + ₹5 service fee, + 18% GST on that subtotal, + ₹500 penalty if an emergency eviction was ignored. It then frees the bay, creates a Bill, and auto-debits the wallet if the balance covers it. It also blocks stopping someone else's session and blocks double-billing.

**Q: What is the emergency preemption feature?**
The VIP bay (`ch-102`) can be preempted for ambulances/fire engines. The driver consented to a ₹500 penalty at start. On trigger, a 120-second countdown runs with alarms and a red "VACATE" UI. If they leave, no penalty; if the timer expires, power is cut (ESP32 relay) and ₹500 is added to the bill.

**Q: Where is the data stored?**
Shapes are defined in `src/types/ev.ts`; live records are in `frontend/data/db.json`, accessed through `src/lib/db.ts`. The Java backend uses JPA entities in `backend/.../domain/` with PostgreSQL.

**Q: How would you change the peak price / the penalty / the timer?**
Peak price: `tariffHelper.ts` and `mockData.ts` (or live at `/admin/tariffs`). Penalty and fees: `stopSession` in `db.ts`. Timer: the `evictionCountdown` value in `storeContext.tsx`. (Full steps in `07 — Change Cookbook`.)

**Q: Is it production-ready?**
It's a strong prototype: it builds cleanly, type-checks with no errors, enforces roles, blocks IDOR and double-billing, and validates input. For true production we'd (1) make the server compute the tariff instead of trusting the client, (2) stop storing plain-text passwords in the local fallback, (3) require auth on the backend's charger `PATCH` endpoints, and (4) move from a JSON file to a real database. These are known, documented items — not surprises.

**Q: What are the biggest technical risks you're aware of?**
The three security hardening items above, plus the JSON file store not being safe for many simultaneous users. All are listed so we can address them deliberately.

**Q: Why Next.js and Spring Boot together?**
Next.js gives a fast, modern UI with built-in server routes so the app is self-contained for demos. Spring Boot represents the scalable, enterprise-grade backend path (real DB, security, IoT messaging) the product would use in production.

---

## Where to go for more
- Architecture → `01`
- "Which file does X?" → `04`
- "How does X work?" → `05`
- "Change X" → `07`
- Existing QA/test reports → `docs/qa/`
