import type * as Types from '@/lib/types';

import { PATH_LIST } from '@/lib/constants';

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
  return ['Mobile', 'iPhone', 'iPad', 'Android'].some((userAgent) => navigator.userAgent.includes(userAgent));
}

type WebPaths = (string | string[] | WebPaths)[];

export function renderWebPaths(paths: WebPaths, prefix: string): string[] {
  const result: string[] = [];

  paths.map((path, index) => {
    if (Array.isArray(path)) {
      if (index != paths.length - 1) {
        result.push(`${prefix}├─ ${path[0]}/`);
        result.push(
          ...renderWebPaths(
            path.filter((_, i) => i > 0),
            prefix + '│　',
          ),
        );
      } else {
        result.push(`${prefix}└─ ${path[0]}/`);
        result.push(
          ...renderWebPaths(
            path.filter((_, i) => i > 0),
            prefix + '　　',
          ),
        );
      }
    } else {
      if (index != paths.length - 1) {
        result.push(`${prefix}├─ ${path}`);
      } else {
        result.push(`${prefix}└─ ${path}`);
      }
    }
  });

  return result;
}

export function parseCommand(command: string) {
  const parts = command.split(' ');
  const cmdName = parts.shift() ?? null;
  const args: string[] = [];
  const flags: string[] = [];

  for (const part of parts) {
    if (part.startsWith('-')) {
      if (part.startsWith('--')) {
        flags.push(part);
      } else {
        flags.push(
          ...part
            .slice(1)
            .split('')
            .map((flag) => `-${flag}`),
        );
      }
    } else {
      args.push(part);
    }
  }

  return { cmdName, args, flags };
}

export const findAvailablePath = (input: string, availablePaths: Record<string, string[]>, currentHash: string) => {
  const paths = input.split('/');
  const lastPart = paths.pop() ?? '';
  let pagePaths = currentHash.split('/').filter(Boolean);

  paths.forEach((element, index) => {
    if (index === 0 && element === '~') {
      pagePaths = [];
    } else if (element === '.') {
      return;
    } else if (element === '..') {
      pagePaths.pop();
    } else {
      pagePaths.push(element);
    }
  });

  return [...(PATH_LIST[`/${pagePaths.join('/')}`] ?? []), ...(availablePaths[`/${pagePaths.join('/')}`] ?? [])].filter((a) => a.startsWith(lastPart));
};

export const replaceInput = (input: string, replace: string) => {
  for (let i = 0; i < input.length; i++) {
    if (replace.startsWith(input.slice(i, input.length))) {
      return input.slice(0, i) + replace;
    }
  }

  return input + replace;
};

export const findAvailable = (input: string, availableCommands: Types.Command[], availableArgs: Record<string, string[]>, availablePaths: Record<string, string[]>, currentHash: string): string[] => {
  const parts = input.split(' ');
  const firstPart = parts[0] ?? '';
  const lastPart = parts.pop() ?? '';
  const command = parts ? availableCommands.find((cmd) => cmd.name === firstPart) : null;
  let availables: string[] = [];

  if (input == '' || input == ' ') {
    return availables;
  }

  if (!command && !input.endsWith(' ') && availableCommands.filter((_) => _.name.startsWith(firstPart)).length != 0) {
    availables.push(...availableCommands.map((cmd) => cmd.name));
  } else if (command) {
    if (command.flags) {
      availables.push(...command.flags);
    }
    if (availableArgs[command.name]) {
      availables.push(...availableArgs[command.name]);
    }
  }

  availables = availables.filter((a) => a.startsWith(lastPart)).concat(findAvailablePath(lastPart, availablePaths, currentHash));

  return availables;
};
