// Import packages
import { useState, useRef, useEffect } from "react";
import store, { AddConsoleLog, SetUsername } from "../redux/store";
import { Provider } from "react-redux";
// Import styles
import "../../public/styles/global.css";
import styles from "../../public/styles/_app.module.css";
// Import redux
import {
  addConsoleContent,
  setConsoleContent,
} from "../redux/consoleContentSlice";
import { setCommand } from "../redux/commandSlice";
// Import components
import ColorSpan from "../components/ColorSpan";
// Import types
import { Command } from "../lib/types";
// Import json
import textContent from "../lib/textContent.json";
import commandList from "../lib/commandList.json";
import pathList from "../lib/pathList.json";

import backgroundImage from "../../public/assets/bg.jpg";

const webPaths = [["", ["tools", "listentogether"], ["games", "colorgame"]]];

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
  const [availableCommands, setAvailableCommands] = useState<Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const paths = window.location.pathname.split("/").filter(Boolean);
      setCurrentURL(`${paths.join("/")}/`); // Change current URL to window.location.pathname instead of `${paths.join("/")}/`
      setAvailableCommands([
        ...commandList["*"],
        ...(commandList[`${paths.join("/")}/`] ?? []),
      ]);
      setAvailablePaths(pathList[`${paths.join("/")}/`] ?? []);
    }
  }, []);

  // Handle User
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    setUsername(localStorage.getItem("username") ?? "Anonymous");
  }, []);

  useEffect(() => {
    localStorage.setItem("username", username);
    SetUsername(username);
  }, [username]);

  // Handle input change
  const [inputValue, setInputValue] = useState<string>("");
  const [inputTemp, setInputTemp] = useState<string>("");
  const [currentURL, setCurrentURL] = useState<string>("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [available, setAvailable] = useState<string[]>([]);
  const [availableIndex, setAvailableIndex] = useState<number>(0);
  const [isTabing, setIsTabing] = useState(false);
  const inputBox = useRef<HTMLInputElement>(null);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    const available = autoComplete(value, availableCommands);
    setAvailable(available);
    if (inputBox.current) {
      inputBox.current.style.color = available.length > 0 ? "#fff700" : "";
    }
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      if (!inputValue || inputValue == "") return;
      store.dispatch(
        addConsoleContent([
          `@#FF77B7${username}@#@@#FFA24Cwhydog@#:~${currentURL}$ @#fff700${inputValue}`,
        ])
      );
      setCmdHistory([inputValue, ...cmdHistory]);
      // Catch basic command
      switch (inputValue.split(" ")[0]) {
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
          const page = inputValue.split(" ")[1] ?? "";
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
          const flag = inputValue.split(" ")[1] ?? "";
          if (flag == "-l") {
            console.log(renderWebPaths(webPaths, ""));
            renderWebPaths(webPaths, "").forEach((path) => {
              AddConsoleLog([path]);
            });
            break;
          }
          AddConsoleLog([availablePaths.join(" ")]);
          break;
        case "background":
          const url = inputValue.split(" ")[1] ?? "";
          if (url) {
            document.body.style.backgroundImage = `url(${url})`;
          }
          break;
        case "username":
          const name = inputValue.split(" ").slice(1)[0] ?? "";
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
          store.dispatch(setCommand(inputValue));
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

  const autoComplete = (input: string, commands: Command[]): string[] => {
    const parts = input.split(" ");
    const lastPart = parts[parts.length - 1];
    const command =
      parts.length <= 1 ? "" : commands.find((cmd) => cmd.name === parts[0]);
    let suggestions: string[] = [];

    if (input == "" || input == " ") {
      return suggestions;
    }
    if (
      !command &&
      !input.endsWith(" ") &&
      commands.filter((_) => _.name.startsWith(parts[0])).length != 0
    ) {
      suggestions.push(
        ...commands
          .filter(
            (cmd) => cmd.name.startsWith(lastPart) && cmd.name != lastPart
          )
          .map((cmd) => cmd.name)
      );
    } else if (command) {
      // suppose that sub-sub-commands are not supported
      if (command.subCommands) {
        suggestions.push(
          ...command.subCommands
            .filter(
              (cmd) => cmd.name.startsWith(lastPart) && cmd.name != lastPart
            )
            .map((cmd) => cmd.name)
        );
      }
      if (command.options) {
        suggestions.push(
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
      suggestions.push(...completePath(lastPart));
    }

    return suggestions;
  };

  const completePath = (input: string) => {
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

  useEffect(() => {
    setCmdHistory(localStorage.getItem("cmdHistory")?.split(",") ?? []);
  }, []);

  useEffect(() => {
    localStorage.setItem("cmdHistory", cmdHistory.slice(0, 100).join(","));
  }, [cmdHistory]);

  // Handle console
  const [consoleContents, setConsoleContents] = useState<string[]>([]);
  const [consoleVisible, setConsoleVisible] = useState(true);
  const consoleBox = useRef<HTMLDivElement>(null);

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
    setConsoleVisible(localStorage.getItem("consoleVisible") === "true");
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

  return (
    <Provider store={store}>
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <img src={backgroundImage.src} className={styles["background"]} />

        <div className={styles["container"]}>
          <div className={styles["title"]}>
            <p className={"title"}>
              {textContent[currentURL]?.title ?? textContent["*"].title}
            </p>
            <p className={"subtitle"}>
              {textContent[currentURL]?.subtitle ?? textContent["*"].subtitle}
            </p>
          </div>
          <div className={styles["content"]}>
            <Component {...pageProps} />
          </div>
        </div>

        <div
          ref={consoleBox}
          className={`${styles[`console`]} ${
            consoleVisible ? "" : styles[`hidden`]
          }`}
        >
          {consoleContents.map((content, index) => (
            <div key={index} className={styles[`output`]}>
              <ColorSpan str={content} />
            </div>
          ))}
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
              placeholder="Feel confused? Type 'help' to get started!"
              onChange={handleInputChange}
              onKeyDown={handleEnter}
            />
          </div>
        </div>
      </div>
    </Provider>
  );
}
