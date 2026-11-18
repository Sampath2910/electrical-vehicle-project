import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const maxDuration = 20;

/**
 * Lightweight health / warm-up endpoint.
 *
 * Pings a cheap public backend endpoint so the Spring Boot service (which may be
 * on a free tier that sleeps) can be woken up and kept warm. A scheduled job that
 * hits this every few minutes largely eliminates login cold-starts. Also usable as
 * an uptime probe: it reports backend reachability and latency without leaking any
 * internal details.
 */
export async function GET() {
  const startedAt = Date.now();
  let backendOk = false;
  let backendStatus: number | null = null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/tariffs`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    backendStatus = res.status;
    backendOk = res.ok;
  } catch {
    backendOk = false;
  }

  const latencyMs = Date.now() - startedAt;

  return NextResponse.json(
    {
      frontend: 'ok',
      backendReachable: backendOk,
      backendStatus,
      latencyMs,
      checkedAt: new Date().toISOString(),
    },
    { status: 200 }
  );
}
