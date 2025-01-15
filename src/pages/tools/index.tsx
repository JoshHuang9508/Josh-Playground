// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import redux
import store, { AddConsoleLog } from "../../redux/store";
import { setCommand } from "../../redux/commandSlice";
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
        AddConsoleLog([`Command not found: ${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div className={"layout"}>
      <div className={"title-div"}>
        <p className="title">{textContent.tools.title}</p>
        <p className="subtitle">{textContent.tools.subtitle}</p>
      </div>
      <div className="content-div" style={{ justifyContent: "center" }}>
        <div className={"container1"}>
          <p className={"header2"}>{textContent.tools.listentogether.title}</p>
        </div>
      </div>
    </div>
  );
}
