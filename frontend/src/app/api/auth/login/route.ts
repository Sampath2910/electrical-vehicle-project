import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, expectedRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const userWithPassword = db.getUserByEmail(email);
    if (!userWithPassword) {
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 401 }
      );
    }

    if (userWithPassword.passwordHash !== password) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify and try again.' },
        { status: 401 }
      );
    }

    if (expectedRole && userWithPassword.role !== expectedRole) {
      return NextResponse.json(
        { 
          error: `Access Denied: This account is registered as ${userWithPassword.role}, but you are attempting to login to the ${expectedRole} portal.` 
        },
        { status: 403 }
      );
    }

    const { passwordHash, ...safeUser } = userWithPassword;

    // If operator, fetch station info
    let assignedStation = null;
    if (safeUser.role === 'OPERATOR' && safeUser.assignedStationId) {
      assignedStation = db.getChargerById(safeUser.assignedStationId);
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      assignedStation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
