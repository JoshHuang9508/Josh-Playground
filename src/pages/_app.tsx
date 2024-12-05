// Import ...
import { useState, useRef, useEffect } from "react";
import store from "../redux/store";
// Import styles
import "../../public/styles/global.css";
import {
  addConsoleContent,
  setConsoleContent,
} from "../redux/consoleContentSlice";

export default function Page({ Component, pageProps }) {
  // Handle input change
  const [inputValue, setInputValue] = useState("");
  const inputBox = useRef(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Maybe change it to a event and add listeners in different page
  const handleEnter = (event) => {
    if (event.key === "Enter" && inputValue) {
      store.dispatch(addConsoleContent([inputValue]));
      switch (inputValue.split(" ")[0]) {
        case "clear":
          store.dispatch(setConsoleContent([]));
          break;
        case "goto":
          const page = inputValue.split(" ")[1] ?? "";
          store.dispatch(addConsoleContent([`Going to ${page}...`]));
          if (page || page === "") {
            window.location.href = `/${page}`;
          } else {
            store.dispatch(addConsoleContent(["Please provide a page"]));
          }
          break;
        case "back":
          store.dispatch(addConsoleContent(["Going back..."]));
          window.history.back();
          break;
        case "help":
          store.dispatch(
            addConsoleContent([
              "Available commands:",
              "help <command> - Show help message, type command to get more info",
              "goto <page> - Redirect to page",
              "back - Go back",
              "clear - Clear console",
            ])
          );
          break;
        case "log":
          store.dispatch(addConsoleContent(store.getState().consoleContent));
          break;
        default:
          store.dispatch(
            addConsoleContent([`"${inputValue}" is not a valid command`])
          );
          break;
      }
      setInputValue("");
    }
  };

  // Handle console
  const consoleContent = store.getState().consoleContent;
  const consoleBox = useRef<HTMLDivElement>(null);

  // Listener for diffent pages callbacks
  const handleConsoleInput = (input) => {
    store.dispatch(addConsoleContent(input));
  };

  useEffect(() => {
    if (consoleBox.current)
      consoleBox.current.scrollTop = consoleBox.current.scrollHeight;
  }, [consoleContent]);

  return (
    <>
      <Component {...pageProps} />
      <div
        style={{
          flex: "1",
          position: "absolute",
          bottom: "0",
          width: "100vw",
        }}
      >
        <div
          ref={consoleBox}
          style={{
            flex: "1",
            flexDirection: "column-reverse",
            padding: "10px",
            background: "none",
            width: "100%",
            height: "400px",
            color: "white",
            fontSize: "16px",
            overflowY: "scroll",
            border: "1px solid white",
          }}
        >
          {consoleContent.map((content, index) => (
            <p style={{ margin: 2, fontFamily: "monospace" }} key={index}>
              {content}
            </p>
          ))}
        </div>

        <input
          ref={inputBox}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder=">/..."
          style={{
            padding: "10px",
            background: "none",
            width: "100%",
            color: "white",
            fontSize: "16px",
            border: "1px solid white",
            fontFamily: "monospace",
          }}
          onKeyDown={handleEnter}
        />
      </div>
    </>
  );
}
