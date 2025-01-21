// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../../public/styles/tools.module.css";
// Import redux
import store, { AddConsoleLog } from "../../redux/store";
import { setCommand } from "../../redux/commandSlice";
// Import components
import ColorSpan from "../../components/ColorSpan";
// Import json
import textContent from "../../../src/lib/textContent.json";

export default function Page() {
  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    switch (command.split(" ")[0]) {
      case "log":
        // Use for debugging
        break;
      default:
        AddConsoleLog([`Command not found: @#fff700${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div className={"content-div"}>
      {textContent["tools/"].item.map((item, index) => {
        return (
          <div key={index} className={"container1"}>
            <div
              key={index}
              className={"sub-container1"}
              style={{ gap: "1rem" }}
            >
              <ColorSpan str={item.title} className={styles["title"]} />
              <img className={styles["screen-shot"]} />
              <div className={"flex"}>
                <ColorSpan
                  str={item.description}
                  className={styles["description"]}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
