import de from '../i18n/de.json';
import type { TextParams } from './types';

function lookup(key: string): unknown {
  let node: unknown = de;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

export function hasText(key: string): boolean {
  return lookup(key) !== undefined;
}

/** Text zu einem Schlüssel. Fehlt er, erscheint der Schlüssel in Klammern, damit es auffällt. */
export function t(key: string, params?: TextParams): string {
  const value = lookup(key);
  if (typeof value !== 'string') {
    console.warn(`Text fehlt: ${key}`);
    return `[${key}]`;
  }
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

/** Liste von Texten, z. B. ein Pool von Standardsprüchen. */
export function textList(key: string): string[] {
  const value = lookup(key);
  return Array.isArray(value) ? (value as string[]) : [];
}
