// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import redux
import store, { AddConsoleLog } from "../redux/store";
import { setCommand } from "../redux/commandSlice";
// Import json

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

  return;
}
