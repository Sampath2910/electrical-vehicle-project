import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role, assignedStationId, operatorBadgeId, vehicleModel, adminMasterKey } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    // Role-specific validations
    if (role === 'ADMIN') {
      if (adminMasterKey !== 'ADMIN2026' && adminMasterKey !== 'smartev-admin') {
        return NextResponse.json(
          { error: 'Invalid Admin Master Passcode. Contact system administrator.' },
          { status: 403 }
        );
      }
    }

    if (role === 'OPERATOR') {
      if (!assignedStationId) {
        return NextResponse.json(
          { error: 'Station selection is required for Operator accounts.' },
          { status: 400 }
        );
      }
    }

    const newUser = db.createUser({
      name,
      email,
      phone,
      password,
      role: role || 'USER',
      assignedStationId,
      operatorBadgeId: operatorBadgeId || (role === 'OPERATOR' ? `OP-${Math.floor(100 + Math.random() * 900)}` : undefined),
      vehicleModel,
    });

    // Best-effort forward to Spring Boot backend if running
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || '+91 00000 00000',
          password,
          role: role || 'USER',
          assignedStationId,
          operatorBadgeId: newUser.operatorBadgeId,
          vehicleModel,
        }),
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      // Backend offline or user exists in backend, local DB is authoritative
    }

    return NextResponse.json({
      success: true,
      message: 'Account successfully registered.',
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during registration.' },
      { status: 400 }
    );
  }
}
