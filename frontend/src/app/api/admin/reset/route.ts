import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Administrator access required.' }, { status: 403 });
  }

  try {
    const data = db.factoryReset();

    if (BACKEND_URL) {
      try {
        await fetch(`${BACKEND_URL}/api/v1/admin/reset-db`, {
          method: 'POST',
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        // Backend offline or best effort
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All platform data, sessions, meter counters, and transient test accounts have been purged successfully to Day-Zero state.',
      data: {
        chargersCount: data.chargers.length,
        usersCount: data.users.length,
        sessionsCount: data.sessions.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to execute factory data reset.' },
      { status: 500 }
    );
  }
}

