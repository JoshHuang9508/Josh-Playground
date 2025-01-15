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
        AddConsoleLog([`Command not found: ${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div className={"layout"}>
      <div className={"title-div"}>
        <p className={`title`}>{textContent.home.title}</p>
        <p className={`subtitle`}>{textContent.home.subtitle}</p>
      </div>
      <div className={"content-div"}>
        <div className={"container2"}>
          <p className={"header1"}></p>
          <div className="row" style={{ justifyContent: "center" }}>
            <div className="col">{}</div>
          </div>
        </div>
        <div className={"container1"}>
          <p className={"header1"}>我是誰?</p>
          <div
            className="row"
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
              style={{ gap: "1rem", justifyContent: "center" }}
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
        <div className={"container2"}>
          <p className={"header1"}></p>
          <div
            className="col"
            style={{ gap: "1rem", justifyContent: "center" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
