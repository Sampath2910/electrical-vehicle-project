import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

/**
 * Admin-only targeted deletion of a single user by email. Authorizes the caller
 * via the frontend session token, then forwards to the Spring Boot backend
 * (DELETE /api/v1/admin/users) using the backend_jwt cookie, since the backend
 * is the authoritative account store on the deployment. Also removes the user
 * from the local JSON DB as a best-effort fallback.
 */
export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Administrator access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'A target "email" query parameter is required.' }, { status: 400 });
  }
  if (email === session.email?.toLowerCase()) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  let backendResult: { ok: boolean; status: number; body: any } | null = null;
  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get('backend_jwt')?.value;
    if (backendToken) {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/users?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${backendToken}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      let body: any = null;
      try { body = await res.json(); } catch { /* no body */ }
      backendResult = { ok: res.ok, status: res.status, body };
    }
  } catch {
    backendResult = null; // backend unreachable
  }

  // Best-effort local removal (ignored if unsupported / absent).
  let localRemoved = false;
  try {
    localRemoved = Boolean((db as any).deleteUserByEmail?.(email));
  } catch {
    localRemoved = false;
  }

  if (backendResult?.ok) {
    return NextResponse.json({
      success: true,
      message: `Deleted ${email} from the backend account store.`,
      backend: backendResult.body,
      localRemoved,
    });
  }

  if (backendResult && !backendResult.ok) {
    return NextResponse.json(
      {
        success: false,
        error: backendResult.body?.error || `Backend refused deletion (status ${backendResult.status}).`,
        backendStatus: backendResult.status,
        localRemoved,
      },
      { status: backendResult.status || 502 }
    );
  }

  // No backend token or backend unreachable.
  return NextResponse.json(
    {
      success: localRemoved,
      error: localRemoved
        ? undefined
        : 'Backend account store was unreachable and the user was not found locally. No deletion performed.',
      localRemoved,
    },
    { status: localRemoved ? 200 : 502 }
  );
}

