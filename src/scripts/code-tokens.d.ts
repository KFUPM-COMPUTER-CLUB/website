/* Types for code-tokens.js (plain JavaScript so the browser and node load it as is). */
export type TokenType = 'com' | 'str' | 'num' | 'kw' | 'lit' | 'prop' | 'fn' | 'plain';
export function tokenize(src: string): [TokenType, string][];
export function highlight(src: string): string;
