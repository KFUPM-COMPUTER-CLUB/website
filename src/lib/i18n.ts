import en from '../data/i18n/en.json';
import ar from '../data/i18n/ar.json';

export type Lang = 'en' | 'ar';
export type Key = keyof typeof en;
const dictionaries: Record<Lang, Partial<Record<Key, string>>> = { en, ar };

export const t = (lang: Lang, key: Key): string => dictionaries[lang][key] ?? en[key];
export const localePath = (lang: Lang, path: string): string =>
  lang === 'ar' ? `/ar${path === '/' ? '' : path}` : path;
