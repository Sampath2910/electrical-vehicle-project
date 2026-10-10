import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const chargers = db.getChargers();
    return NextResponse.json({ success: true, stations: chargers });
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

    if (status) {
      db.updateChargerStatus(stationId, status);
    }

    if (powerRating !== undefined) {
      db.updateChargerRating(stationId, Number(powerRating));
    }

    if (operatorId) {
      db.assignOperatorToStation(stationId, operatorId);
    }

    const updated = db.getChargerById(stationId);
    return NextResponse.json({ success: true, station: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
