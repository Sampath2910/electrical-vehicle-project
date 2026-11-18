# 01 — Architecture (How It All Connects)

This document explains the moving parts and how a click in the browser turns into data on screen.

## The three layers

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: FRONTEND  (frontend/)                               │
│  Next.js website + its OWN built-in server + db.json file     │
│                                                               │
│   Browser (React pages you click)                             │
│        │                                                      │
│        ▼                                                      │
│   Next.js API routes  (frontend/src/app/api/...)              │
│        │         │                                            │
│        │         └──── reads/writes ──► data/db.json  (DB)    │
│        │                                                      │
└────────┼──────────────────────────────────────────────────── ┘
         │ (only if the Java backend is running)
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: BACKEND  (backend/)   — OPTIONAL                    │
│  Spring Boot (Java) REST API on port 8080                     │
│   Controllers → Services → Repositories → Database            │
│   + WebSocket/STOMP live stream  + MQTT telemetry listener    │
└────────┬──────────────────────────────────────────────────── ┘
         │ MQTT (1 Hz telemetry)
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: IoT HARDWARE  (iot/)                                │
│  ESP32 microcontroller + PZEM-004T sensor + relay + buzzer    │
│  (real firmware, plus JS/MATLAB simulators)                   │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1 — Frontend (the important one)

This is a **Next.js** application. Next.js is special because it is **both** the website *and* a small web server at the same time:

- **The pages** (`frontend/src/app/**/page.tsx`) are what the user sees and clicks. They are built with **React**.
- **The API routes** (`frontend/src/app/api/**/route.ts`) are tiny server programs that run on the server side. They handle login, saving data, starting sessions, etc.
- **The "database"** is a plain file: `frontend/data/db.json`. The API routes read from and write to it via `frontend/src/lib/db.ts`.

Because the frontend has its own API routes and its own `db.json`, **it runs completely on its own** — you do not need the Java backend or any hardware to demo it.

### Layer 2 — Backend (optional)

A separate, more "enterprise-grade" server written in **Java with Spring Boot**. It exposes a REST API at `http://localhost:8080/api/v1/...`. It has proper concepts like JPA entities, a real database, JWT security, BCrypt password hashing, WebSockets for live data, and an MQTT listener for hardware telemetry.

**How the two layers relate:** some frontend API routes try to call the Java backend first; if it is not reachable, they **fall back** to the local `db.json`. For example, see the login route `frontend/src/app/api/auth/login/route.ts` — it attempts the backend, and on any error silently uses the local database instead. This "graceful fallback" is why the demo never breaks even if Java is off.

### Layer 3 — IoT hardware

The `iot/` folder has the **ESP32 firmware** (`iot/firmware/esp32_smart_ev.ino`) that would run on the real charging station: it reads the PZEM-004T power sensor, controls a relay (to cut power), sounds a buzzer during eviction, and publishes telemetry over MQTT. There are also **simulators** (`iot/simulator/`) that pretend to be the hardware so you can demo live data without physical devices.

## The request lifecycle — a click, step by step

Let's follow **"a driver starts a charging session"**:

1. The driver is on a page like `frontend/src/app/charging/start/page.tsx` and clicks **Start**.
2. React calls a function from the **global store** (`frontend/src/lib/storeContext.tsx`) — `startChargingSession(...)`.
3. That function sends an HTTP `POST` to `/api/user/state` with `{ action: "start_session", session: {...} }`.
4. The **API route** `frontend/src/app/api/user/state/route.ts` receives it. It first checks **who you are** by reading your login cookie (`getSessionFromRequest` in `frontend/src/lib/auth.ts`).
5. It **validates** the input (charger exists? not already busy? tariff sane?).
6. It calls `db.startSession(...)` in `frontend/src/lib/db.ts`, which writes to `data/db.json`.
7. It (optionally) also tells the Java backend, best-effort.
8. It returns JSON to the browser; React updates the screen to the live charging view.

Every feature follows this same shape: **React page → store function → `/api/...` route → `db.ts` → `db.json`.** Learn this one pattern and you understand the whole app.

## How security / roles are enforced (two gates)

There are **two independent checkpoints**, both important:

### Gate 1 — The Middleware (page access)
File: `frontend/src/middleware.ts`.

This runs **before any protected page loads**. It reads the login cookie, figures out your role, and:
- sends logged-out users to the correct login page,
- stops a Driver from opening `/admin/*`,
- allows `/admin/live` to both Admins and Operators, etc.

So the middleware controls **which pages you can open**.

### Gate 2 — The API routes (data access)
Files: each `frontend/src/app/api/**/route.ts`.

Even if someone bypasses the pages and calls an API directly, each sensitive route **re-checks** the role. Example: `frontend/src/app/api/admin/stats/route.ts` returns **403 Forbidden** to a non-admin. And `db.stopSession(...)` refuses to stop a session that doesn't belong to you.

> **Why two gates?** The middleware is about *navigation*; the API checks are about *data*. A real attacker ignores the UI and hits the API directly, so the API must defend itself too. This project does both.

## The login token (how the app remembers who you are)

File: `frontend/src/lib/auth.ts`.

When you log in, the server creates a **signed token** (a string) and stores it in a browser **cookie** named `jwt_token`. The token contains your user id, role, and an expiry time, plus a **signature** created with a secret key (HMAC-SHA256).

- Because it is **signed**, nobody can secretly change their role to ADMIN in the token — the signature would no longer match and the server rejects it.
- The cookie is **httpOnly** (JavaScript on the page cannot read it, which blocks a common theft trick) and expires after **24 hours**.

## Data flow summary (one line)

> **Browser click → store function (`storeContext.tsx`) → `fetch('/api/...')` → API route checks auth + validates → `db.ts` reads/writes `db.json` → JSON back to browser → screen updates.**

Keep this sentence in your head. Everything else is detail.

Next: `02 — Tech Stack` explains each technology named above.
