import en from '../data/i18n/en.json';
import ar from '../data/i18n/ar.json';

export type Lang = 'en' | 'ar';
/** Routes with no Arabic version yet: signed-in areas and the join flow. */
export const ENGLISH_ONLY = /^\/(me|admin|onboarding|auth|api|join)(\/|$)/;
export type Key = keyof typeof en;
const dictionaries: Record<Lang, Partial<Record<Key, string>>> = { en, ar };

export const t = (lang: Lang, key: Key): string => dictionaries[lang][key] ?? en[key];
export const localePath = (lang: Lang, path: string): string =>
  lang === 'ar' ? `/ar${path === '/' ? '' : path}` : path;
