import textContent from "@/lib/text-content.json";

type NestedRecord = { [key: string]: string | string[] | NestedRecord };

/**
 * Template interpolation helper for i18n.
 * Usage: t("console.placeholder") => "Feel confused? Type 'help' to get started!"
 *        t("commands.commandNotFound", "xyz") => "Command not found: @#fff700xyz"
 *
 * Supports {0}, {1}, ... placeholders in the string.
 */
export function t(key: string, ...args: string[]): string {
  const keys = key.split(".");
  let value: unknown = textContent;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as NestedRecord)[k];
    } else {
      return key; // fallback: return the key itself
    }
  }
  if (typeof value !== "string") return key;
  return value.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)] ?? "");
}

/**
 * Get an array of strings from text-content.json by dot-notation key.
 * Usage: ta("console.welcome") => ["line1", "line2", ...]
 */
export function ta(key: string, ...args: string[]): string[] {
  const keys = key.split(".");
  let value: unknown = textContent;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as NestedRecord)[k];
    } else {
      return [key];
    }
  }
  if (!Array.isArray(value)) return [key];
  return value.map((item) =>
    typeof item === "string"
      ? item.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)] ?? "")
      : item,
  );
}
