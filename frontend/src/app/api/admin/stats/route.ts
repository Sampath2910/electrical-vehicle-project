import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Administrator access required.' }, { status: 403 });
  }

  try {
    const localStats = db.getAdminStats();

    try {
      const cookieStore = await cookies();
      // Prefer the backend's own JWT for authenticating to Spring Boot; the
      // frontend session token (jwt_token) is not valid at the backend.
      const backendToken = cookieStore.get('backend_jwt')?.value || cookieStore.get('jwt_token')?.value;
      const authHeader = request.headers.get('authorization') || (backendToken ? `Bearer ${backendToken}` : '');

      if (authHeader) {
        const res = await fetch(`${BACKEND_URL}/api/v1/admin/stats`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(1500),
        });

        if (res.ok) {
          const backendStats = await res.json();
          const allOperators = [...localStats.operators];
          if (Array.isArray(backendStats.operators)) {
            backendStats.operators.forEach((bOp: any) => {
              if (!allOperators.some(lOp => lOp.id === bOp.id || (lOp.email && bOp.email && lOp.email.toLowerCase() === bOp.email.toLowerCase()))) {
                allOperators.push(bOp);
              }
            });
          }

          return NextResponse.json({
            ...backendStats,
            stations: localStats.stations,
            operators: allOperators,
            totalOperators: allOperators.length,
            totalStations: localStats.stations.length,
            success: true,
          });
        }
      }
    } catch {
      // Fall through to local DB
    }

    return NextResponse.json({
      ...localStats,
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
