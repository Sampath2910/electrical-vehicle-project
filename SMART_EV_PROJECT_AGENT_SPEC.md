# SMART EV CHARGING PLATFORM — AI AGENT IMPLEMENTATION SPECIFICATION

Version: 1.0
Purpose: Single source of truth for an AI coding agent implementing the Smart EV Charging Platform.
Audience: AI coding agents, frontend/backend developers, IoT developers, reviewers, testers.

---

## 0. HOW THE AGENT MUST USE THIS FILE

This document is the implementation contract.

Before writing code, the agent MUST:

1. Read this entire file.
2. Inspect the existing repository structure and existing working code.
3. Preserve existing working functionality unless it conflicts with this specification.
4. Reuse existing project conventions where they are sound.
5. Do not invent hardware capabilities, payment-provider behavior, electrical ratings, charging standards, sensor accuracy, or safety thresholds.
6. Clearly separate:
   - SOURCE REQUIREMENTS: derived from the original project proposal.
   - PRODUCT EXTENSIONS: agreed additions for a useful modern platform.
   - IMPLEMENTATION ASSUMPTIONS: temporary decisions required to make software runnable.
   - OPEN DECISIONS: information that must be supplied before final hardware/payment integration.
7. If a requirement is technically impossible or unsafe, stop that part and explain the blocker instead of silently implementing a fake solution.
8. Do not replace real data with mock data after real integration is available.
9. Keep mock/demo providers behind interfaces so they can be replaced by real providers without redesigning the UI.
10. After each major phase, run build, lint, type checks and tests and fix errors before moving on.

IMPORTANT:
- The web application is NOT the safety controller.
- Local charger/controller safety must work when the internet, backend, database or website is unavailable.
- Do not expose a telemetry field in the UI unless the actual hardware/provider supplies it.
- Demo telemetry must be visibly identifiable in development/demo mode.

---

# 1. PRODUCT DEFINITION

## 1.1 Product name

Smart EV Charging Platform

## 1.2 Product goal

Build a modern, responsive EV charging platform around an IoT-enabled smart EV charging unit.

The platform should support:

FIND → AUTHORIZE → CHARGE → MONITOR → CALCULATE → PAY → REMEMBER

It must feel like a real smart-charging product, not only a college-project sensor dashboard.

## 1.3 Primary user experiences

### User / EV driver

- Discover chargers.
- View charger availability.
- View charger details.
- Start charging using QR/UPI or RFID.
- Monitor live charging.
- View energy consumption and estimated cost.
- Stop/complete charging.
- View final bill and payment status.
- View charging history.
- Manage wallet.
- Manage RFID cards.
- Manage vehicles.
- Receive notifications.
- Manage profile/settings.

### Operator

- Monitor all chargers.
- View live sessions.
- View telemetry.
- View faults.
- Manage charger status/configuration.
- Manage tariffs.
- Review billing/payment information.
- View analytics.

### Administrator

- Manage users and operators.
- Manage chargers.
- Manage tariffs.
- Review payments and wallet transactions.
- Review faults.
- Review analytics/reports.
- Manage system settings.

---

# 2. SOURCE-OF-TRUTH BOUNDARIES

## 2.1 Requirements explicitly supported by the original proposal

The uploaded project proposal describes:

- EV charging system.
- Real-time electrical monitoring.
- Voltage/current/power monitoring.
- Power factor correction / PFC objective.
- Reduced harmonic distortion objective.
- Automatic billing based on energy consumption and predefined tariff.
- EV connection detection.
- Charging start/end tracking.
- Local display of operational values.
- Data storage.
- IoT/Wi-Fi remote monitoring.
- Safety/fault handling and cutoff.
- ESP32/microcontroller-centered control/monitoring architecture.

## 2.2 Product extensions agreed during design

These are platform-level additions recommended for a complete website:

- Charger discovery/map.
- User dashboard.
- Operator/admin dashboard.
- Wallet.
- RFID card management.
- QR/UPI payment flow.
- Charging history.
- Digital invoices.
- Notifications.
- Analytics.
- Charger management.
- Fault management.
- Tariff management.
- Responsive mobile UX.
- Mock telemetry mode.
- Provider interfaces for future real payment/IoT/RFID integration.

