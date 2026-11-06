/* Rules for the home page's live numbers (#114), apart from the page so tests/home.test.ts runs them under
 * node. Every number comes from the content layer; none is typed in. A small number says little, so:
 * members show from 30, posts above 5, any other number above 0, and when fewer than three numbers are
 * left the whole row hides rather than looking empty. Members is null in seed mode (no database). */
export type ClubCounts = { members: number | null; events: number; posts: number; workshops: number };
export type ClubNumber = { key: keyof ClubCounts; value: number };
export const MEMBERS_FROM = 30;
export const POSTS_ABOVE = 5;
export function clubNumbers(c: ClubCounts): ClubNumber[] {
  const out: ClubNumber[] = [];
  if (c.members !== null && c.members >= MEMBERS_FROM) out.push({ key: 'members', value: c.members });
  if (c.events > 0) out.push({ key: 'events', value: c.events });
  if (c.posts > POSTS_ABOVE) out.push({ key: 'posts', value: c.posts });
  if (c.workshops > 0) out.push({ key: 'workshops', value: c.workshops });
  return out.length >= 3 ? out : [];
}
