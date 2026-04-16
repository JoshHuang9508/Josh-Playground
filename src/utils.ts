export function IDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => IDeepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && IDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }

  return false;
}

export function IDiffArray<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return true;
  return !a.every((item, index) => IDeepEqual(item, b[index]));
}

export function IDiffObject(a: Record<string, unknown> | null, b: Record<string, unknown> | null): boolean {
  if (a === null || b === null) return true;
  return !IDeepEqual(a, b);
}

export function IsMobile(): boolean {
  return ["Mobile", "iPhone", "iPad", "Android"].some((userAgent) =>
    navigator.userAgent.includes(userAgent),
  );
}