## 2.3 Do NOT treat these as confirmed hardware specifications

The original proposal is concept-level and does not fully define:

- Final electrical topology.
- Exact maximum charging power.
- Exact current rating.
- EV/battery voltage range.
- Exact EV charging communication standard.
- Exact PFC topology.
- Exact sensor models.
- Metering accuracy.
- Exact safety thresholds.
- Payment provider.
- RFID reader model/protocol.
- MQTT broker.
- Production cloud.

The source material also has an electrical-configuration inconsistency: its introduction describes a single-phase 230 V / 50 Hz system while its methodology diagram visually contains 230 V / 415 V. Do not silently resolve this in software. Mark it as OPEN DECISION.

---

# 3. NON-NEGOTIABLE ENGINEERING RULES

## 3.1 Safety

The following must never depend solely on the website:

- Over/undervoltage protection.
- Overcurrent protection.
- Emergency/fault cutoff.
- Hardware protection.
- Contactor/relay safety state.
- Safe charger shutdown.

The local controller must remain capable of stopping charging if network/cloud connectivity is lost.

## 3.2 Payment integrity

Never trust the browser alone to declare payment success.

For real QR/UPI integration:

Payment initiation → provider → provider/server callback or verified status → backend records result → charging authorization.

Use server-side verification/webhooks according to the selected provider.

## 3.3 RFID

RFID is an identifier/authorization mechanism.

Do not store the user's wallet balance on the RFID card.

Recommended model:

RFID UID → backend → user → wallet/account eligibility → charging authorization.

A lost card must be blockable.

## 3.4 Billing and payment are separate

Billing answers:

“What was consumed and what amount was owed?”

Payment answers:

“How was the amount paid and what is its payment status?”

Do not combine them into one database concept.

## 3.5 Real vs mock data

Development must support:

- MOCK mode.
- REAL/INTEGRATED mode.

Mock mode should use the same domain interfaces used by real providers.

Example:

TelemetryProvider
- MockTelemetryProvider
- MqttTelemetryProvider

PaymentProvider
- MockPaymentProvider
- RealPaymentProvider

RfidAuthorizationProvider
- MockRfidProvider
- RealRfidProvider

---

# 4. RECOMMENDED TECHNOLOGY STACK

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide icons

Use the repository's existing compatible versions if already established. Do not upgrade dependencies unnecessarily.

## Backend

- Java
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL driver
- Bean Validation
- WebSocket/STOMP or another explicit WebSocket implementation
- MQTT client integration

## Data

- PostgreSQL for durable relational data.
- Redis for live state/cache/short-lived data.
- Optional time-series database only if real telemetry volume requires it.

Do not add a time-series database to the MVP without a demonstrated need.

## IoT

- ESP32.
- MQTT for telemetry/control messaging.
- RFID reader connected to the device.
- Sensors selected according to the final electrical design.

## DevOps

- Docker.
- Docker Compose for local development.
- GitHub Actions.
- Environment variables/secrets.
- HTTPS/TLS in production.

---

# 5. FRONTEND INFORMATION ARCHITECTURE

Recommended route structure:

/                         Home
/how-it-works             How it works
/features                 Features
/chargers                 Find chargers
/chargers/[id]            Charger details

/auth/login
/auth/register

/dashboard                User dashboard
/charging/start
/charging/[sessionId]     Live charging
/charging/[sessionId]/complete

/history
/history/[sessionId]

/bills
/bills/[id]

/wallet
/rfid
/vehicles
/notifications
/profile
/settings

/admin
/admin/chargers
/admin/chargers/[id]
/admin/live
/admin/sessions
/admin/faults
/admin/tariffs
/admin/payments
/admin/analytics
/admin/users
/admin/settings

If operator and admin are separate roles, create role-specific authorization rather than exposing all admin routes to operators.

---

# 6. SCREEN REQUIREMENTS

## 6.1 Home

Must contain:

