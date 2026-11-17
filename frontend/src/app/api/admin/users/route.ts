import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Administrator access required.' }, { status: 403 });
  }

  try {
    const users = db.getUsers();
    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve registered users.' },
      { status: 500 }
    );
  }
}

