import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const state = db.getUserState(session.userId, session.role);
    return NextResponse.json({ success: true, ...state });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load user state.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'topup_wallet') {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
        return NextResponse.json({ error: 'Invalid top-up amount.' }, { status: 400 });
      }
      const result = db.topUpWallet(session.userId, amount);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'add_vehicle') {
      const v = body.vehicle;
      if (!v || !v.model || !v.registration) {
        return NextResponse.json({ error: 'Vehicle model and registration are required.' }, { status: 400 });
      }
      const created = db.addVehicle(session.userId, {
        model: String(v.model).trim(),
        registration: String(v.registration).trim(),
        connectorType: v.connectorType || 'Standard 16A Socket',
        batteryCapacityKwh: Number(v.batteryCapacityKwh) || 3.7,
        vehicleType: v.vehicleType || 'SCOOTER',
        isBatterySwappable: Boolean(v.isBatterySwappable),
        imageUrl: v.imageUrl,
        ridingRangeKm: v.ridingRangeKm ? Number(v.ridingRangeKm) : undefined,
      });
      return NextResponse.json({ success: true, vehicle: created });
    }

    if (action === 'start_session') {
      const newSession = body.session;
      if (!newSession || !newSession.id || !newSession.chargerId) {
        return NextResponse.json({ error: 'Session details are required.' }, { status: 400 });
      }
      const charger = db.getChargerById(newSession.chargerId);
      if (!charger) {
        return NextResponse.json({ error: 'Charger not found.' }, { status: 404 });
      }
      if (charger.status === 'FAULT' || charger.status === 'OFFLINE') {
        return NextResponse.json({ error: `Cannot start session: Station is currently ${charger.status}` }, { status: 400 });
      }
      const result = db.startSession({
        ...newSession,
        userId: session.userId,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'stop_session') {
      const { sessionId, energyKwh, durationSeconds, penaltyApplies } = body;
      if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
      }
      const result = db.stopSession(
        session.userId,
        session.role,
        sessionId,
        Number(energyKwh) || 0,
        Number(durationSeconds) || 0,
        Boolean(penaltyApplies)
      );
      if (!result) {
        return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (err: any) {
    const status = typeof err?.statusCode === 'number' ? err.statusCode : 500;
    return NextResponse.json({ error: err.message || 'Failed to persist user state.' }, { status });
  }
}

