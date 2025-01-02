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

export default function Page({ Component, pageProps }) {
  // Handle input change
  const [inputValue, setInputValue] = useState("");
  const [currentURL, setCurrentURL] = useState("");
  const [commandHistoryIndex, setCommandHistoryIndex] = useState<number>(-1);
  const [autoComplete, setAutoComplete] = useState<string[]>([]);
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
        // case "log":
        //   // Use for debugging
        //   break;
        case "help":
          store.dispatch(
            addConsoleContent([
              "Available commands:",
              "",
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
      const command = inputValue.split(" ")[0];

      // Auto complete
      if (autoComplete.length == 0) {
        const optionList = ["help", "cd", "cl"]; // This list must be updated when new command is added or when in different page
        const autoComplete = optionList.filter((item) =>
          item.startsWith(command)
        );
        store.dispatch(addConsoleContent([`${autoComplete.join(", ")}`]));
        setInputValue(autoComplete[0]);
        setAutoComplete(autoComplete);
      }
      if (autoComplete.length > 0) {
        autoComplete.indexOf(command) == -1
          ? setInputValue(autoComplete[0])
          : autoComplete.indexOf(command) == autoComplete.length - 1
          ? setInputValue(autoComplete[0])
          : setInputValue(autoComplete[autoComplete.indexOf(command) + 1]);
      }
    }
    if (event.key != "Tab") {
      setAutoComplete([]);
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
