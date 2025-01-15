// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import redux
import store, { AddConsoleLog } from "../redux/store";
import { setCommand } from "../redux/commandSlice";
// Import json
import textContent from "../../src/lib/textContent.json";

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
        AddConsoleLog([`Command not found: ${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div className={"layout"}>
      <div className={"title-div"}>
        <p className="title">{textContent[404].title}</p>
        <p className="subtitle">{textContent[404].subtitle}</p>
      </div>
    </div>
  );
}