- Strong EV/energy hero.
- Clear value proposition.
- Find Charger CTA.
- Sign In CTA.
- Smart monitoring visual.
- How it works.
- Safety section.
- Real-time monitoring concept.
- QR/UPI + RFID explanation.
- Footer.

Visual direction:

- Deep navy/blue foundation.
- Electric-blue accent.
- White surfaces where appropriate.
- Rounded cards.
- Strong whitespace.
- Subtle motion.

Do not overload the landing page with technical jargon.

## 6.2 Find Chargers

Desktop:
- Search/filter area.
- Map/list split.
- Charger cards.

Mobile:
- List first.
- Map toggle.

Filters:
- Availability.
- Distance.
- Charging power.
- Price.
- Connector type only if real connector data exists.

Charger card:
- Name.
- Status.
- Distance if location data exists.
- Power rating.
- Price/kWh if configured.
- Last seen for offline devices.

## 6.3 Charger Details

Show:

- Charger name/id.
- Current availability.
- Charging power/rating.
- Connector information if known.
- Price.
- Location.
- Safety/system status.
- Last seen.
- Start Charging CTA.

## 6.4 Start Charging

Show two options:

### Scan & Charge
QR/UPI.

### Tap & Go
RFID.

Do not call RFID a payment method in every UI context. It is primarily authorization/identification; settlement may use a wallet/account.

## 6.5 Live Charging

Primary information:

- Current power.
- Energy consumed.
- Charging time.
- Estimated/current cost.

Secondary information:

- Voltage.
- Current.
- Frequency.
- Power factor if actually measured.
- Other measured power-quality values only if available.

Controls:

- Stop charging.
- Session status.
- Fault status.

Do not display EV battery percentage unless the actual hardware/vehicle protocol supplies SOC.

## 6.6 Charging Complete

Show:

- Session ID.
- Charger.
- Start/end.
- Duration.
- Energy.
- Tariff.
- Final amount.
- Payment method.
- Payment status.
- Receipt/bill CTA.

## 6.7 History

Table/list:

- Date.
- Charger.
- Energy.
- Duration.
- Cost.
- Payment method.
- Status.

Filters:
- Date.
- Charger.
- Status.
- Payment method.

## 6.8 Bill

Show:

- Bill ID.
- Session ID.
- Energy.
- Tariff.
- Amount.
- Payment method.
- Payment status.
- Transaction reference when available.

## 6.9 Wallet

Show:

- Current balance.
- Add money.
- Transaction list.
- Charging debits.
- Credits.
- Refunds.

The actual top-up flow is provider-dependent. Until a provider is selected, use a mock provider.

## 6.10 RFID

Show:

- Registered cards.
- Masked identifier.
- Active/blocked state.
- Last used.
- Add/register card.
- Block/unblock if authorized.

## 6.11 Vehicles

Store only information actually needed by the product.

Possible fields:
- Model.
- Registration.
- Connector type.
- Battery capacity.

Do not claim vehicle telemetry unless integrated.

## 6.12 Notifications

Examples:
- Charging completed.
- Payment success/failure.
- Charger fault.
- Charger offline.
- RFID blocked.
- Wallet low balance.

## 6.13 Operator dashboard

KPIs:
- Total chargers.
- Online.
- Charging.
- Fault.
- Today's energy.
- Today's revenue.
- Active sessions.

## 6.14 Live monitoring

For selected charger:
- Voltage.
- Current.
- Power.
- Energy.
- Frequency.
- Power factor if measured.
- Connection state.
- Last seen.
- Communication state.

Charts:
- Power vs time.
- Current vs time.
- Voltage vs time.
- Energy accumulation.

## 6.15 Fault center

Fields:
- Charger.
- Fault type.
- Severity.
- Time.
- Status.
- Current session.
- Resolution/acknowledgement.

Never hide safety faults behind generic UI errors.

## 6.16 Tariffs

MVP:
- Price per kWh.
- Effective date.
- Active/inactive.

Future:
- Peak/off-peak.
- Time-of-use.
- Site-specific tariffs.

## 6.17 Analytics

Show:
- Energy delivered.
- Number of sessions.
- Average session duration.
- Average energy/session.
- Revenue.
- Charger utilization.
- Fault count.
- Power-quality trends when real data exists.

