// Shared client helper for the auth endpoints (/api/auth/login, /api/auth/register).
//
// The authoritative Spring Boot backend can be slow to answer on a cold start
// (free-tier hosts sleep after inactivity). When that happens the server returns
// HTTP 503 with { code: 'BACKEND_WAKING', retryable: true } instead of a misleading
// "no account found". This helper transparently retries that specific signal a few
// times with a short delay, so the user usually just sees a brief "waking up" notice
// and then lands normally — rather than a false failure they have to decode.

export interface AuthFetchResult {
  res: Response;
  data: any;
}

interface AuthFetchOptions {
  maxAttempts?: number;
  delayMs?: number;
  onWaking?: (attempt: number, maxAttempts: number) => void;
}

export async function postAuthWithRetry(
  url: string,
  body: unknown,
  opts: AuthFetchOptions = {}
): Promise<AuthFetchResult> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const delayMs = opts.delayMs ?? 2500;

  let last: AuthFetchResult | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    last = { res, data };

    const isWaking = res.status === 503 && data?.code === 'BACKEND_WAKING';
    if (isWaking && attempt < maxAttempts) {
      opts.onWaking?.(attempt, maxAttempts);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }

    return last;
  }

  // Exhausted retries; return the last response seen.
  return last as AuthFetchResult;
}
