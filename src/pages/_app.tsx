// Import packages
import { useState, useRef, useEffect } from "react";
import store, { AddConsoleLog } from "../redux/store";
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
import { addCoomandHistory } from "../redux/commandHistorySlice";
import { setAvailable, setIndex, setInput } from "../redux/autoCompleteSlice";
// Import types
import { Command } from "../lib/types";
// Import json
import commandList from "../lib/commandList.json";
import pathList from "../lib/pathList.json";

export default function Page({ Component, pageProps }) {
  const [availableCommands, setAvailableCommands] = useState<Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const paths = window.location.pathname.split("/").filter(Boolean);
      setCurrentURL(window.location.href);
      setAvailableCommands([
        ...commandList["/"],
        ...(commandList[`${paths.join("/")}/`] ?? []),
      ]);
      setAvailablePaths(pathList[`${paths.join("/")}/`] ?? []);
    }
  }, []);

  // Handle input change
  const [inputValue, setInputValue] = useState<string>("");
  const [currentURL, setCurrentURL] = useState<string>("");
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const inputBox = useRef(null);

  useEffect(() => {
    const cmdHistory = store.getState().commandHistory;
    const cmdHistoryLength = cmdHistory.length;
    const newIndex = Math.max(
      -1,
      Math.min(cmdHistoryIndex, cmdHistoryLength - 1)
    );
    setCmdHistoryIndex(newIndex);
    setInputValue(newIndex !== -1 ? cmdHistory[newIndex] : "");
  }, [cmdHistoryIndex]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      if (!inputValue || inputValue == "") return;
      store.dispatch(addConsoleContent([`${currentURL}>${inputValue}`]));
      store.dispatch(addCoomandHistory(inputValue));
      // Catch basic command
      switch (inputValue.split(" ")[0]) {
        case "help":
          AddConsoleLog(["Available commands:", "---"]);
          availableCommands.forEach((command: Command) => {
            AddConsoleLog([`${command.usage} - ${command.description}`]);
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
          AddConsoleLog([availablePaths.join(" ")]);
          break;
        // Set command
        default:
          store.dispatch(setCommand(inputValue));
          setCmdHistoryIndex(-1);
          break;
      }
      setInputValue("");
    }
    if (event.key === "ArrowUp") {
      setCmdHistoryIndex(cmdHistoryIndex + 1);
    }
    if (event.key === "ArrowDown") {
      setCmdHistoryIndex(cmdHistoryIndex - 1);
    }
    if (event.key === "Escape") {
      setConsoleVisible(!consoleVisible);
    }
    // Auto complete
    if (event.key === "Tab") {
      event.preventDefault();
      if (!inputValue || inputValue == "") return;
      let input = store.getState().autoComplete.input;
      let available = store.getState().autoComplete.available;
      let index = store.getState().autoComplete.index;
      if (!input) input = inputValue;
      if (available.length == 0) {
        available = autoComplete(input, availableCommands);
      }
      if (available.length > 0) {
        setInputValue(replaceInput(input, available[index]));
        const newIndex = index === available.length - 1 ? 0 : index + 1;
        store.dispatch(setAvailable(available));
        store.dispatch(setInput(input));
        store.dispatch(setIndex(newIndex));
      }
    }
    if (event.key != "Tab") {
      store.dispatch(setInput(""));
      store.dispatch(setAvailable([]));
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

    if (
      !command &&
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

  // Handle console
  const [consoleContents, setConsoleContents] = useState<String[]>([]);
  const [consoleVisible, setConsoleVisible] = useState(true);
  const consoleBox = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    if (consoleBox.current)
      consoleBox.current.scrollTop = consoleBox.current.scrollHeight;
  }, [store.getState().consoleContent, consoleVisible]);

  useEffect(() => {
    store.subscribe(() => {
      setConsoleContents(store.getState().consoleContent);
    });
    store.dispatch(
      addConsoleContent([
        "Welcome to the console!",
        "Type 'help' for available commands",
      ])
    );
  }, []);

  return (
    <Provider store={store}>
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div className={styles["container"]}>
          <Component {...pageProps} />
        </div>

        <div
          ref={consoleBox}
          className={`${styles["console"]} ${
            styles[consoleVisible ? "visible" : "hidden"]
          }`}
        >
          {consoleContents.map((content, index) => (
            <p key={index}>{content}</p>
          ))}
          <div>
            <span>{`${currentURL}>`}</span>
            <input
              ref={inputBox}
              type="text"
              value={`${inputValue}`}
              placeholder=""
              onChange={handleInputChange}
              onKeyDown={handleEnter}
            />
          </div>
        </div>
      </div>
    </Provider>
  );
}
