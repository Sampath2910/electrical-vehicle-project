# 02 — Tech Stack Explained

Every technology in the project, what it is, and **why it is here**. Versions are from `frontend/package.json` and `backend/pom.xml`.

## Frontend (the website)

| Technology | Version | What it is (plain English) | Why it's used here |
|-----------|---------|-----------------------------|---------------------|
| **Next.js** | 16.3.7 | A framework built on React that gives you pages *and* a server in one project. | Lets the site serve pages, protect routes (middleware), and run API endpoints — all in one app. |
| **React** | 19.2.8 | The library for building user interfaces out of reusable "components". | Every screen is a React component. |
| **TypeScript** | 5.x | JavaScript + type checking. Catches mistakes before the app runs. | Safer code; the `types/ev.ts` file defines the shape of all our data. |
| **Tailwind CSS** | 4.x | A styling system where you add classes like `bg-slate-50` directly in the markup. | Fast, consistent styling; supports dark mode. |
| **Recharts** | 3.x | A charting library for React. | Draws the analytics graphs and live telemetry gauges. |
| **Framer Motion** | 13.x | An animation library. | Smooth transitions, the eviction red-flash, etc. |
| **lucide-react** | 1.x | An icon set (including the ₹ Indian Rupee icon). | All the icons in the UI. |
| **clsx / tailwind-merge** | — | Small helpers to combine CSS class names cleanly. | Conditional styling (e.g., "red if fault"). |

**How the frontend runs:** `npm run dev` (development) or `npm run build` + `npm run start` (production). It listens on **port 3000**.

### What each frontend concept means
- **Component** — a reusable piece of UI, e.g. `MetricCard.tsx`. Written as a function that returns markup.
- **Page** — a special component at `src/app/<route>/page.tsx` that becomes a URL. `src/app/wallet/page.tsx` → the `/wallet` page.
- **API route** — a server function at `src/app/api/<name>/route.ts`. It is **not** a page; it returns JSON.
- **Middleware** — `src/middleware.ts`, runs before pages to guard access.
- **Context / Store** — `src/lib/storeContext.tsx`, a shared "global memory" all pages can read and update (current user, wallet, sessions, etc.).

## Backend (optional Java server)

| Technology | What it is | Why it's used here |
|-----------|------------|---------------------|
| **Java 17** | The programming language. | Industry-standard for enterprise backends. |
| **Spring Boot 3** | A framework for building Java web servers with minimal boilerplate. | Provides the REST API, security, dependency injection. |
| **Spring Security + JWT** | Authentication/authorization system; JWT = signed login tokens. | Protects endpoints; checks roles. |
| **BCrypt (strength 12)** | A password-hashing algorithm (one-way, slow on purpose). | Stores passwords safely in the backend DB. See `backend/src/main/java/com/smart/ev/security/SecurityConfig.java`. |
| **Spring Data JPA** | Maps Java objects to database tables so you don't write raw SQL. | The `domain/` entities and `repository/` interfaces. |
| **PostgreSQL** | A relational database (configured for real deployment). | Stores users, chargers, sessions, bills. |
| **Redis** | An in-memory cache (fast key/value store). | Caches live telemetry. |
| **WebSocket / STOMP** | A two-way, always-open connection for pushing live updates to the browser. | Streams live charging data without the page constantly re-asking. |
| **MQTT (Eclipse Paho)** | A lightweight messaging protocol popular in IoT. | How the ESP32 hardware sends 1-per-second telemetry to the backend. |
| **Maven** | Java's build/dependency tool (`pom.xml`). | `mvn compile`, `mvn test`, `mvn spring-boot:run`. |

**How the backend runs:** `mvn spring-boot:run` (or the Docker image). It listens on **port 8080**.

## IoT (hardware layer)

| Technology | What it is | Role |
|-----------|------------|------|
| **ESP32** | A cheap, popular Wi-Fi microcontroller. | The "brain" of the charging station. |
| **Arduino (.ino firmware)** | The C++-style code that runs on the ESP32. | `iot/firmware/esp32_smart_ev.ino`. |
| **PZEM-004T** | An AC power-measurement sensor (voltage, current, power, power factor). | Measures real energy delivered. |
| **Relay (GPIO 26)** | An electronically-controlled switch. | Cuts power during eviction / over-voltage. |
| **Buzzer (GPIO 27)** | A beeper. | Sounds the alarm during the 120-second eviction. |
| **ThingSpeak** | An IoT cloud service that stores/plots sensor data. | Optional live data source for demos (see env vars). |
| **Node.js simulators** | JS scripts that fake hardware. | `iot/simulator/*.js` — demo live data without real hardware. |

## Infrastructure / tooling

| Technology | What it is | Role |
|-----------|------------|------|
| **Docker / docker-compose** | Packages each service into a container so it runs the same everywhere. | `docker-compose.yml` can start the whole stack. |
| **ESLint** | A code "linter" — flags style issues and likely bugs. | `npm run lint`. |
| **Git** | Version control. | Tracks every change; lets you undo. |

## Environment variables (configuration)

Settings that live **outside** the code so you can change them per machine. See `.env.example` (root) and `frontend/.env.example`:

- `NEXT_PUBLIC_API_URL` — where the Java backend is (default `http://localhost:8080`).
- `NEXT_PUBLIC_WS_URL` — the WebSocket URL for live telemetry.
- `NEXT_PUBLIC_DATA_MODE` — `thingspeak` or mock, picks the live-data source.
- `NEXT_PUBLIC_THINGSPEAK_*` — ThingSpeak channel + keys.
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — the backend's PostgreSQL connection.
- `JWT_SECRET` — secret key used to sign backend tokens.
- `AUTH_SECRET` — (frontend) secret used to sign the local login token in `src/lib/auth.ts`.

> **Security note for the team:** `.env.example` currently contains real-looking ThingSpeak/JWT values. For a real deployment you would move these to a private `.env` file (never committed) and rotate the keys. For a college demo it's fine, but know this is the "right answer" if an examiner asks about secrets management.

Next: `03 — Setup & Run` gets it running on your machine.
