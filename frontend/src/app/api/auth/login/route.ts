import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signSessionToken } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

    // 2. Authoritative check on Spring Boot backend (if configured & reachable)
    if (BACKEND_URL) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: rawId, password: cleanPassword, expectedRole }),
          signal: AbortSignal.timeout(8000),
        });

        const backendData = await backendRes.json();
        if (backendRes.ok && backendData.success) {
          const targetRedirect = backendData.user.role === 'OPERATOR' ? '/operator' : backendData.user.role === 'ADMIN' ? '/admin' : '/dashboard';
          const isRoleMismatch = Boolean(expectedRole && backendData.user.role !== expectedRole);
          // IMPORTANT: The Spring Boot backend returns its own HS384 JWT, which the
          // frontend middleware / auth layer (src/lib/auth.ts) cannot verify. We must
          // re-issue OUR OWN signed session token so middleware and /api/* routes
          // recognise the logged-in session; otherwise every protected page bounces
          // the user straight back to the login screen.
          const signedJwt = await signSessionToken({
            userId: backendData.user.id,
            role: backendData.user.role,
            email: backendData.user.email,
            assignedStationId: backendData.user.assignedStationId,
          });
          const response = NextResponse.json({
            success: true,
            message: backendData.message || 'Login successful via Spring Boot Security.',
            user: backendData.user,
            token: signedJwt,
            role: backendData.user.role,
            redirectTo: targetRedirect,
            roleMismatch: isRoleMismatch,
          });

          response.cookies.set('jwt_token', signedJwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400,
            path: '/',
          });

          return response;
        } else if (backendData && backendData.error) {
          // Precise error from Spring Boot backend (e.g. "No account found..." or "Incorrect password...")
          return NextResponse.json(
            { error: backendData.error },
            { status: backendRes.status || 401 }
          );
        }
      } catch {
        // Backend offline or timeout; fallback to local DB
      }
    }

    // 3. Fallback Local Database Lookup
    const user = db.getUserByIdentifier(rawId);

    if (user) {
      // Strictly validate against this specific account's stored password
      const isPasswordValid = (
        user.passwordHash === cleanPassword ||
        (user as any).password === cleanPassword
      );

      if (!isPasswordValid) {
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
