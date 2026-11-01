import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const stations = db.getChargers();
    return NextResponse.json({ success: true, stations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { stationId, status, operatorId, powerRating } = body;

    if (!stationId) {
      return NextResponse.json({ error: 'Station ID is required.' }, { status: 400 });
    }

    // 1. Persist changes reliably in local JSON database
    if (status) {
      db.updateChargerStatus(stationId, status);
    }

    if (powerRating !== undefined) {
      db.updateChargerRating(stationId, Number(powerRating));
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
