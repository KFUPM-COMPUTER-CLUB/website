/* Two small primitives for links and calls that carry their own proof instead of a session: the cron
 * routes' bearer secret and the digest's unsubscribe token. Web Crypto only, so this runs on Vercel and
 * under plain node in tests/. */

/* Constant time over the longer input, so neither the content nor the length leaks through timing. */
export const sameSecret = (given: string, want: string) => {
  const a = new TextEncoder().encode(given),
    b = new TextEncoder().encode(want);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
};

/* HMAC-SHA256 of `message` under `secret`, base64url without padding (43 characters). */
export async function hmac(secret: string, message: string): Promise<string> {
  if (!secret) throw new Error('hmac: empty secret');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
  return btoa(String.fromCharCode(...sig))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
