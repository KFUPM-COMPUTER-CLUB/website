/* Types for hero-icon.js (plain JavaScript so the browser and node load it as is). */
export type Icon = {
  blue: string;
  navy: string;
  line: string;
  size: number;
  gap: number;
  round: number;
  rotate: number;
};
export const ICON: Icon;
export const RULES: Record<keyof Icon, 'color' | [number, number]>;
export const W: number;
export const H: number;
export function roundedPath(points: [number, number][], r: number): string;
export function iconSvg(settings?: Partial<Icon>): string;
