import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

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

