import type * as Types from '@/lib/types';

import { PATH_LIST } from '@/lib/constants';

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

export const findAvailablePath = (input: string, extensionPaths: Record<string, string[]>, currentHash: string) => {
  const parts = input.split(' ');
  const lastPart = parts[parts.length - 1] ?? '';
  const paths = lastPart.split('/');
  const lastPath = paths.pop() ?? '';

  let pagePaths = currentHash.split('/').filter(Boolean);
  let availables: string[] = [];

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

  if (!input.startsWith(' ')) {
    if (PATH_LIST[`/${pagePaths.join('/')}`]) {
      availables.push(...PATH_LIST[`/${pagePaths.join('/')}`]);
    }
    if (extensionPaths[`/${pagePaths.join('/')}`]) {
      availables.push(...extensionPaths[`/${pagePaths.join('/')}`]);
    }
  }

  return availables.filter((a) => a.startsWith(lastPath));
};

export const findAvailableCommand = (input: string, commandList: Types.CommandList, extensionArgs: Record<string, string[]>): string[] => {
  const parts = input.split(' ');
  const firstPart = parts[0] ?? '';
  const lastPart = parts[parts.length - 1] ?? '';
  const commands = Object.values(commandList);
  const command = commands.find((cmd) => cmd.name === firstPart) ?? null;

  let availables: string[] = [];

  if (!input.startsWith(' ')) {
    if (!command) {
      availables.push(...commands.map((cmd) => cmd.name));
    } else {
      if (command.subCommands) {
        availables.push(...Object.values(command.subCommands).map((cmd) => cmd.name));
        if (parts.length > 2) {
          return findAvailableCommand(parts.slice(1).join(' '), command.subCommands, extensionArgs);
        }
      }
      if (command.flags) {
        availables.push(...command.flags);
      }
      if (command.args) {
        availables.push(...command.args);
      }
      if (extensionArgs[command.name]) {
        availables.push(...extensionArgs[command.name]);
      }
    }
  }

  return availables.filter((a) => a.startsWith(lastPart));
};

export const findAvailable = (input: string, commandList: Types.CommandList, extensionArgs: Record<string, string[]>, extensionPaths: Record<string, string[]>, currentHash: string): string[] => {
  const parts = input.split(' ');

  if (input == '' || input == ' ' || parts.length == 0) {
    return [];
  }

  return findAvailableCommand(input, commandList, extensionArgs).concat(findAvailablePath(input, extensionPaths, currentHash));
};

export const findCommandHandler = (fullCommand: string, commandList: Types.CommandList): (() => void) | undefined => {
  if (!fullCommand || fullCommand === '') return undefined;

  const { cmdName, args, flags } = parseCommand(fullCommand);
  if (!cmdName) return undefined;

  const commandObj = Object.values(commandList).find((cmd) => cmd.name === cmdName);
  if (!commandObj) return undefined;

  if (commandObj.subCommands && args.length > 0) {
    const commandHandler = findCommandHandler(fullCommand.split(' ').slice(1).join(' '), commandObj.subCommands);
    if (commandHandler) return commandHandler;
  }

  return () => commandObj.handler(cmdName, args, flags);
};

export const replaceInput = (input: string, replace: string) => {
  for (let i = 0; i < input.length; i++) {
    if (replace.startsWith(input.slice(i, input.length))) {
      return input.slice(0, i) + replace;
    }
  }

  return input + replace;
};

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