---

# 7. DESIGN SYSTEM

## Colors

Use semantic tokens rather than hard-coded colors throughout components.

Suggested:

--background: deep navy/neutral
--surface: dark/white depending on theme
--primary: electric blue
--success: green
--warning: amber
--danger: red
--muted: neutral gray

The exact palette can be tuned by the UI implementation, but keep it consistent.

## Typography

Use one modern sans-serif family.

Hierarchy:

- Display: hero.
- H1/H2: section titles.
- Body: readable.
- Numeric metrics: larger, tabular/clear.

## Components

Build reusable:

- Button.
- Card.
- Badge.
- Status indicator.
- Metric card.
- Data table.
- Modal.
- Drawer.
- Toast.
- Tabs.
- Chart container.
- Charger card.
- Session card.
- Payment card.
- RFID card.
- Empty state.
- Error state.
- Offline state.
- Loading skeleton.

Do not duplicate component implementations.

---

# 8. RESPONSIVE UX

Desktop:
- Sidebar for authenticated dashboards.
- Main content area.
- Optional right-side contextual panel.

Mobile:
- Bottom navigation for key user routes.
- Sticky primary action during charging.
- Cards instead of wide tables.
- Charts must remain readable.
- QR must be easy to scan from another phone/device where applicable.

---

# 9. BACKEND MODULES

Recommended Spring Boot package structure:

com.smart.ev

auth/
user/
vehicle/
charger/
charging/
telemetry/
billing/
payment/
wallet/
rfid/
tariff/
fault/
notification/
analytics/
common/

Each domain should use appropriate:
- Controller.
- Service.
- Repository.
- Entity.
- DTO.
- Mapper where needed.
- Validation.

Do not expose JPA entities directly as public API contracts unless deliberately justified.

---

# 10. DATABASE MODEL

## users

id
name
email
phone
password_hash
role
status
created_at
updated_at

Roles:
USER
OPERATOR
ADMIN

## vehicles

id
user_id
model
registration
connector_type
battery_capacity
created_at
updated_at

## chargers

id
charger_code
name
location
latitude
longitude
power_rating
connector_type
status
last_seen_at
created_at
updated_at

Statuses:
AVAILABLE
PREPARING
CONNECTED
CHARGING
PAUSED
COMPLETED
FAULT
OFFLINE
MAINTENANCE

## charging_sessions

id
session_code
user_id
charger_id
vehicle_id nullable
start_time
end_time nullable
status
energy_kwh
duration_seconds
tariff_snapshot
estimated_cost
final_cost
created_at
updated_at

Important:
Store a tariff snapshot/value used for the session so future tariff changes do not rewrite historical billing.

## measurements

id
session_id
charger_id
timestamp
voltage nullable
current nullable
power_w nullable
energy_kwh nullable
frequency_hz nullable
power_factor nullable
additional_metrics JSONB if required

Do not add unsupported electrical metrics.

## tariffs

id
name
price_per_kwh
effective_from
effective_to nullable
status
created_at

## bills

id
bill_number
session_id
energy_kwh
tariff_rate
subtotal
tax nullable
total_amount
status
issued_at

## payments

id
payment_reference
user_id
session_id nullable
bill_id nullable
method
provider
provider_reference nullable
amount
currency
status
created_at
updated_at

Methods:
QR_UPI
RFID_WALLET
OTHER only if later required.

Statuses:
PENDING
AUTHORIZED
SUCCESS
FAILED
REFUNDED
CANCELLED

## wallets

id
user_id
balance
currency
status
created_at
updated_at

## wallet_transactions

id
wallet_id
type
amount
reference
session_id nullable
payment_id nullable
created_at

Types:
CREDIT
DEBIT
REFUND
ADJUSTMENT

## rfid_cards

id
user_id
uid_hash or securely represented UID
display_identifier
status
last_used_at
created_at

Do not expose raw RFID UID unnecessarily.

## faults

id
charger_id
session_id nullable
fault_code
fault_type
severity
message
occurred_at
cleared_at nullable
status
created_at

## notifications

id
user_id
type
title
message
read_at nullable
created_at

