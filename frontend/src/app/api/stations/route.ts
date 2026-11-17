import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const stations = db.getChargers();
    return NextResponse.json({ success: true, stations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

const VALID_CHARGER_STATUSES = new Set([
  'AVAILABLE',
  'PREPARING',
  'CONNECTED',
  'CHARGING',
  'PAUSED',
  'MAINTENANCE',
  'FAULT',
  'OFFLINE',
]);

export async function PATCH(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'ADMIN' && session.role !== 'OPERATOR') {
    return NextResponse.json({ error: 'Forbidden: Operator or Administrator access required.' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
  }

  try {
    const { stationId, status, operatorId, powerRating, pricePerKwh, action } = body;

    if (!stationId) {
      return NextResponse.json({ error: 'Station ID is required.' }, { status: 400 });
    }

    if (status !== undefined && !VALID_CHARGER_STATUSES.has(String(status))) {
      return NextResponse.json({ error: `Invalid charger status: ${status}` }, { status: 400 });
    }

    if (powerRating !== undefined) {
      const ratingNum = Number(powerRating);
      if (!Number.isFinite(ratingNum) || ratingNum <= 0 || ratingNum > 50) {
        return NextResponse.json({ error: 'Power rating must be a positive number between 0.1 and 50 kW.' }, { status: 400 });
      }
    }

    if (pricePerKwh !== undefined) {
      const priceNum = Number(pricePerKwh);
      if (!Number.isFinite(priceNum) || priceNum <= 0 || priceNum > 500) {
        return NextResponse.json({ error: 'Tariff pricePerKwh must be a positive number.' }, { status: 400 });
      }
    }

    // Operators may only manage their own assigned station and cannot reassign operators
    if (session.role === 'OPERATOR') {
      if (operatorId !== undefined) {
        return NextResponse.json(
          { error: 'Forbidden: Only Fleet Administrators can reassign station operators.' },
          { status: 403 }
        );
      }
      const liveOp = db.getUserById(session.userId);
      const boundStationId = liveOp?.assignedStationId || session.assignedStationId;
      const boundCharger = boundStationId ? db.getChargerById(boundStationId) : undefined;
      const allowed = [boundStationId, boundCharger?.id, boundCharger?.chargerCode].filter(Boolean);
      if (!allowed.includes(stationId)) {
        return NextResponse.json(
          { error: 'Forbidden: Operators can only modify their own assigned charging station.' },
          { status: 403 }
        );
      }
    }

    // 1. Clear history action for dedicated station operator
    if (action === 'clear_history') {
      db.clearSessionsByStationId(stationId);
      return NextResponse.json({ success: true, message: `History cleared for station ${stationId}` });
    }

    // 2. Persist changes reliably in local JSON database
    if (status) {
      db.updateChargerStatus(stationId, status);
    }

    if (powerRating !== undefined) {
      db.updateChargerRating(stationId, Number(powerRating), pricePerKwh !== undefined ? Number(pricePerKwh) : undefined);
    }

    if (operatorId !== undefined) {
      if (operatorId === 'none' || operatorId === 'unassigned' || operatorId === '') {
        db.unassignOperatorFromStation(stationId);
      } else {
        db.assignOperatorToStation(stationId, operatorId);
      }
    }

    const updatedStation = db.getChargerById(stationId);

    // 2. Best-effort forward to Spring Boot backend if running
    try {
      if (status) {
        await fetch(`${BACKEND_URL}/api/v1/chargers/${stationId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
          signal: AbortSignal.timeout(1500),
        });
      }

      if (powerRating !== undefined) {
        await fetch(`${BACKEND_URL}/api/v1/chargers/${stationId}/rating`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ powerRating: Number(powerRating) }),
          signal: AbortSignal.timeout(1500),
        });
      }

      if (operatorId && operatorId !== 'none' && operatorId !== 'unassigned') {
        await fetch(`${BACKEND_URL}/api/v1/chargers/${stationId}/operator`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operatorId }),
          signal: AbortSignal.timeout(1500),
        });
      }
    } catch {
      // Backend offline, local database is authoritative
    }

    return NextResponse.json({ success: true, station: updatedStation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
