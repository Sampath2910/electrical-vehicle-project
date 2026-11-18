import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest, signSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  try {
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

    const sanitizedName = (name || '').toString().trim();
    const sanitizedEmail = (email || '').toString().trim().toLowerCase();
    const sanitizedPhone = (phone || '').toString().trim();
    const sanitizedPassword = (password || '').toString().trim();
    const targetRole = (role || 'USER') as 'USER' | 'OPERATOR' | 'ADMIN';

    if (!sanitizedEmail || !sanitizedPassword || !sanitizedName) {
      return NextResponse.json(
        { error: 'Name, email, and a non-empty password are required fields.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
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

    // 1. Authoritative registration via Spring Boot backend if configured
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    let backendUser: any = null;
    let backendToken: string | null = null;

    if (BACKEND_URL) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone || '+91 00000 00000',
            password,
            role: targetRole,
            assignedStationId,
            operatorBadgeId: operatorBadgeId ? operatorBadgeId.trim() : (targetRole === 'OPERATOR' ? `OP-${Math.floor(100 + Math.random() * 900)}` : undefined),
            vehicleModel,
          }),
          signal: AbortSignal.timeout(8000),
        });

        const backendData = await backendRes.json();
        if (backendRes.ok && backendData.success) {
          backendUser = backendData.user;
          backendToken = backendData.token;
        } else if (backendData.error && backendData.error.toLowerCase().includes('already exists')) {
          return NextResponse.json(
            { error: 'An account with this email address already exists. Please sign in instead.' },
            { status: 409 }
          );
        }
      } catch {
        // Backend offline or timeout; fallback to local DB
      }
    }

    // 2. Local DB persistence (best-effort or fallback)
    let localUser: any = null;
    try {
      localUser = db.createUser({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone || '+91 00000 00000',
        password: typeof password === 'string' ? password.trim() : password,
        role: targetRole,
        assignedStationId,
        operatorBadgeId: operatorBadgeId ? operatorBadgeId.trim() : (targetRole === 'OPERATOR' ? `OP-${Math.floor(100 + Math.random() * 900)}` : undefined),
        vehicleModel,
      });
    } catch (dbErr: any) {
      if (!backendUser) {
        throw dbErr;
      }
    }

    const resolvedUser = backendUser || localUser;

    // Check if an existing ADMIN is provisioning another account (preserve admin cookie)
    const callerSession = skipSessionCookie ? await getSessionFromRequest(request) : null;
    const preserveAdminSession = Boolean(skipSessionCookie && callerSession?.role === 'ADMIN');

    // IMPORTANT: Always mint OUR OWN signed session token for the cookie. The Spring
    // Boot backend's HS384 JWT (backendToken) is NOT verifiable by the frontend
    // middleware / auth layer (src/lib/auth.ts), so storing it would leave the newly
    // registered user unable to open any protected page. (backendToken is still
    // stored in a separate backend_jwt cookie below for backend proxying.)
    const signedToken = await signSessionToken({
      userId: resolvedUser.id,
      role: resolvedUser.role,
      email: resolvedUser.email,
      assignedStationId: resolvedUser.assignedStationId,
    });

    const response = NextResponse.json({
      success: true,
      message: preserveAdminSession
        ? 'Account provisioned successfully.'
        : 'Account successfully registered and authenticated.',
      user: resolvedUser,
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

      // Keep the backend's own JWT alongside so server-side admin/operator routes
      // can authenticate to the Spring Boot backend on this user's behalf.
      if (backendToken) {
        response.cookies.set('backend_jwt', backendToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 86400,
          path: '/',
        });
      }
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
