/* Types for icon-parse.js (plain JavaScript so the browser and node load it as is). */
import type { Icon } from './hero-icon.js';
export type IconError = { line: number; message: string; key?: keyof Icon };
export function parseIcon(code: string, isColor?: (v: string) => boolean): { settings: Icon; errors: IconError[] };
export function iconBlock(code: string): { start: number; lines: number; html: string };
