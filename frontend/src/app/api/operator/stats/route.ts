import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const operatorId = searchParams.get('operatorId');

    const identifier = stationId || operatorId;
    if (!identifier) {
      return NextResponse.json(
        { error: 'stationId or operatorId query parameter is required.' },
        { status: 400 }
      );
    }

    const data = db.getOperatorStats(identifier);
    if (!data) {
      return NextResponse.json(
        { error: 'No station matching the given stationId/operatorId was found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
