/* The footer's "Top contributor": whoever has the most commits on the site's GitHub repo, so the name
 * changes by itself when someone passes them. Read from GitHub's public API at most twice a day per
 * server instance; if GitHub cannot be reached the line is simply left out. */
const REPO = 'KFUPM-COMPUTER-CLUB/website';
const TTL = 12 * 60 * 60 * 1000;
type Top = { login: string; name: string } | null;
let cache: { at: number; top: Top } | null = null;

async function gh(path: string) {
  const r = await fetch(`https://api.github.com/${path}`, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'cckfupm-website' },
    signal: AbortSignal.timeout(2500),
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  return r.json();
}

export async function topContributor(): Promise<Top> {
  if (cache && Date.now() - cache.at < TTL) return cache.top;
  let top: Top = null;
  try {
    const [first] = await gh(`repos/${REPO}/contributors?per_page=1`);
    if (first?.login && first.type === 'User') {
      const user = await gh(`users/${first.login}`).catch(() => null);
      top = { login: first.login, name: user?.name || first.login };
    }
  } catch {
    top = cache?.top ?? null;
  }
  cache = { at: Date.now(), top };
  return top;
}
