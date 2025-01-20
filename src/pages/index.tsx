// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../public/styles/index.module.css";
// Import redux
import store, { AddConsoleLog } from "../redux/store";
import { setCommand } from "../redux/commandSlice";
// Import json
import textContent from "../../src/lib/textContent.json";

import profileImage from "../../public/assets/pfp.png";

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
      <div className={"container1"}>
        <div
          className="flex row"
          style={{
            gap: "1rem",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            className={styles["profile-picture"]}
            src={profileImage.src}
            alt="Profile Picture"
          />
          <div
            className="col"
            style={{
              gap: "1rem",
              justifyContent: "center",
              fontFamily: "monospace",
            }}
          >
            {textContent.home.about.map((content, index) => {
              if (index == 0)
                return (
                  <p className={styles["introduce-title"]} key={index}>
                    {content}
                  </p>
                );
              return (
                <p className={styles["introduce-content"]} key={index}>
                  {content}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
