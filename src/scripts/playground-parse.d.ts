/* Types for playground-parse.js (plain JavaScript so the browser and node load it as is). */
export type Shape = 'square' | 'circle' | 'diamond' | 'blob';
export type Sticker = {
  text: string;
  color: string;
  size: number;
  shape: Shape;
  rotate: number;
  shadow: boolean;
  spin: boolean;
};
export type PlayError = { line: number; message: string; key?: keyof Sticker };
export const DEFAULTS: Sticker;
export const SHAPES: Shape[];
export const LIMITS: { size: [number, number]; rotate: [number, number]; text: number };
export const DEFAULT_CODE: string;
export function parsePlayground(
  code: string,
  isColor?: (v: string) => boolean,
): { settings: Sticker; errors: PlayError[] };
export function inkFor(color: string): string;
export function setValue(code: string, key: string, literal: string): string;
