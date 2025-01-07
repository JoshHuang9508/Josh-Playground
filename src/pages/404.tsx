// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import redux
import store, { AddConsoleLog } from "../redux/store";
import { setCommand } from "../redux/commandSlice";

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
        <p className={"title"}>頁面不存在</p>
        <p className={"subtitle"}>
          未找到頁面，請檢查網址是否正確，或是使用 "cd" 回到首頁
        </p>
      </div>
    </div>
  );
}
