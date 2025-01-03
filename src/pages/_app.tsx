// Import packages
import { useState, useRef, useEffect, use } from "react";
import store from "../redux/store";
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
import {
  addAvailableCommands,
  setAvailableCommands,
  setInput,
} from "../redux/autoCompleteSlice";
// Import json
import availableCommandsList from "../lib/availableCommandsList.json";

export default function Page({ Component, pageProps }) {
  // Handle input change
  const [inputValue, setInputValue] = useState("");
  const [currentURL, setCurrentURL] = useState("");
  const [commandHistoryIndex, setCommandHistoryIndex] = useState<number>(-1);
  const inputBox = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentURL(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (store.getState().commandHistory.length == 0) return;
    if (commandHistoryIndex < -1) {
      setCommandHistoryIndex(-1);
    }
    if (commandHistoryIndex > store.getState().commandHistory.length - 1) {
      setCommandHistoryIndex(store.getState().commandHistory.length - 1);
    }
    setInputValue(
      commandHistoryIndex != -1
        ? (store.getState().commandHistory[commandHistoryIndex] as string)
        : ""
    );
  }, [commandHistoryIndex]);

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
        case "cl":
          store.dispatch(setConsoleContent([]));
          break;
        case "cd":
          const page = inputValue.split(" ")[1] ?? "";
          const link = window.location.href.split("/");
          if (!page) {
            window.location.href = "/";
            break;
          } else {
            page.split("/").forEach((element) => {
              if (element == "..") {
                link.pop();
              } else if (element != "") {
                link.push(element);
              }
            });
            window.location.href = link.join("/");
          }
          break;
        case "help":
          store.dispatch(
            addConsoleContent([
              "Available commands:",
              "--| Basic commands |--",
              "help <command> - Show help message, type command to get more info",
              "cd <page> - Redirect to page",
              "cl - Clear console",
            ])
          );
        // Set command
        default:
          store.dispatch(setCommand(inputValue));
          setCommandHistoryIndex(-1);
          break;
      }
      setInputValue("");
    }
    if (event.key === "ArrowUp") {
      setCommandHistoryIndex(commandHistoryIndex + 1);
    }
    if (event.key === "ArrowDown") {
      setCommandHistoryIndex(commandHistoryIndex - 1);
    }
    if (event.key === "Escape") {
      setConsoleVisible(!consoleVisible);
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const availableCommands = store.getState().autoComplete.availableCommands;
      const { command, value, prefix } = processString(inputValue);

      // Auto complete
      if (availableCommands.length == 0) {
        if (!inputValue || inputValue == "") return;

        const availableCommands =
          value && value != ""
            ? availableCommandsList[value.replace(" ", "")]?.filter((item) =>
                item.startsWith(prefix)
              ) ?? []
            : command && command != ""
            ? availableCommandsList[command.replace(" ", "")]?.filter((item) =>
                item.startsWith(prefix)
              ) ?? []
            : availableCommandsList[window.location.pathname]?.filter((item) =>
                item.startsWith(prefix)
              ) ?? [];

        if (availableCommands.length > 0) {
          store.dispatch(
            addConsoleContent([`${availableCommands.join(", ")}`])
          );
          store.dispatch(addAvailableCommands(availableCommands));
        }
      } else {
        availableCommands.indexOf(prefix) == -1
          ? setInputValue(`${command}${value}${availableCommands[0]}`)
          : availableCommands.indexOf(prefix) == availableCommands.length - 1
          ? setInputValue(`${command}${value}${availableCommands[0]}`)
          : setInputValue(
              `${command}${value}${
                availableCommands[availableCommands.indexOf(prefix) + 1]
              }`
            );
      }
    }
    if (event.key != "Tab") {
      store.dispatch(setInput(""));
      store.dispatch(setAvailableCommands([]));
    }
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

  // Process string
  const processString = (input: string) => {
    const lastSeparatorIndex =
      input.lastIndexOf(" ") > input.lastIndexOf("/")
        ? input.lastIndexOf(" ")
        : input.lastIndexOf("/");
    const firstSpaceIndex = input.indexOf(" ");
    if (firstSpaceIndex === -1) {
      return { command: "", value: "", prefix: input };
    }
    const command = inputValue.slice(0, firstSpaceIndex + 1);
    const value = inputValue.slice(firstSpaceIndex + 1, lastSeparatorIndex + 1);
    const prefix = inputValue.slice(lastSeparatorIndex + 1, inputValue.length);
    return { command, value, prefix };
  };

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
