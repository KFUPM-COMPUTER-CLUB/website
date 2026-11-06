/* A member's name in parts (0018_name_parts.sql). The forms ask for first, middle (optional) and last name;
 * profiles.name keeps the full name built from them, which is what every page and list shows. Plain
 * TypeScript with no astro import, so tests/names.test.ts runs it under node. */
export const NAME_PART_MAX = 40;
export type NameParts = { first: string; middle: string; last: string };

const clean = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, NAME_PART_MAX) : '');

/* The parts from a form or JSON body (first_name, middle_name, last_name), trimmed. */
export const readNameParts = (b: Record<string, unknown>): NameParts => ({
  first: clean(b.first_name),
  middle: clean(b.middle_name),
  last: clean(b.last_name),
});
/* The full name: the parts that are filled, in order, one space apart. */
export const joinName = (p: NameParts) => [p.first, p.middle, p.last].filter(Boolean).join(' ');
/* Best guess at the parts of a full name, for a profile saved before the parts existed (or a name from
 * GitHub or Google): first word, last word, the rest as the middle name. */
export const splitName = (full: string | null | undefined): NameParts => {
  const w = (full || '').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return { first: '', middle: '', last: '' };
  if (w.length === 1) return { first: clean(w[0]), middle: '', last: '' };
  return { first: clean(w[0]), middle: clean(w.slice(1, -1).join(' ')), last: clean(w[w.length - 1]) };
};
/* What the forms show: the stored parts, or the full name split when there are none yet. */
export const namePartsOf = (
  p:
    | {
        name?: string | null;
        first_name?: string | null;
        middle_name?: string | null;
        last_name?: string | null;
      }
    | null
    | undefined,
): NameParts =>
  p?.first_name
    ? { first: p.first_name || '', middle: p.middle_name || '', last: p.last_name || '' }
    : splitName(p?.name);
/* Checks the parts and returns the columns to save, with the full name. Throws the message to show. The
 * forms require a last name; a one-word full name from a JSON client (requireLast false) keeps working. */
export function nameColumns(p: NameParts, requireLast = true) {
  if (!p.first) throw new Error('Your first name is required.');
  if (!p.last && requireLast) throw new Error('Your last name is required.');
  return { first_name: p.first, middle_name: p.middle || null, last_name: p.last || null, name: joinName(p) };
}
