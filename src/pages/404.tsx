import React, { useEffect } from "react";
import { useSelector } from "react-redux";

// Redux
import store, { AddConsoleLog } from "@/redux";
import { setCommand } from "@/redux/commandSlice";

// Components
import ColorSpan from "@/components/ColorSpan";

export default function Page() {
  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    const flags =
      command
        .split(" ")
        .slice(1)
        .filter((_) => _.startsWith("-")) ?? "";
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
      <div className={"container1"}>
        <div className="sub-container2" style={{ fontFamily: "monospace" }}>
          <div>
            <ColorSpan str="@#FF77B7Error:@# This page doesn't exist. Use @#00ffaa'cd'@# back to home page" />
          </div>
        </div>
      </div>
    </div>
  );
}
