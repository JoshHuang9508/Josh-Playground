import { TEXT_CONTENT } from '@/lib/constants';

type NestedRecord = { [key: string]: string | string[] | NestedRecord };

/**
 * Template interpolation helper for i18n.
 * Usage: t("terminal.placeholder") => "Feel confused? Type 'help' to get started!"
 *        t("terminal.commandNotFound", "xyz") => "Command not found: @#fff700xyz"
 *
 * Supports {0}, {1}, ... placeholders in the string.
 */
export function t(key: string, ...args: string[]): any {
  const keys = key.split('.');
  let value: unknown = TEXT_CONTENT;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as NestedRecord)[k];
    } else {
      return key; // fallback: return the key itself
    }
  }
  if (typeof value === 'string') {
    return value.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)] ?? '');
  } else if (Array.isArray(value)) {
    return value.map((item) => item.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)] ?? ''));
  } else {
    return key;
  }
}
