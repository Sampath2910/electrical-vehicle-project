# 03 — Setup & Run Guide

This gets the project running on your laptop. **For a demo you only need the frontend.**

## Prerequisites

- **Node.js 18+** and **npm** (for the frontend). Check: `node -v` and `npm -v`.
- *(Optional)* **Java 17+** and **Maven** (only if you want to run the Java backend). Check: `java -version`, `mvn -version`.
- *(Optional)* **Docker Desktop** (only for the full containerised stack).

## Option A — Run the frontend only (recommended for demos)

```bash
cd frontend
npm install        # first time only — downloads dependencies
npm run dev        # starts the dev server
```

Then open **http://localhost:3000**.

- `npm run dev` = development mode (auto-reloads when you edit code). Best while working.
- For a "production-like" run: `npm run build` then `npm run start`.
- To check the code compiles/type-checks: `npx tsc --noEmit`.
- To lint: `npm run lint`.

That's it. The website uses `frontend/data/db.json` as its database, so everything (login, charging, bills) works with no other service running.

## Option B — Also run the Java backend

In a **second terminal**:

```bash
cd backend
mvn spring-boot:run     # starts Spring Boot on port 8080
```

Useful backend commands:
- `mvn compile` — just compile.
- `mvn test` — run the JUnit tests (`backend/src/test/...`).
- `mvn clean package` — build a runnable `.jar`.

When the backend is up, the frontend's API routes will prefer it and fall back to `db.json` only if it goes down. You don't need to configure anything — the default `NEXT_PUBLIC_API_URL` already points at `http://localhost:8080`.

## Option C — Full stack with Docker

```bash
docker-compose up --build
```

This reads `docker-compose.yml` and starts the services together. Use this only if you specifically need Postgres/Redis/MQTT running too.

## Demo login accounts

These seed accounts live in `frontend/data/db.json` (and `frontend/src/lib/db.ts` as the initial data). Use them on the login pages.

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| **Admin** | `admin@smartev.com` | `admin123` | `/admin` |
| **Operator 1** | `operator1@kletech.ac.in` | `operator123` | `/operator` (Station 1) |
| **Operator 2** | `operator2@kletech.ac.in` | `operator123` | `/operator` (Station 2) |
| **Driver** | `driver@smartev.com` | `password123` | `/dashboard` |
| **Driver (Alex)** | `alex.rivera@example.com` | `password123` | `/dashboard` |

> There are dedicated login pages per role: `/auth/login/admin`, `/auth/login/operator`, `/auth/login/user`. You can also register new accounts at `/auth/register/...`.

> **The VivaDemoDock:** there is a small floating panel on screen (`frontend/src/components/ui/VivaDemoDock.tsx`) that gives quick shortcuts for demonstrations (switch role, trigger emergency, etc.). Handy during a viva.

## Resetting the demo data

The local database is just the file `frontend/data/db.json`. If a demo leaves it messy:

- There is a reset endpoint: `POST /api/admin/reset` (admin only) — see `frontend/src/app/api/admin/reset/route.ts`.
- Or restore the file from git: `git checkout frontend/data/db.json` (this discards local data changes — only do it if you want the committed state back).
- The *initial* seed data also lives in `INITIAL_DATA` inside `frontend/src/lib/db.ts`; if `db.json` is ever deleted, `db.ts` recreates it from there.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `npm run dev` fails with "module not found" | Dependencies not installed | Run `npm install` inside `frontend/` |
| Port 3000 already in use | Another app/old server running | Stop it, or run `npm run dev -- -p 3001` |
| Login "works" even with backend off | Expected — it falls back to `db.json` | Not a bug; see `01 — Architecture` |
| Admin pages redirect me away | You're logged in as Driver/Operator | Log in with an admin account |
| Live telemetry shows nothing | No backend/simulator/ThingSpeak feeding data | Start a simulator in `iot/simulator/`, or ignore for a static demo |
| Changes to `db.json` not showing | Server cached old state / need refresh | Restart `npm run dev`, hard-refresh the browser |

Next: `04 — Codebase Map` tells you exactly which file does what.