## audit_logs

Recommended for:
- Admin changes.
- Tariff changes.
- RFID block/unblock.
- Charger configuration changes.
- Payment/refund operations.

---

# 11. BILLING LOGIC

Basic formula:

energy_kwh × tariff_price_per_kwh = energy_charge

Final bill may later include taxes/fees if the final business model requires them.

Rules:

1. Energy must come from trusted measurement/session data.
2. Tariff must be captured for the session.
3. Do not calculate final bill from client-submitted values.
4. Recalculate on backend.
5. Store final bill.
6. Keep payment record separate.

---

# 12. PAYMENT ARCHITECTURE

## QR/UPI

Use provider abstraction:

interface PaymentProvider {
  createPayment(...)
  verifyPayment(...)
  handleWebhook(...)
  refund(...) // only if provider supports and business requires
}

Development:
MockPaymentProvider.

Production:
Provider-specific implementation.

Do not hard-code a provider until one is selected.

## RFID

Use authorization abstraction:

interface RfidAuthorizationProvider {
  authorize(cardIdentifier, chargerId)
  revoke(cardIdentifier)
  getCardStatus(cardIdentifier)
}

RFID flow:

RFID reader → device → backend authorization → user/wallet eligibility → session start.

The physical device should not require the website to be open.

---

# 13. REAL-TIME ARCHITECTURE

## Device to cloud

ESP32 → MQTT broker → Spring Boot MQTT consumer.

## Backend to browser

Spring Boot → WebSocket → Next.js.

## State handling

Redis:
- Current charger state.
- Current active session state.
- Last telemetry snapshot.
- Short-lived connection state.

PostgreSQL:
- Durable sessions.
- Bills.
- Payments.
- Historical measurements.
- Faults.
- Users.

Do not treat Redis as the source of truth for billing/history.

---

# 14. MQTT TOPIC CONVENTION

Use a consistent topic scheme. Exact broker/security configuration remains implementation-specific.

Recommended pattern:

ev/chargers/{chargerId}/telemetry
ev/chargers/{chargerId}/status
ev/chargers/{chargerId}/faults
ev/chargers/{chargerId}/rfid
ev/chargers/{chargerId}/commands
ev/chargers/{chargerId}/ack

Examples:

ev/chargers/CH-001/telemetry
ev/chargers/CH-001/status

Use authenticated device credentials and TLS in production.

Never allow an unauthenticated arbitrary client to publish charger control commands.

---

# 15. WEBSOCKET EVENTS

Recommended events:

charger.status.updated
charger.telemetry.updated
charging.session.started
charging.session.updated
charging.session.completed
charging.session.faulted
payment.updated
wallet.updated
rfid.updated
fault.created
fault.cleared
notification.created

Frontend should update only the relevant cached state instead of refetching the entire application on every telemetry message.

---

# 16. API CONTRACT STYLE

Use:
- /api/v1/... versioning if the project is intended for long-term evolution.
- Consistent HTTP status codes.
- Standard error body.

Example:

{
  "timestamp": "...",
  "status": 409,
  "code": "CHARGER_UNAVAILABLE",
  "message": "The charger is not available.",
  "path": "/api/v1/chargers/CH-001"
}

Never return stack traces to clients.

Validate:
- Request body.
- Path variables.
- Query parameters.
- Authorization.
- Ownership.

---

# 17. AUTHORIZATION

USER:
- Own profile.
- Own vehicles.
- Own wallet.
- Own RFID cards.
- Own sessions/bills.
- Start/stop only authorized sessions.

OPERATOR:
- Assigned/allowed chargers.
- Live monitoring.
- Faults.
- Sessions.
- Tariffs only if business rules allow.

ADMIN:
- Full platform administration.

Enforce authorization in backend, not only in frontend route guards.

---

# 18. FRONTEND STATE MANAGEMENT

Use a predictable data layer.

Recommended:
- Server state/query cache library if already used in the repository.
- Local React state for local UI.
- WebSocket updates to invalidate/update affected server state.

Avoid:
- One giant global state object.
- Storing sensitive tokens in unsafe browser locations.
- Polling every second when WebSocket is available.

