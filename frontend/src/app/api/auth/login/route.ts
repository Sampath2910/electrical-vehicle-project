import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signSessionToken } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, email, username, phone, password, expectedRole } = body;

    const rawId = (identifier || email || username || phone || '').toString().trim();
    const cleanPassword = (password || '').toString().trim();

    // 1. Validation for empty / missing fields
    if (!rawId && !cleanPassword) {
      return NextResponse.json(
        { error: 'Please enter your Email/Username/Phone and Password to sign in.' },
        { status: 400 }
      );
    }
    if (!rawId) {
      return NextResponse.json(
        { error: 'Please enter your Email, Username, or Mobile Number.' },
        { status: 400 }
      );
    }
    if (!cleanPassword) {
      return NextResponse.json(
        { error: 'Please enter your account password.' },
        { status: 400 }
      );
    }

    // 2. Authoritative Local Database Lookup
    const user = db.getUserByIdentifier(rawId);

    if (user) {
      // Strictly validate against this specific account's stored password (no universal backdoors)
      const isPasswordValid = (
        user.passwordHash === cleanPassword ||
        (user as any).password === cleanPassword
      );

      if (!isPasswordValid) {
        // EXACT ERROR: Account exists, but password was incorrect
        return NextResponse.json(
          { error: 'Incorrect password. Please verify your password and try again.' },
          { status: 401 }
        );
      }

      // Password is correct — authenticate and issue signed role-bearing session token
      const { passwordHash, ...safeUser } = user;
      const signedJwt = await signSessionToken({
        userId: user.id,
        role: user.role,
        email: user.email,
        assignedStationId: user.assignedStationId,
      });
      const targetRedirect = user.role === 'OPERATOR' ? '/operator' : user.role === 'ADMIN' ? '/admin' : '/dashboard';

      const response = NextResponse.json({
        success: true,
        message: expectedRole && user.role !== expectedRole 
          ? `Authenticated as ${user.role}. Redirecting to your console.` 
          : 'Login successful.',
        user: safeUser,
        token: signedJwt,
        role: user.role,
        redirectTo: targetRedirect,
        roleMismatch: Boolean(expectedRole && user.role !== expectedRole),
      });

      response.cookies.set('jwt_token', signedJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/',
      });

      return response;
    }

    // 3. Fallback check on Spring Boot backend (if running)
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: rawId, password: cleanPassword, expectedRole }),
        signal: AbortSignal.timeout(800),
      });

      const backendData = await backendRes.json();
      if (backendRes.ok && backendData.success) {
        const targetRedirect = backendData.user.role === 'OPERATOR' ? '/operator' : backendData.user.role === 'ADMIN' ? '/admin' : '/dashboard';
        const response = NextResponse.json({
          success: true,
          message: 'Login successful via Spring Boot Security.',
          user: backendData.user,
          token: backendData.token,
          role: backendData.user.role,
          redirectTo: targetRedirect,
        });

        response.cookies.set('jwt_token', backendData.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 86400,
          path: '/',
        });

        return response;
      }
    } catch {
      // Backend offline or timeout; local DB is authoritative
    }

    // EXACT ERROR: No account found
    return NextResponse.json(
      { error: 'No account found with this Email, Username, or Mobile Number. Please check your credentials or register a new account.' },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
