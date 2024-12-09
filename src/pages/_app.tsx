// Import packages
import { useState, useRef, useEffect } from "react";
import store from "../redux/store";
import { Provider } from "react-redux";
// Import styles
import "../../public/styles/global.css";
import styles from "../../public/styles/_app.module.css";
// Import redux
import { addConsoleContent } from "../redux/consoleContentSlice";
import { setCommand } from "../redux/commandSlice";

export default function Page({ Component, pageProps }) {
  // Handle input change
  const [inputValue, setInputValue] = useState("");
  const [currentURL, setCurrentURL] = useState("");
  const inputBox = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentURL(window.location.href);
    }
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      if (!inputValue || inputValue == "") return;
      store.dispatch(setCommand(inputValue));
      store.dispatch(addConsoleContent([`${currentURL}>${inputValue}`]));
      setInputValue("");
    }
  };

  // Handle console
  const [consoleContent, setConsoleContent] = useState<String[]>([]);
  const consoleBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleBox.current)
      consoleBox.current.scrollTop = consoleBox.current.scrollHeight;
  }, [consoleContent]);

  useEffect(() => {
    store.subscribe(() => {
      setConsoleContent(store.getState().consoleContent);
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
      <div style={{ height: "100vh" }}>
        <div className={styles["container"]}>
          <Component {...pageProps} />
        </div>

        <div ref={consoleBox} className={styles["console"]}>
          {consoleContent.map((content, index) => (
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
