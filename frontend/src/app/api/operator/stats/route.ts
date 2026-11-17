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
  if (session.role !== 'OPERATOR' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Operator or Administrator access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const requestedStationId = searchParams.get('stationId');
    const requestedOperatorId = searchParams.get('operatorId');

    // Enforce strict station isolation for OPERATOR accounts
    let identifier = requestedStationId || requestedOperatorId;
    if (session.role === 'OPERATOR') {
      const liveOp = db.getUserById(session.userId);
      const boundStationId = liveOp?.assignedStationId || session.assignedStationId;
      if (!boundStationId) {
        return NextResponse.json(
          { error: 'No charging station is currently assigned to your operator account.' },
          { status: 403 }
        );
      }
      const boundCharger = db.getChargerById(boundStationId);
      const allowedIds = new Set(
        [boundStationId, boundCharger?.id, boundCharger?.chargerCode, session.userId].filter(Boolean)
      );
      if (requestedStationId && !allowedIds.has(requestedStationId)) {
        return NextResponse.json(
          { error: 'Forbidden: Operators may only access their own assigned station.' },
          { status: 403 }
        );
      }
      identifier = boundStationId;
    }

    if (!identifier) {
      return NextResponse.json(
        { error: 'stationId or operatorId parameter is required.' },
        { status: 400 }
      );
    }
    const stationId = session.role === 'OPERATOR' ? identifier : requestedStationId;
    const operatorId = session.role === 'OPERATOR' ? null : requestedOperatorId;

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('jwt_token')?.value;
      const authHeader = request.headers.get('authorization') || (token ? `Bearer ${token}` : '');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authHeader) headers['Authorization'] = authHeader;

      const queryParam = stationId ? `stationId=${encodeURIComponent(stationId)}` : `operatorId=${encodeURIComponent(operatorId!)}`;
      const res = await fetch(`${BACKEND_URL}/api/v1/operator/stats?${queryParam}`, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(1500),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          ...data,
          success: true,
        });
      }
    } catch {
      // Backend offline, fall through to local DB
    }

    const data = db.getOperatorStats(identifier);
    if (!data) {
      return NextResponse.json(
        { error: 'No station matching the given stationId/operatorId was found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...data,
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
