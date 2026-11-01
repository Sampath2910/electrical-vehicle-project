import http from 'http';

const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8080';

const routes = [
  '/',
  '/features',
  '/how-it-works',
  '/auth/login',
  '/auth/login/admin',
  '/auth/login/operator',
  '/auth/login/user',
  '/auth/register',
  '/auth/register/admin',
  '/auth/register/operator',
  '/auth/register/user',
  '/dashboard',
  '/chargers',
  '/chargers/ch-101',
  '/charging/start',
  '/wallet',
  '/history',
  '/bills',
  '/rfid',
  '/vehicles',
  '/notifications',
  '/profile',
  '/settings',
  '/operator',
  '/admin',
  '/admin/analytics',
  '/admin/chargers',
  '/admin/chargers/ch-101',
  '/admin/faults',
  '/admin/live',
  '/admin/operators',
  '/admin/payments',
  '/admin/sessions',
  '/admin/settings',
  '/admin/tariffs',
  '/admin/users',
  '/api/stations',
  '/api/admin/stats',
  '/api/operator/stats?stationId=ch-101'
];

async function testRoute(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Accept': 'text/html,application/json' },
      signal: AbortSignal.timeout(4000)
    });
    return { path, status: res.status, ok: res.status === 200 || res.status === 307 || res.status === 308 };
  } catch (err) {
    return { path, status: 0, error: err.message, ok: false };
  }
}

async function testBackendEndpoint(path, token = null) {
  try {
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BACKEND_URL}${path}`, {
      headers,
      signal: AbortSignal.timeout(4000)
    });
    return { path: `[BE] ${path}`, status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (err) {
    return { path: `[BE] ${path}`, status: 0, error: err.message, ok: false };
  }
}

async function run() {
  console.log('=== STARTING COMPREHENSIVE ENDPOINT & ROUTE AUDIT ===\n');
  let passed = 0;
  let failed = 0;

  for (const r of routes) {
    const res = await testRoute(r);
    if (res.ok) {
      console.log(`[PASS] ${res.status} - ${res.path}`);
      passed++;
    } else {
      console.error(`[FAIL] ${res.status} - ${res.path} (${res.error || 'Unexpected status'})`);
      failed++;
    }
  }

  // Login to Spring Boot to get JWT
  let jwtToken = null;
  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartev.com', password: 'admin123', expectedRole: 'ADMIN' })
    });
    const loginData = await loginRes.json();
    if (loginData.token) jwtToken = loginData.token;
  } catch (e) {
    console.warn('Backend login warning:', e.message);
  }

  const beRoutes = [
    { path: '/api/v1/chargers', auth: false },
    { path: '/api/v1/tariffs', auth: false },
    { path: '/api/v1/admin/stats', auth: true }
  ];

  for (const r of beRoutes) {
    const res = await testBackendEndpoint(r.path, r.auth ? jwtToken : null);
    if (res.ok) {
      console.log(`[PASS] ${res.status} - ${res.path} (Auth: ${r.auth ? 'JWT Validated' : 'Public'})`);
      passed++;
    } else {
      console.error(`[FAIL] ${res.status} - ${res.path} (${res.error || 'Unexpected status'})`);
      failed++;
    }
  }

  console.log(`\n=== AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED ===`);
}

run();
