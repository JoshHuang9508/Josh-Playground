// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../public/styles/index.module.css";
// Import redux
import store from "../redux/store";
import { addConsoleContent } from "../redux/consoleContentSlice";
import { setCommand } from "../redux/commandSlice";
import { addAvailableCommands } from "../redux/autoCompleteSlice";
// Import json
import availableCommandsList from "../lib/availableCommandsList.json";

export default function Page() {
  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    switch (command.split(" ")[0]) {
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
    <div className={"layout"}>
      <p className={"title"}>頁面不存在</p>
      <p className={"subtitle"}>
        未找到頁面，請檢查網址是否正確，或是使用 "cd" 回到首頁
      </p>
    </div>
  );
}
