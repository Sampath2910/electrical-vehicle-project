import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role, assignedStationId, operatorBadgeId, vehicleModel, adminMasterKey } = body;

    const sanitizedName = (name || '').trim();
    const sanitizedEmail = (email || '').trim().toLowerCase();
    const sanitizedPhone = (phone || '').trim();

    if (!sanitizedEmail || !password || !sanitizedName) {
      return NextResponse.json(
        { error: 'Name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    // Role-specific validations
    if (role === 'ADMIN') {
      const cleanKey = (adminMasterKey || '').trim();
      if (cleanKey !== 'ADMIN2026' && cleanKey !== 'smartev-admin') {
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
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone || '+91 00000 00000',
      password: typeof password === 'string' ? password.trim() : password,
      role: role || 'USER',
      assignedStationId,
      operatorBadgeId: operatorBadgeId ? operatorBadgeId.trim() : (role === 'OPERATOR' ? `OP-${Math.floor(100 + Math.random() * 900)}` : undefined),
      vehicleModel,
    });

    // Best-effort forward to Spring Boot backend if running
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone || '+91 00000 00000',
          password,
          role: role || 'USER',
          assignedStationId,
          operatorBadgeId: newUser.operatorBadgeId,
          vehicleModel,
        }),
        signal: AbortSignal.timeout(1000),
      });
    } catch {
      // Backend offline or user exists in backend, local DB is authoritative
    }

    const mockJwt = `mock_jwt_${newUser.id}_${Date.now()}`;
    const response = NextResponse.json({
      success: true,
      message: 'Account successfully registered and authenticated.',
      user: newUser,
      token: mockJwt,
    });

    // Set secure HttpOnly JWT cookie so middleware permits immediate route navigation
    response.cookies.set('jwt_token', mockJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during registration.' },
      { status: 400 }
    );
  }
}
