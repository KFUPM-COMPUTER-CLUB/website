/* Where a form or sign-in may send the visitor afterwards (?next= and the hidden "next" fields). Kept
 * apart from api.ts, which imports astro:env, so tests/next.test.ts can run it under plain node.
 *
 * Only same-site paths pass. The value is resolved against a dummy origin, so //host and /\host cannot
 * escape. The normalized path is checked as well: the URL parser turns /.//evil.com, /..//evil.com and
 * /x/..//evil.com into //evil.com without changing the origin, and a redirect to //evil.com leaves the
 * site (browsers read it as https://evil.com/). */
export const safeNext = (v: unknown, fallback = '/me') => {
  if (typeof v !== 'string' || !v.startsWith('/')) return fallback;
  try {
    const u = new URL(v, 'https://x.invalid');
    if (u.origin !== 'https://x.invalid') return fallback;
    if (u.pathname.startsWith('//') || u.pathname.startsWith('/\\')) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
};
