// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../public/styles/index.module.css";
// Import redux
import store from "../redux/store";
import { addConsoleContent } from "../redux/consoleContentSlice";
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
      case "help":
        store.dispatch(addConsoleContent([]));
        break;
      default:
        store.dispatch(
          addConsoleContent([`"${command}" is not a valid command`])
        );
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  // Web paths
  const webPaths = [["", ["tools", "listentogether"], ["games", "colorgame"]]];

  const renderWebPaths = (paths: any, prefix: string) => {
    return paths.map((path, index) => {
      if (Array.isArray(path)) {
        return index != paths.length - 1 ? (
          <>
            <p key={index}>{`${prefix}├─ ${path[0]}/`}</p>
            <div key={`${index}-container`} style={{ flexDirection: "column" }}>
              {renderWebPaths(
                path.filter((_, i) => i > 0),
                prefix + "│　"
              )}
            </div>
          </>
        ) : (
          <>
            <p key={index}>{`${prefix}└─ ${path[0]}/`}</p>
            <div key={`${index}-container`} style={{ flexDirection: "column" }}>
              {renderWebPaths(
                path.filter((_, i) => i > 0),
                prefix + "　　"
              )}
            </div>
          </>
        );
      } else {
        return index != paths.length - 1 ? (
          <p key={index}>{`${prefix}├─ ${path}`}</p>
        ) : (
          <p key={index}>{`${prefix}└─ ${path}`}</p>
        );
      }
    });
  };

  return (
    <div className={"layout"}>
      <p className={`title`}>為什麼狗狗遊樂場</p>
      <p className={`subtitle`}>
        Whydog 的個人網頁，一個致力於無滑鼠操作的網站
      </p>
      <div className={"content-div"}>
        <div className={"container1"} style={{ flex: 0.5 }}>
          <p className={"header1"}>網頁目錄</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <div className="col">{renderWebPaths(webPaths, "")}</div>
          </div>
        </div>
        <div className={"container1"}>
          <p className={"header1"}>我是誰?</p>
          <div
            className="row"
            style={{ gap: "1rem", justifyContent: "center" }}
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
              {textContent.about.map((content, index) => {
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
        <div className={"container1"} style={{ flex: 0.5 }}>
          <p className={"header1"}>如何操作?</p>
          <div
            className="col"
            style={{ gap: "1rem", justifyContent: "center" }}
          >
            {textContent.hint.map((hint, index) => (
              <p key={index}>{hint}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
