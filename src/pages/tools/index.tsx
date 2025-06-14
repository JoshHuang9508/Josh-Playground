import React, { useEffect } from "react";
import { useSelector } from "react-redux";

// Styles
import styles from "@/styles/tools.module.css";

// Redux
import store, { AddConsoleLog } from "@/redux";
import { setCommand } from "@/redux/commandSlice";

// Components
import ColorSpan from "@/components/ColorSpan";

// JSON
import textContent from "@/lib/textContent.json";

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
              style={{ gap: "1rem", fontFamily: "monospace" }}
            >
              <ColorSpan str={item.title} className="header2" />
              <img className={styles["screen-shot"]} />
              <div>
                <ColorSpan str={item.description} className="p1" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
