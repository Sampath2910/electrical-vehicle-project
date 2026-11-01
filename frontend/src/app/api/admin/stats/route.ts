import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: Request) {
  try {
    const localStats = db.getAdminStats();

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('jwt_token')?.value;
      const authHeader = request.headers.get('authorization') || (token ? `Bearer ${token}` : '');

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
