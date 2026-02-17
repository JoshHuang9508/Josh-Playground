import { createContext, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import store, { AddConsoleLog } from "@/redux";
import { setCommand } from "@/redux/commandSlice";
import { setConsoleContent } from "@/redux/consoleContentSlice";

import { Command, CommandHandler } from "@/lib/types";

export type CommandHandlers = Record<string, CommandHandler>;

export type AppContextType = {
  availableCommands: Command[];
  availablePaths: string[];
  setBackgroundImageUrl: (url: string) => void;
  setBackgroundColor: (color: string) => void;
  setUsername: (name: string) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export function parseCommand(command: string) {
  const parts = command.split(" ");
  const cmdName = parts[0];
  const args = parts.slice(1);
  const flags = args.filter((a) => a.startsWith("-"));
  return { cmdName, args, flags };
}

const webPaths = [
  ["", ["tools", "listentogether", "ytdownloader"], ["games", "colorgame"]],
];

const renderWebPaths = (paths: any, prefix: string): string[] => {
  const result: string[] = [];
  paths.map((path, index) => {
    if (Array.isArray(path)) {
      if (index != paths.length - 1) {
        result.push(`${prefix}├─ ${path[0]}/`);
        result.push(
          ...renderWebPaths(
            path.filter((_, i) => i > 0),
            prefix + "│　",
          ),
        );
      } else {
        result.push(`${prefix}└─ ${path[0]}/`);
        result.push(
          ...renderWebPaths(
            path.filter((_, i) => i > 0),
            prefix + "　　",
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
};

const builtInHandlers: CommandHandlers = {
  log: () => {
    // Use for debugging
  },
  cl: () => {
    store.dispatch(setConsoleContent([]));
  },
  cd: (_cmd, args) => {
    const page = args[0] ?? "";
    const paths = window.location.href.split("/");
    if (!page) {
      window.location.href = "/";
    } else {
      page.split("/").forEach((element) => {
        if (element == ".") {
          return;
        } else if (element == "..") {
          paths.pop();
        } else if (element != "") {
          paths.push(element);
        }
      });
      window.location.href = paths.join("/");
    }
  },
};

function createContextHandlers(ctx: AppContextType | null): CommandHandlers {
  if (!ctx) return {};
  return {
    help: () => {
      AddConsoleLog("Available commands:", "---");
      ctx.availableCommands.forEach((cmd: Command) => {
        AddConsoleLog(`@#00ffaa${cmd.usage}@# - ${cmd.description}`);
      });
    },
    ls: (_cmd, _args, flags) => {
      if (flags.includes("-t") || flags.includes("--tree")) {
        renderWebPaths(webPaths, "").forEach((path) => {
          AddConsoleLog(path);
        });
        return;
      }
      if (flags.includes("-a") || flags.includes("--all")) {
        AddConsoleLog(["./", "../", ...ctx.availablePaths].join(" "));
        return;
      }
      if (flags.includes("-l") || flags.includes("--long")) {
        AddConsoleLog("Available paths:", ...ctx.availablePaths);
        return;
      }
      AddConsoleLog(ctx.availablePaths.join(" "));
    },
    background: (_cmd, args) => {
      const url = args[0] ?? "";
      if (!url) {
        AddConsoleLog("URL invalid! Usage: background [url]");
        return;
      }
      ctx.setBackgroundImageUrl(url);
    },
    backgroundcolor: (_cmd, args) => {
      const color = args[0] ?? "";
      if (!color || !/^#([0-9a-fA-F]{6,8})$/.test(color)) {
        AddConsoleLog(
          "Color invalid! Must be a valid HEX color code. Usage: backgroundcolor [color]",
        );
        return;
      }
      ctx.setBackgroundColor(color);
    },
    username: (_cmd, args) => {
      const name = args[0] ?? "";
      if (!name) {
        AddConsoleLog("Usage: setname [name]");
        return;
      }
      if (name.length > 20) {
        AddConsoleLog("Name too long (max 20 characters)");
        return;
      }
      ctx.setUsername(name);
      AddConsoleLog(`Set username to ${name}`);
    },
  };
}

export default function useCommandHandler(handlers: CommandHandlers) {
  const command = useSelector((state: { command: string }) => state.command);
  const appContext = useContext(AppContext);

  const handlersRef = useRef({
    ...builtInHandlers,
    ...createContextHandlers(appContext),
    ...handlers,
  });
  handlersRef.current = {
    ...builtInHandlers,
    ...createContextHandlers(appContext),
    ...handlers,
  };

  useEffect(() => {
    if (!command || command === "") return;

    const { cmdName, args, flags } = parseCommand(command);
    const handler = handlersRef.current[cmdName];

    if (handler) {
      handler(command, args, flags);
    } else {
      AddConsoleLog(`Command not found: @#fff700${command}`);
    }

    store.dispatch(setCommand(""));
  }, [command]);
}
