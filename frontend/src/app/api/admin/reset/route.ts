import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
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

