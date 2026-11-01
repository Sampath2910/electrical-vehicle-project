import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const operatorId = searchParams.get('operatorId');
    const identifier = stationId || operatorId;

    if (!identifier) {
      return NextResponse.json(
        { error: 'stationId or operatorId parameter is required.' },
        { status: 400 }
      );
    }

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
