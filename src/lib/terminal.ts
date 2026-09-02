import type * as Types from '@/lib/types';

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

export const findAvailableCommand = (input: string, commandList: Types.CommandList, extensionArgs: Record<string, string[]>): string[] => {
  const parts = input.split(' ');
  const firstPart = parts[0] ?? '';
  const lastPart = parts[parts.length - 1] ?? '';
  const commands = Object.values(commandList);
  const command = commands.find((cmd) => cmd.name === firstPart) ?? null;

  const availables: string[] = [];

  if (!input.startsWith(' ')) {
    if (!command || parts.length <= 1) {
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

export const findAvailable = (input: string, commandList: Types.CommandList, extensionArgs: Record<string, string[]>): string[] => {
  if (input == '' || input == ' ') {
    return [];
  }

  return findAvailableCommand(input, commandList, extensionArgs);
};

export const findCommandObject = (fullCommand: string, commandList: Types.CommandList): Types.Command | undefined => {
  if (!fullCommand || fullCommand === '') return undefined;

  const { cmdName, args } = parseCommand(fullCommand);
  if (!cmdName) return undefined;

  const commandObj = Object.values(commandList).find((cmd) => cmd.name === cmdName);
  if (!commandObj) return undefined;

  if (commandObj.subCommands && args.length > 0) {
    const commandObject = findCommandObject(fullCommand.split(' ').slice(1).join(' '), commandObj.subCommands);
    if (commandObject) return commandObject;
  }

  return commandObj;
};

export const findCommandHandler = (fullCommand: string, commandList: Types.CommandList): (() => void) | undefined => {
  if (!fullCommand || fullCommand === '') return undefined;

  const { cmdName, args, flags } = parseCommand(fullCommand);
  if (!cmdName) return undefined;

  const commandObj = findCommandObject(fullCommand, commandList);
  if (!commandObj) return undefined;

  return () => commandObj.handler(cmdName, args, flags, commandObj);
};

export const replaceInput = (input: string, replace: string) => {
  for (let i = 0; i < input.length; i++) {
    if (replace.startsWith(input.slice(i, input.length))) {
      return input.slice(0, i) + replace;
    }
  }

  return input + replace;
};
