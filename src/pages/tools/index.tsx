// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../../public/styles/index.module.css";
// Import redux
import store from "../../redux/store";
import {
  addConsoleContent,
  setConsoleContent,
} from "../../redux/consoleContentSlice";
import { setCommand } from "../../redux/commandSlice";
import { addAvailableCommands } from "../../redux/autoCompleteSlice";
// Import json
import textContent from "../../../src/lib/textContent.json";
import availableCommandsList from "../../../src/lib/availableCommandsList.json";

export default function Page() {
  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    switch (command.split(" ")[0]) {
      case "cl":
        store.dispatch(setConsoleContent([]));
        break;
      case "cd":
        const page = command.split(" ")[1] ?? "";
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
        break;
      case "log":
        // Use for debugging
        break;
      default:
        store.dispatch(
          addConsoleContent([`"${command}" is not a valid command`])
        );
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <p className="title">工具</p>
      <p className="subtitle">一些給我自己用的工具，也許你會覺得有趣</p>
      <div className="content-div" style={{ justifyContent: "center" }}>
        {textContent.tools.map((tool, index) => (
          <div key={index} className={"container1"} style={{ width: "30%" }}>
            <p className={"header2"}>{`/tools/${tool}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
