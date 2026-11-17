export type UserRole = 'USER' | 'OPERATOR' | 'ADMIN';

export interface SessionPayload {
  userId: string;
  role: UserRole;
  email: string;
  assignedStationId?: string;
  exp: number;
}

const AUTH_SECRET = process.env.AUTH_SECRET || 'smart-moto-ev-platform-hmac-secret-2026-v1';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSessionToken(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const enc = new TextEncoder();
  const bodyB64 = toBase64Url(enc.encode(JSON.stringify(fullPayload)));
  const key = await getHmacKey();
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(bodyB64));
  const sigB64 = toBase64Url(new Uint8Array(sigBuf));
  return `${bodyB64}.${sigB64}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [bodyB64, sigB64] = parts;
  if (!bodyB64 || !sigB64) return null;

  try {
    const enc = new TextEncoder();
    const key = await getHmacKey();
    const sigBytes = fromBase64Url(sigB64);
    const sigBuffer = sigBytes.buffer.slice(
      sigBytes.byteOffset,
      sigBytes.byteOffset + sigBytes.byteLength
    ) as ArrayBuffer;
    const valid = await crypto.subtle.verify('HMAC', key, sigBuffer, enc.encode(bodyB64));
    if (!valid) return null;

    const jsonStr = new TextDecoder().decode(fromBase64Url(bodyB64));
    const parsed = JSON.parse(jsonStr) as SessionPayload;

    if (!parsed.userId || !parsed.role || !parsed.exp) return null;
    if (!['USER', 'OPERATOR', 'ADMIN'].includes(parsed.role)) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  let token: string | undefined;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)jwt_token=([^;]+)/);
    if (match) {
      try {
        token = decodeURIComponent(match[1]);
      } catch {
        token = match[1];
      }
    }
  }

  return verifySessionToken(token);
}
