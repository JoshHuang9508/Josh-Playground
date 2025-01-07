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
        AddConsoleLog([`"${command}" is not a valid command`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div className={"layout"}>
      <div className={"title-div"}>
        <p className="title">工具</p>
        <p className="subtitle">一些給我自己用的工具，也許你會覺得有趣</p>
      </div>
      <div className="content-div" style={{ justifyContent: "center" }}>
        {textContent.tools.map((tool, index) => (
          <div key={index} className={"container1"}>
            <p className={"header2"}>{`/tools/${tool}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
