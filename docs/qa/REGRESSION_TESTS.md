# Regression Testing Guide & Test Suite (REGRESSION_TESTS.md)

**Project:** Smart EV Charging Platform (2-Wheeler Fleet & Battery Swapping Network)  
**Maintained By:** Automated QA & Full-Stack Engineering Team  

---

## 1. Regression Test Suite Overview
To ensure that future enhancements do not reintroduce previously resolved defects, this suite documents the exact reproduction scenarios, automated guards, and execution commands.

---

## 2. Regression Cases & Verification Matrix

### REG-001: Admin Operators Table Mapping
* **Target File:** `frontend/src/app/admin/operators/page.tsx`
* **Defect Prevented:** `TypeError: Cannot read properties of undefined (reading 'length')`
* **Automated Guard:**
  ```typescript
  const stationList = data.stations || data.chargers || [];
  const operatorList = data.operators || [];
  setStations(stationList);
  setOperators(operatorList);
  ```
* **Rerun Command:** Navigate to `http://localhost:3000/admin/operators` after admin login.
* **Verification Criteria:** Table renders without console errors; operator badges and reassignment dropdowns display items.

---

### REG-002: Null-Safe Station Filtering
* **Target File:** `frontend/src/app/chargers/page.tsx`
* **Defect Prevented:** `TypeError: Cannot read properties of null (reading 'toLowerCase')`
* **Automated Guard:**
  ```typescript
  const q = searchQuery.toLowerCase();
  const matchesSearch = (charger.name || '').toLowerCase().includes(q) || 
                        (charger.location || '').toLowerCase().includes(q) ||
                        (charger.chargerCode || '').toLowerCase().includes(q);
  ```
* **Rerun Command:** Enter random strings, special characters, and numbers in the search input on `/chargers`.
* **Verification Criteria:** Stations list updates cleanly without crashing.

---

### REG-003: Dynamic Route 404 Guards
* **Target Files:** `frontend/src/app/chargers/[id]/page.tsx` & `frontend/src/app/bills/[id]/page.tsx`
* **Defect Prevented:** Uncaught exceptions when accessing non-existent IDs directly via browser URL bar.
* **Automated Guard:**
  ```typescript
  if (!charger) {
    return <ChargerNotFoundView />;
  }
  ```
* **Rerun Command:** Open `http://localhost:3000/chargers/invalid-code-12345` and `http://localhost:3000/bills/unknown-id`.
* **Verification Criteria:** Clean fallback card renders with return navigation button.

---

### REG-004: Next.js Cookie to Spring Boot Bearer Token Proxy
* **Target Files:** `frontend/src/app/api/admin/stats/route.ts` & `frontend/src/app/api/operator/stats/route.ts`
* **Defect Prevented:** 401 Unauthorized errors on server-side Next.js route handlers.
* **Automated Guard:**
  ```typescript
  const token = (await cookies()).get('jwt_token')?.value;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  ```
* **Rerun Command:**
  ```powershell
  curl.exe -s -H "Cookie: jwt_token=<valid_token>" http://localhost:3000/api/admin/stats
  ```
* **Verification Criteria:** Returns HTTP 200 with `{ "success": true, ... }`.

---

### REG-005: In-Page Save Operator Modal & Admin Session Protection
* **Target Files:** `frontend/src/app/admin/operators/page.tsx`, `frontend/src/app/api/stations/route.ts`
* **Defect Prevented:** HTTP 500 on operator reassignment when backend is offline and Admin session logout on register.
* **Automated Guard:**
  ```typescript
  // In-page modal with local DB fallback and session check
  if (currentUser?.role === 'ADMIN') {
    router.push('/admin/operators');
  }
  ```
* **Rerun Command:** Open `/admin/operators`, click `+ Register New Operator`, fill form and click "Save Operator".
* **Verification Criteria:** Success toast displayed, operator added to table, admin remains logged in.

---

### REG-006: Indian Rupee (`₹`) Symbol Integrity
* **Target Files:** `frontend/src/app/admin/page.tsx`, `frontend/src/app/operator/page.tsx`, `frontend/src/app/admin/analytics/page.tsx`
* **Defect Prevented:** Accidental reversion to Dollar sign (`$`) in revenue KPI cards.
* **Automated Guard:**
  ```tsx
  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
    <IndianRupee className="w-5 h-5" />
  </div>
  ```
* **Rerun Command:** Run `node -e "const fs = require('fs'); const code = fs.readFileSync('frontend/src/app/admin/page.tsx', 'utf8'); if (code.includes('DollarSign')) process.exit(1);"`
* **Verification Criteria:** Zero occurrences of `DollarSign` across financial cards.

---

### REG-007: Fault-Tolerant Offline Authentication
* **Target File:** `frontend/src/app/api/auth/login/route.ts`
* **Defect Prevented:** HTTP 503 service unavailable on login when Spring Boot port 8080 is unreachable.
* **Automated Guard:**
  ```typescript
  catch (backendError) {
    const user = db.getUserByEmail(email);
    // fallback auth logic
  }
  ```
* **Rerun Command:** `POST http://localhost:3000/api/auth/login` with `{"email":"admin@smartev.com","password":"admin123"}`.
* **Verification Criteria:** Returns HTTP 200 with JWT cookie even if port 8080 is offline.

---

## 3. How to Rerun Full Regression Suite

Execute the following commands sequentially:

```powershell
# 1. Validate Spring Boot backend compilation
cd "c:\Users\akkap\OneDrive\Desktop\EV-2 project\electrical-vehicle-project-main\backend"
mvn clean compile

# 2. Validate Next.js frontend TypeScript types
cd "c:\Users\akkap\OneDrive\Desktop\EV-2 project\electrical-vehicle-project-main\frontend"
npx tsc --noEmit

# 3. Test public stations API endpoint
curl.exe -s http://localhost:3000/api/stations | ConvertFrom-Json | Select-Object -ExpandProperty stations

# 4. Check live browser console for runtime warnings
# Open Chrome Developer Tools -> Console on http://localhost:3000/admin/operators
```

---

## 4. Remaining Regression Risks
1. **Database Schema Drift:** When adding new entity fields in `domain/`, ensure matching fields are added to both DTOs (`com.smart.ev.dto`) and TypeScript interfaces (`src/types/ev.ts`).
2. **Token Expiration in Client State:** When `jwt_token` expires (24h validity), ensure client-side state is cleared and the user is redirected gracefully to `/auth/login`.
