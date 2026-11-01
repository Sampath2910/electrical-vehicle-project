import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: Request) {
  try {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('jwt_token')?.value;

      const authHeader = request.headers.get('authorization') || (token ? `Bearer ${token}` : '');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/admin/stats`, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(1500),
      });

      if (res.ok) {
        const stats = await res.json();
        return NextResponse.json({
          success: true,
          ...stats,
        });
      }
    } catch {
      // Backend offline, fall through to local DB
    }

    const stats = db.getAdminStats();
    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
