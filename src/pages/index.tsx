// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../public/styles/index.module.css";
// Import redux
import store from "../redux/store";
import {
  addConsoleContent,
  setConsoleContent,
} from "../redux/consoleContentSlice";
import { setCommand } from "../redux/commandSlice";

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
        store.dispatch(
          addConsoleContent([`"${command}" is not a valid command`])
        );
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  // Text content
  const textContent = {
    name: ["Whydog", "Whitedog", "白狗"],
    about: [
      "我是 Whydog，來自台灣的大學生。",
      "因為興趣而學習，因為有趣而鑽研。",
      "一步一步成為理想中的自己。",
    ],
    hint: [
      "1. 如果網頁沒有進到輸入模式，可以用滑鼠先點一下 (當然我並不推薦)，或是點一下Tab切過去。",
      "2. 在控制台打上各種指令控制所有動作，每個頁面都有一些不同的指令，可以通過help查詢所有指令",
      "3. 以下是一些常用指令:",
      "help <commad> - 顯示所有指令，輸入指令可以查看更多資訊",
      "cd <page> - 前往指定頁面",
      "cl - 清空控制台",
      "ls - 顯示當前根目錄下的所有頁面",
    ],
  };

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
    <div className={styles["layout"]}>
      <p className={styles["title"]}>為什麼狗狗遊樂場</p>
      <p className={styles["subtitle"]}>
        Whydog 的個人網頁，一個致力於無滑鼠操作的網站
      </p>
      <div className={styles["info-div"]}>
        <div className={styles["container"]} style={{ width: "30%" }}>
          <p className={styles["header"]}>我是誰?</p>
          <div
            className="col"
            style={{ gap: "10px", justifyContent: "center" }}
          >
            <img
              className={styles["profile-picture"]}
              src={profileImage.src}
              alt="Profile Picture"
            />
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
        <div className={styles["container"]} style={{ width: "30%" }}>
          <p className={styles["header"]}>網頁目錄</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <div className="col">{renderWebPaths(webPaths, "")}</div>
          </div>
        </div>
        <div className={styles["container"]} style={{ width: "30%" }}>
          <p className={styles["header"]}>如何操作?</p>
          <div
            className="col"
            style={{ gap: "10px", justifyContent: "center" }}
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
