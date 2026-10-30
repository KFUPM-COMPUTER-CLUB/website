/* English and Arabic for the public pages. English lives at /xxx and Arabic at /ar/xxx (astro.config.mjs);
 * pages read the language from Astro.currentLocale and look their text up with t(). The strings are in
 * src/data/i18n/en.json and ar.json, and en.json is the list of keys: a key missing from ar.json shows the
 * English text, so a new string never breaks an Arabic page, it just shows in English until translated. */
import en from '../data/i18n/en.json';
import ar from '../data/i18n/ar.json';
import contentAr from '../data/i18n/content.ar.json';

export type Lang = 'en' | 'ar';
/* Routes with no Arabic version yet: signed-in areas and the join flow. */
export const ENGLISH_ONLY = /^\/(me|admin|onboarding|auth|api|join)(\/|$)/;
export type Key = keyof typeof en;
const dictionaries: Record<Lang, Partial<Record<Key, string>>> = { en, ar };

export const t = (lang: Lang, key: Key): string => dictionaries[lang][key] ?? en[key];
export const localePath = (lang: Lang, path: string): string =>
  lang === 'ar' ? `/ar${path === '/' ? '' : path}` : path;
/* The locale for formatting dates. Arabic month names on the Gregorian calendar: plain "ar-SA" would
 * switch to the Hijri calendar. */
export const dateLocale = (lang: Lang | string | undefined): string =>
  lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB';

/* "Fall 2026" becomes the Arabic season name plus the year on Arabic pages; English is returned as it is. */
export const localizeTerm = (lang: Lang, term: string): string =>
  lang === 'ar'
    ? term
        .replace('Fall', t(lang, 'leaderboard.termFall'))
        .replace('Spring', t(lang, 'leaderboard.termSpring'))
        .replace('Summer', t(lang, 'leaderboard.termSummer'))
    : term;

/* Event types are free text from the database, so a type without a translation is shown as it is. */
export const eventTypeLabel = (lang: Lang, type: string): string => {
  const key = `eventType.${type}` as Key;
  return key in en ? t(lang, key) : type;
};

/* Club content (event names, stat labels) is stored in English. Arabic pages look it up in content.ar.json and
 * show the English text as it is when there is no translation there yet. */
export const trContent = (lang: Lang, text: string): string =>
  lang === 'ar' ? ((contentAr as Record<string, string>)[text] ?? text) : text;
