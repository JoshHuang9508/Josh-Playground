import { useState, useRef, useEffect } from "react";
import { Provider } from "react-redux";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Styles
import "@/styles/global.css";
import styles from "@/styles/_app.module.css";

// Redux
import store, { AddConsoleLog, SetUsername } from "@/redux";
import { setConsoleContent } from "@/redux/consoleContentSlice";
import { setCommand } from "@/redux/commandSlice";

// Components
import ColorSpan from "@/components/ColorSpan";

// Types
import { Command } from "@/lib/types";

// JSON
import textContent from "@/lib/textContent.json";
import commandList from "@/lib/commandList.json";
import pathList from "@/lib/pathList.json";

// import backgroundImage from "../../public/assets/bg.jpg";

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
            prefix + "│　"
          )
        );
      } else {
        result.push(`${prefix}└─ ${path[0]}/`);
        result.push(
          ...renderWebPaths(
            path.filter((_, i) => i > 0),
            prefix + "　　"
          )
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

export default function Page({ Component, pageProps }) {
  // Refs
  const consoleBox = useRef<HTMLDivElement>(null);
  const inputBox = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // States
  const [username, setUsername] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [inputTemp, setInputTemp] = useState<string>("");
  const [currentURL, setCurrentURL] = useState<string>("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [available, setAvailable] = useState<string[]>([]);
  const [availableIndex, setAvailableIndex] = useState<number>(0);
  const [isTabing, setIsTabing] = useState(false);
  const [consoleContents, setConsoleContents] = useState<string[]>([]);
  const [consoleVisible, setConsoleVisible] = useState(true);
  const [availableCommands, setAvailableCommands] = useState<Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");

  // Handlers
  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    const available = findAvailable(value, availableCommands);
    setAvailable(available);
    if (inputBox.current) {
      inputBox.current.style.color = available.length > 0 ? "#fff700" : "";
    }
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      if (!inputValue || inputValue == "") return;
      const command = inputValue;
      AddConsoleLog([
        `@#FF77B7${username}@#@@#FFA24Cwhydog@#:~${currentURL}$ @#fff700${command}`,
      ]);
      setCmdHistory([command, ...cmdHistory]);
      // Catch basic command
      const flags =
        command
          .split(" ")
          .slice(1)
          .filter((_) => _.startsWith("-")) ?? "";
      switch (command.split(" ")[0]) {
        case "help":
          AddConsoleLog(["Available commands:", "---"]);
          availableCommands.forEach((command: Command) => {
            AddConsoleLog([
              `@#00ffaa${command.usage}@# - ${command.description}`,
            ]);
          });
          break;
        case "cl":
          store.dispatch(setConsoleContent([]));
          break;
        case "cd":
          const page = command.split(" ")[1] ?? "";
          const paths = window.location.href.split("/");
          if (!page) {
            window.location.href = "/";
            break;
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
          break;
        case "ls":
          if (flags.includes("-t") || flags.includes("--tree")) {
            renderWebPaths(webPaths, "").forEach((path) => {
              AddConsoleLog([path]);
            });
            break;
          }
          if (flags.includes("-a") || flags.includes("--all")) {
            AddConsoleLog([["./", "../", ...availablePaths].join(" ")]);
            break;
          }
          if (flags.includes("-l") || flags.includes("--long")) {
            AddConsoleLog(["Available paths:", ...availablePaths]);
            break;
          }
          AddConsoleLog([availablePaths.join(" ")]);
          break;
        case "background":
          const url = command.split(" ")[1] ?? "";
          if (!url) {
            AddConsoleLog(["URL invalid! Usage: background [url]"]);
            break;
          }
          setBackgroundImageUrl(url);
          break;
        case "username":
          const name = command.split(" ").slice(1)[0] ?? "";
          if (!name) {
            AddConsoleLog(["Usage: setname [name]"]);
            break;
          }
          if (name.length > 20) {
            AddConsoleLog(["Name too long (max 20 characters)"]);
            break;
          }
          setUsername(name);
          AddConsoleLog([`Set username to ${name}`]);
          break;
        // Set command
        default:
          store.dispatch(setCommand(command));
          setCmdHistoryIndex(-1);
          break;
      }
      handleInputChange({ target: { value: "" } });
      return;
    }
    if (event.key === "ArrowUp") {
      const cmdHistoryLength = cmdHistory.length;
      const newIndex = Math.max(
        -1,
        Math.min(cmdHistoryIndex + 1, cmdHistoryLength - 1)
      );
      setCmdHistoryIndex(newIndex);
      handleInputChange({
        target: { value: newIndex !== -1 ? cmdHistory[newIndex] : "" },
      });
    }
    if (event.key === "ArrowDown") {
      const cmdHistoryLength = cmdHistory.length;
      const newIndex = Math.max(
        -1,
        Math.min(cmdHistoryIndex - 1, cmdHistoryLength - 1)
      );
      setCmdHistoryIndex(newIndex);
      handleInputChange({
        target: { value: newIndex !== -1 ? cmdHistory[newIndex] : "" },
      });
    }
    if (event.key === "Escape") {
      setConsoleVisible(!consoleVisible);
    }
    // Auto complete
    if (event.key === "Tab") {
      event.preventDefault();
      let input = inputTemp;
      if (!inputValue || inputValue == "") return;
      if (!inputTemp) input = inputValue;
      if (available.length > 0) {
        setInputValue(replaceInput(input, available[availableIndex]));
        setIsTabing(true);
        setInputTemp(input);
        setAvailableIndex(
          availableIndex >= available.length - 1 ? 0 : availableIndex + 1
        );
      }
    } else if (isTabing) {
      handleInputChange(event);
      setIsTabing(false);
      setInputTemp("");
      setAvailableIndex(0);
    }
  };

  const replaceInput = (input: string, replace: string) => {
    for (let i = 0; i < input.length; i++) {
      if (replace.startsWith(input.slice(i, input.length))) {
        return input.slice(0, i) + replace;
      }
    }
    return input + replace;
  };

  const findAvailable = (input: string, commands: Command[]): string[] => {
    const parts = input.split(" ");
    const lastPart = parts[parts.length - 1];
    const command =
      parts.length <= 1 ? "" : commands.find((cmd) => cmd.name === parts[0]);
    let availables: string[] = [];

    if (input == "" || input == " ") {
      return availables;
    }
    if (
      !command &&
      !input.endsWith(" ") &&
      commands.filter((_) => _.name.startsWith(parts[0])).length != 0
    ) {
      availables.push(
        ...commands
          .filter(
            (cmd) => cmd.name.startsWith(lastPart) && cmd.name != lastPart
          )
          .map((cmd) => cmd.name)
      );
    } else if (command) {
      if (command.options) {
        availables.push(
          ...command.options.filter(
            (opt) => opt.startsWith(lastPart) && opt != lastPart
          )
        );
      }
    }
    if (
      lastPart.startsWith("../") ||
      lastPart.startsWith("./") ||
      lastPart.startsWith("/") ||
      lastPart.includes("\\")
    ) {
      availables.push(...findAvailablePath(lastPart));
    }

    return availables;
  };

  const findAvailablePath = (input: string) => {
    const paths = input.split("/");
    const lastPath = paths.pop();
    const pagePaths = window.location.pathname.split("/").filter(Boolean);
    paths.forEach((element) => {
      if (element === ".") {
        return;
      } else if (element === "..") {
        pagePaths.pop();
      } else {
        pagePaths.push(element);
      }
    });
    return (
      pathList[`${pagePaths.join("/")}/`]?.filter((_) =>
        _.startsWith(lastPath)
      ) ?? []
    );
  };

  const handleOutputBoxScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const isBottom =
      event.currentTarget.scrollTop + event.currentTarget.clientHeight >=
      event.currentTarget.scrollHeight - 10;
    event.currentTarget.classList.toggle(styles["bottom"], isBottom);
  };

  // Effects
  useEffect(() => {
    const cmdHistory = localStorage.getItem("cmdHistory")?.split(",") ?? [];
    setCmdHistory(cmdHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("cmdHistory", cmdHistory.slice(0, 100).join(","));
  }, [cmdHistory]);

  useEffect(() => {
    const username = localStorage.getItem("username") ?? "Anonymous";
    setUsername(username);
    SetUsername(username);
  }, []);

  useEffect(() => {
    localStorage.setItem("username", username);
    SetUsername(username);
  }, [username]);

  useEffect(() => {
    const backgroundImageUrl = localStorage.getItem("backgroundImageUrl") ?? "";
    setBackgroundImageUrl(backgroundImageUrl);
  }, []);

  useEffect(() => {
    localStorage.setItem("backgroundImageUrl", backgroundImageUrl);
  }, [backgroundImageUrl]);

  useEffect(() => {
    AddConsoleLog(
      localStorage.getItem("consoleContent")?.split(",") ?? [
        "Welcome to the console!",
        "Type @#00ffaa'help'@# for available commands",
      ]
    );
    store.subscribe(() => {
      setConsoleContents(store.getState().consoleContent);
    });
  }, []);

  useEffect(() => {
    const consoleVisible = localStorage.getItem("consoleVisible") || "true";
    setConsoleVisible(consoleVisible === "true");
  }, []);

  useEffect(() => {
    if (consoleBox.current)
      consoleBox.current.scrollTop = consoleBox.current.scrollHeight;
    localStorage.setItem(
      "consoleContent",
      consoleContents.slice(-100).join(",")
    );
    localStorage.setItem("consoleVisible", consoleVisible.toString());
  }, [consoleContents, consoleVisible, inputValue]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const paths = window.location.pathname.split("/").filter(Boolean);
      setCurrentURL(`${paths.join("/")}/`); // Change current URL to window.location.pathname instead of `${paths.join("/")}/`
      setAvailableCommands(
        [
          ...commandList["*"],
          ...(commandList[`${paths.join("/")}/`] ?? []),
        ].sort((a, b) => a.name.localeCompare(b.name))
      );
      setAvailablePaths(pathList[`${paths.join("/")}/`] ?? []);
    }
  }, []);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [consoleContents]);

  return (
    <Provider store={store}>
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <img
          src={backgroundImageUrl}
          className={styles["background"]}
          alt="background"
        />

        <div className={styles["container"]}>
          <Component {...pageProps} />
        </div>

        <div
          ref={consoleBox}
          className={`${styles[`console`]} ${
            consoleVisible ? "" : styles[`hidden`]
          }`}
        >
          <div className={styles[`output`]} onScroll={handleOutputBoxScroll}>
            {consoleContents.map((content, index) => (
              <div key={index} className={styles[`output-line`]}>
                <ColorSpan str={content} />
              </div>
            ))}

            <div ref={outputEndRef} />
          </div>

          {available[0] && (
            <div className={styles["prompt"]}>
              <ColorSpan str={"@#FFF700" + available.join("@#, @#FFF700")} />
            </div>
          )}

          <div className={styles[`input`]}>
            <ColorSpan
              str={`@#FF77B7${username}@#@@#FFA24Cwhydog@#:~${currentURL}$ `}
            />
            <input
              ref={inputBox}
              type="text"
              value={`${inputValue}`}
              placeholder="Feel confused? Type 'help' to get started! Press 'Escape' to hide/show the console."
              onChange={handleInputChange}
              onKeyDown={handleEnter}
            />
          </div>
        </div>
      </div>
    </Provider>
  );
}
