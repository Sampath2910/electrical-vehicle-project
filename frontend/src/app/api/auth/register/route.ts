import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest, signSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      role,
      assignedStationId,
      operatorBadgeId,
      vehicleModel,
      adminMasterKey,
      skipSessionCookie,
    } = body;

    const sanitizedName = (name || '').trim();
    const sanitizedEmail = (email || '').trim().toLowerCase();
    const sanitizedPhone = (phone || '').trim();
    const targetRole = (role || 'USER') as 'USER' | 'OPERATOR' | 'ADMIN';

    if (!sanitizedEmail || !password || !sanitizedName) {
      return NextResponse.json(
        { error: 'Name, email, and password are required fields.' },
        { status: 400 }
      );
    }

    if (!['USER', 'OPERATOR', 'ADMIN'].includes(targetRole)) {
      return NextResponse.json(
        { error: 'Invalid account role.' },
        { status: 400 }
      );
    }

    // Role-specific validations
    if (targetRole === 'ADMIN') {
      const cleanKey = (adminMasterKey || '').trim();
      if (cleanKey !== 'ADMIN2026' && cleanKey !== 'smartev-admin') {
        return NextResponse.json(
          { error: 'Invalid Admin Master Passcode. Contact system administrator.' },
          { status: 403 }
        );
      }
    }

    if (targetRole === 'OPERATOR') {
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
      role: targetRole,
      assignedStationId,
      operatorBadgeId: operatorBadgeId ? operatorBadgeId.trim() : (targetRole === 'OPERATOR' ? `OP-${Math.floor(100 + Math.random() * 900)}` : undefined),
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
          role: targetRole,
          assignedStationId: newUser.assignedStationId,
          operatorBadgeId: newUser.operatorBadgeId,
          vehicleModel,
        }),
        signal: AbortSignal.timeout(1000),
      });
    } catch {
      // Backend offline or user exists in backend, local DB is authoritative
    }

    // Check if an existing ADMIN is provisioning another account (preserve admin cookie)
    const callerSession = skipSessionCookie ? await getSessionFromRequest(request) : null;
    const preserveAdminSession = Boolean(skipSessionCookie && callerSession?.role === 'ADMIN');

    const signedToken = await signSessionToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
      assignedStationId: newUser.assignedStationId,
    });

    const response = NextResponse.json({
      success: true,
      message: preserveAdminSession
        ? 'Account provisioned successfully.'
        : 'Account successfully registered and authenticated.',
      user: newUser,
      token: preserveAdminSession ? undefined : signedToken,
    });

    if (!preserveAdminSession) {
      response.cookies.set('jwt_token', signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    const status = typeof err?.statusCode === 'number' ? err.statusCode : 400;
    return NextResponse.json(
      { error: err.message || 'Internal server error during registration.' },
      { status }
    );
  }
}