---

# 19. MOCK MODE

Mock mode is mandatory until hardware/payment providers are available.

Mock data should simulate:

- Charger list.
- Charger status.
- Telemetry changes.
- Charging session start/stop.
- Energy accumulation.
- Billing.
- QR payment success/failure.
- RFID authorization.
- Fault state.
- Offline charger.

Mock mode must be easy to disable.

Example:

NEXT_PUBLIC_DATA_MODE=mock
BACKEND_DATA_MODE=mock

Do not mix mock and real data accidentally.

---

# 20. ERROR/EMPTY/OFFLINE STATES

Every data-dependent page must handle:

Loading:
"Loading charger data..."

Empty:
"No charging sessions yet."

Offline:
"Charger is offline. Last seen: ..."

Fault:
"Charging unavailable. A safety fault has been detected."

Payment pending:
"Payment verification is still pending."

Payment failed:
"Payment could not be verified. Charging has not been authorized."

Do not show false success.

---

# 21. SECURITY

Minimum:

- Password hashing using a modern password encoder.
- JWT/refresh-token design.
- HTTPS in production.
- Secure secrets via environment variables.
- CORS restrictions.
- Input validation.
- API authorization.
- Rate limiting where appropriate.
- MQTT authentication/TLS.
- No secrets in frontend source.
- No payment secret keys in frontend.
- Audit logs for privileged actions.
- Do not expose raw RFID UID unnecessarily.
- Sanitize/log carefully to avoid credential leakage.

---

# 22. OBSERVABILITY

Backend should log:

- Authentication events.
- Session lifecycle.
- Payment status.
- RFID authorization.
- Device connect/disconnect.
- Faults.
- Critical errors.

Metrics to consider:
- API latency.
- MQTT message rate.
- Connected devices.
- Active sessions.
- Payment success/failure.
- Fault rate.

---

# 23. PROJECT STRUCTURE

Recommended monorepo:

smart-ev-platform/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── public/
│
├── backend/
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── src/test/
│
├── iot/
│   ├── firmware/
│   ├── docs/
│   └── simulator/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── decisions/
│
├── docker-compose.yml
├── README.md
└── .env.example

If an existing repository already has a good structure, preserve it and adapt these boundaries instead of performing a needless rewrite.

---

# 24. ENVIRONMENT VARIABLES

Create .env.example files.

Frontend examples:

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_DATA_MODE=mock

Backend examples:

DB_URL=
DB_USERNAME=
DB_PASSWORD=
REDIS_URL=
MQTT_BROKER_URL=
MQTT_USERNAME=
MQTT_PASSWORD=
JWT_SECRET=
PAYMENT_PROVIDER=
PAYMENT_KEY_ID=
PAYMENT_KEY_SECRET=

Never commit real secrets.

---

# 25. TESTING REQUIREMENTS

## Frontend

Test:
- Route access.
- Forms.
- Loading states.
- Error states.
- Responsive layouts.
- Charging state rendering.
- Payment state rendering.

## Backend

Test:
- Auth.
- Role authorization.
- Session lifecycle.
- Billing calculations.
- Tariff snapshot.
- Payment state transitions.
- RFID blocking.
- Fault creation.
- Charger availability.

## Integration

Test:

ESP32/simulator
→ MQTT
→ backend
→ database/Redis
→ WebSocket
→ frontend.

## Critical scenarios

1. Charger available → user starts.
2. Charger becomes unavailable before start.
3. QR payment pending.
4. QR payment failed.
5. QR payment verified.
6. RFID active.
7. RFID blocked.
8. Wallet insufficient.
9. Charger disconnects.
10. Charger goes offline.
11. Fault occurs.
12. Internet disappears while charging.
13. Backend restarts.
14. Duplicate payment webhook.
15. Duplicate telemetry message.
16. Session stop request repeated.

---

# 26. IDEMPOTENCY

Payment webhooks can be duplicated.

Telemetry can be duplicated.

Session commands can be retried.

Therefore:

- Use unique provider references.
- Make payment webhook processing idempotent.
- Avoid creating duplicate sessions from repeated start requests.
- Use unique session/payment references.
- Make stop operation safe to repeat.

