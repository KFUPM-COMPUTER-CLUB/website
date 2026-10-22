/* Parsing and formatting for admin resource fields. */
import type { Field, Resource } from './resources';
import { ApiError, str, int, bool, isUrl, slugify } from '../api';

/* Riyadh wall-clock <-> UTC instant for datetime-local inputs. */
export const toRiyadhInput = (iso: string | null) => { if (!iso) return ''; const d = new Date(iso); const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d); const g = (t: string) => p.find((x) => x.type === t)?.value; return `${g('year')}-${g('month')}-${g('day')}T${g('hour') === '24' ? '00' : g('hour')}:${g('minute')}`; };
export const fromRiyadhInput = (v: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(v); if (!m) return null; return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], (+(m[4] || 0)) - 3, +(m[5] || 0))).toISOString(); };

export function parseFields(res: Resource, body: Record<string, any>, existing: Record<string, any> | null) {
  const row: Record<string, any> = {};
  for (const f of res.fields) {
    if (existing && f.name === res.pk) continue; // the key is the row identity; never rewritten
    const raw = body[f.name];
    let v: any;
    switch (f.type) {
      case 'bool': v = bool(raw); break;
      case 'number': v = raw === '' || raw == null ? null : int(raw); break;
      case 'date': v = /^\d{4}-\d{2}-\d{2}$/.test(String(raw || '')) ? raw : null; break;
      case 'datetime': v = raw ? fromRiyadhInput(String(raw)) : null; if (raw && !v) throw new ApiError(`${f.label}: invalid date.`); break;
      case 'tags': v = String(raw || '').split(',').map((t) => str(t, 30)).filter(Boolean); break;
      case 'url': v = str(raw, 500) || null; if (v && !isUrl(v)) throw new ApiError(`${f.label} must be a full URL (https://…).`); break;
      case 'select': v = f.options?.includes(String(raw)) ? String(raw) : (f.required ? f.options?.[0] : null); break;
      default: v = str(raw, f.max || 2000) || (f.type === 'text' || f.type === 'textarea' ? '' : null);
    }
    if (f.required && (v === null || v === '' || v === undefined)) throw new ApiError(`${f.label} is required.`);
    row[f.name] = v;
  }
  if (res.key === 'events') row.slug = slugify(row.slug || row.title);
  return row;
}
export const display = (f: Field | undefined, v: any) => {
  if (v === null || v === undefined || v === '') return '';
  if (f?.type === 'bool' || typeof v === 'boolean') return v ? 'yes' : 'no';
  if (f?.type === 'datetime') return toRiyadhInput(String(v)).replace('T', ' ');
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return toRiyadhInput(v).slice(0, 10);
  return String(v);
};
