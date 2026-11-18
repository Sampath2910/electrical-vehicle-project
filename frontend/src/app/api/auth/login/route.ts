import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signSessionToken } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Allow a little more headroom for backend cold starts where the hosting plan permits.
export const maxDuration = 20;

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
    let backendUnreachable = false;
    if (BACKEND_URL) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: rawId, password: cleanPassword, expectedRole }),
          signal: AbortSignal.timeout(9000),
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

          // Keep the backend's own JWT in a separate cookie so server-side admin/
          // operator routes can authenticate to the Spring Boot backend on the
          // user's behalf (the frontend session token above is not valid there).
          if (backendData.token) {
            response.cookies.set('backend_jwt', backendData.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 86400,
              path: '/',
            });
          }

          return response;
        } else if (backendData && backendData.error) {
          // Precise error from Spring Boot backend (e.g. "No account found..." or "Incorrect password...")
          return NextResponse.json(
            { error: backendData.error },
            { status: backendRes.status || 401 }
          );
        }
      } catch {
        // Backend offline or timeout (e.g. free-tier cold start). Remember this so we
        // can tell "backend is waking up" apart from "account genuinely doesn't exist".
        backendUnreachable = true;
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

    // If the authoritative backend was unreachable (cold start / timeout) and the
    // account is not one of the local seed accounts, do NOT claim it doesn't exist —
    // the account may well live in the backend that just failed to answer. Return a
    // retryable 503 so the client can wait for the service to warm up and try again.
    if (backendUnreachable) {
      return NextResponse.json(
        {
          error: 'The charging service is starting up (this can take a few seconds on first use). Please wait a moment — we will retry automatically.',
          retryable: true,
          code: 'BACKEND_WAKING',
        },
        { status: 503 }
      );
    }

    // EXACT ERROR: No account found (backend answered, or no backend, and not local)
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