---

# 27. PERFORMANCE

Frontend:
- Lazy-load heavy admin/chart/map sections.
- Avoid unnecessary rerenders from telemetry.
- Throttle chart redraws if high-frequency telemetry is received.
- Keep mobile payloads small.

Backend:
- Index frequently queried columns.
- Paginate history.
- Do not return thousands of measurements in one response.
- Aggregate data for long-range charts.
- Use Redis for current state.
- Batch or aggregate high-frequency telemetry persistence if needed.

Database indexes should be based on actual queries.

---

# 28. DATA RETENTION

Do not assume unlimited high-frequency telemetry storage.

Design:
- Raw telemetry retention policy.
- Aggregated hourly/daily statistics.
- Session summaries kept long-term.

Exact retention period is an OPEN BUSINESS/OPERATIONS DECISION.

---

# 29. CHARGER STATE MACHINE

Minimum software states:

AVAILABLE
PREPARING
CONNECTED
CHARGING
PAUSED
COMPLETED
FAULT
OFFLINE
MAINTENANCE

Every transition should have a defined reason.

Example:

AVAILABLE → CONNECTED
reason = EV_CONNECTED

CONNECTED → CHARGING
reason = AUTHORIZED_AND_START_COMMAND_ACCEPTED

CHARGING → COMPLETED
reason = SESSION_STOPPED_OR_CHARGE_COMPLETED

CHARGING → FAULT
reason = SAFETY_FAULT

FAULT → AVAILABLE
only after defined recovery conditions are satisfied.

Do not invent electrical recovery conditions. Those must come from the final hardware/safety design.

---

# 30. CHARGING SESSION STATE MACHINE

CREATED
AUTHORIZED
STARTED
CHARGING
STOPPING
COMPLETED
FAILED
CANCELLED

Payment and charger state must not be treated as the same state machine.

---

# 31. BILLING RULES

Backend is authoritative.

For each session:

1. Determine measured energy.
2. Determine applicable tariff snapshot.
3. Calculate charge.
4. Store bill.
5. Apply configured payment/settlement flow.
6. Record payment status.
7. Generate receipt/invoice representation.

Never accept a client-submitted final amount as authoritative.

---

# 32. DESIGN PROTOTYPE CONTENT

Use the provided project diagrams as visual guidance:

- smart_ev_architecture_blueprint.png
- smart_ev_sitemap.png
- qr_rfid_payment_flow.png

They are architecture/UX direction, not pixel-perfect production designs.

UI implementation should preserve:
- Modern EV/energy feel.
- Deep navy + electric blue visual identity.
- Strong card hierarchy.
- Clear charging status.
- Clear payment method selection.
- High-quality mobile experience.

---

# 33. DEVELOPMENT PHASES

## Phase 1 — Foundation
- Repository setup.
- Frontend shell.
- Backend shell.
- Docker Compose.
- PostgreSQL.
- Environment configuration.
- Shared API conventions.

## Phase 2 — UX prototype
- Home.
- Auth.
- Dashboard.
- Charger list/details.
- Start charging.
- Live charging.
- History.
- Bills.
- Wallet/RFID.
- Admin screens.
- Mock data.

## Phase 3 — Backend domain
- Users.
- Roles.
- Chargers.
- Sessions.
- Billing.
- Tariffs.
- Wallet.
- RFID.
- Faults.
- Notifications.

## Phase 4 — Realtime
- MQTT.
- Device simulator.
- Redis.
- WebSocket.
- Live dashboard.

## Phase 5 — Payment
- Payment provider abstraction.
- Mock payment provider.
- Real provider only after provider credentials/spec are supplied.
- Webhook verification.
- Idempotency.

## Phase 6 — Hardware
- ESP32 telemetry.
- RFID.
- Local display.
- Charger control.
- Local safety integration.

## Phase 7 — End-to-end
- Full device-to-dashboard testing.
- Payment testing.
- Offline testing.
- Fault testing.

## Phase 8 — Production
- TLS.
- Secrets.
- Backups.
- Monitoring.
- Logging.
- Rate limits.
- Deployment.
- Recovery procedures.

---

# 34. DEFINITION OF DONE

The implementation is NOT complete merely because pages render.

A phase is complete only when:

- Code builds.
- Lint/type checks pass where applicable.
- Automated tests pass.
- Main flows work end-to-end.
- Loading/error/empty/offline states exist.
- Authorization is enforced server-side.
- Mock providers are isolated.
- No fake production telemetry is presented as real.
- No secrets are committed.
- Documentation is updated.
- Existing working functionality is preserved.

---

# 35. FINAL ACCEPTANCE CRITERIA

A complete MVP must satisfy:

1. User can register/login.
2. Role-based access works.
3. User can see chargers.
4. User can see charger status.
5. User can choose QR/UPI or RFID.
6. QR payment is verified server-side in the real integration.
7. RFID authorization works independently of an open website.
8. Charging session is created correctly.
9. Live telemetry updates without page refresh.
10. Energy is accumulated correctly.
11. Billing uses measured energy and tariff.
12. Payment status is separate from bill status.
13. RFID card can be blocked.
14. Faults are recorded.
15. Offline charger state is visible.
16. Operator can monitor chargers.
17. Admin can manage users/tariffs/chargers as authorized.
18. Website works on mobile and desktop.
19. Local safety logic does not depend on the website.
20. The complete system can run in mock mode without hardware.
21. Real providers can replace mock providers through interfaces.
22. No unsupported telemetry is shown.
23. Historical data is paginated/efficient.
24. Payment webhook handling is idempotent.
25. Documentation explains setup, environment variables, database migration, mock mode, deployment and testing.

---

# 36. OPEN DECISIONS — DO NOT GUESS

Before final production/hardware implementation, obtain:

1. Final electrical configuration.
2. Maximum charging power.
3. Maximum current.
4. EV/battery voltage range.
5. EV charging communication standard.
6. Exact sensor models.
7. Metering accuracy.
8. PFC implementation.
9. Protection/safety thresholds.
10. RFID reader/model/protocol.
11. Payment provider.
12. QR payment settlement model.
13. Wallet top-up model.
14. Final tariff rules.
15. MQTT broker/cloud.
16. Production hosting.
17. Domain.
18. Notification provider.
19. Data retention period.

Until these are supplied:
- implement abstractions,
- use mock/simulator providers,
- document assumptions,
- do not pretend the values are final.

---

# 37. AI AGENT BEHAVIOR

The coding agent must behave like a senior full-stack engineer.

It should:

- Inspect before editing.
- Plan before large changes.
- Prefer small verifiable increments.
- Preserve working code.
- Reuse existing components.
- Avoid unnecessary dependency changes.
- Explain blockers.
- Never invent missing requirements.
- Keep frontend/backend contracts synchronized.
- Write tests for critical business logic.
- Verify builds after changes.
- Update documentation after architectural changes.

When a requirement is ambiguous:
- If the ambiguity does not block implementation, choose the least risky reversible implementation and document it.
- If it affects safety, payment correctness, data integrity or architecture, stop and request clarification rather than guessing.

---

# 38. SOURCE FILES INCLUDED WITH THIS SPEC

The accompanying project package may contain:
- Smart_EV_Charging_Platform_Blueprint.pdf
- Smart_EV_Charging_Platform_Blueprint.docx
- smart_ev_architecture_blueprint.png
- smart_ev_sitemap.png
- qr_rfid_payment_flow.png

Use the blueprint as design context and this specification as the implementation contract.

---

# 39. FIRST TASK FOR THE AI AGENT

Do NOT immediately rewrite the project.

First:

1. Inspect repository.
2. Identify frontend/backend/IoT components already present.
3. Identify existing working features.
4. Identify technologies and versions.
5. Compare existing implementation against this specification.
6. Produce a concise implementation gap report:
   - Already implemented.
   - Partially implemented.
   - Missing.
   - Conflicting.
   - Risky/unsafe.
7. Then propose the implementation sequence.
8. Only after that begin coding.

The first implementation milestone should normally be a complete, polished frontend using mock data, while keeping the architecture ready for the Spring Boot/MQTT/payment integrations.

