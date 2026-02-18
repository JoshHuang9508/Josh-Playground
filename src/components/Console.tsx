import React, { useCallback, useContext, useEffect, useRef, useState } from "react";

import styles from "@/styles/_app.module.css";

import store, { AddConsoleLog, SetUsername } from "@/redux";
import { setCommand } from "@/redux/commandSlice";

import { AppContext } from "@/hooks/useCommandHandler";

import { Command } from "@/lib/types";

import ColorSpan from "@/components/ColorSpan";

import commandList from "@/lib/command-list.json";
import pathList from "@/lib/path-list.json";
import { CONSOLE_MIN_WIDTH, CONSOLE_MIN_HEIGHT } from "@/constants";

function Console() {
  // Context
  const {
    availableCommands,
    availablePaths,
    setAvailableCommands,
    setAvailablePaths,
    backgroundImageUrl,
    backgroundColor,
    setBackgroundImageUrl,
    setBackgroundColor,
    username,
    setUsername,
  } = useContext(AppContext)!;

  // Refs
  const consoleBox = useRef<HTMLDivElement>(null);
  const inputBox = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef({
    type: "" as "" | "drag" | "resize",
    resizeDir: "",
    startMouseX: 0,
    startMouseY: 0,
    startPosX: 0,
    startPosY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  // States
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth * 0.1,
    y: window.innerHeight - 300 - window.innerHeight * 0.02,
  }));
  const [size, setSize] = useState(() => ({
    width: window.innerWidth * 0.8,
    height: 300,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputTemp, setInputTemp] = useState<string>("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [consoleContents, setConsoleContents] = useState<string[]>([]);
  const [currentURL, setCurrentURL] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [available, setAvailable] = useState<string[]>([]);
  const [availableIndex, setAvailableIndex] = useState<number>(0);
  const [isTabing, setIsTabing] = useState(false);

  // Variables
  const prefix = window
    ? `@#FF77B7${username ?? "Anonymous"}@#@@#FFA24C${window?.location.hostname}@#:~${currentURL}$ `
    : `@#FF77B7${username ?? "Anonymous"}@#@@#FFA24CWhydog@#:~${currentURL}$ `;
  const path = window ? window.location.pathname : "/";

  // Functions
  const findAvailablePath = (input: string) => {
    const paths = input.split("/");
    const lastPath = paths.pop();
    const pagePaths = window.location.pathname.split("/").filter(Boolean);
    paths.forEach((element) => {
      if (element === ".") {
        return;
      } else if (element === "..") {
        pagePaths.pop();
      } else {
        pagePaths.push(element);
      }
    });
    return (
      pathList[`/${pagePaths.join("/")}`]?.filter((_) =>
        _.startsWith(lastPath),
      ) ?? []
    );
  };

  const replaceInput = (input: string, replace: string) => {
    for (let i = 0; i < input.length; i++) {
      if (replace.startsWith(input.slice(i, input.length))) {
        return input.slice(0, i) + replace;
      }
    }
    return input + replace;
  };

  const findAvailable = (input: string, commands: Command[]): string[] => {
    const parts = input.split(" ");
    const lastPart = parts[parts.length - 1];
    const command =
      parts.length <= 1 ? "" : commands.find((cmd) => cmd.name === parts[0]);
    let availables: string[] = [];

    if (input == "" || input == " ") {
      return availables;
    }
    if (
      !command &&
      !input.endsWith(" ") &&
      commands.filter((_) => _.name.startsWith(parts[0])).length != 0
    ) {
      availables.push(
        ...commands
          .filter(
            (cmd) => cmd.name.startsWith(lastPart) && cmd.name != lastPart,
          )
          .map((cmd) => cmd.name),
      );
    } else if (command) {
      if (command.options) {
        availables.push(
          ...command.options.filter(
            (opt) => opt.startsWith(lastPart) && opt != lastPart,
          ),
        );
      }
    }
    if (lastPart.endsWith("/") || input.endsWith(" ")) {
      availables.push(...findAvailablePath(lastPart));
    }

    return availables;
  };

  // Handlers
  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    const available = findAvailable(value, availableCommands);
    setAvailable(available);
    if (inputBox.current) {
      inputBox.current.style.color = available.length > 0 ? "#fff700" : "";
    }
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      if (!inputValue || inputValue == "") return;
      const command = inputValue;
      AddConsoleLog(`${prefix}@#fff700${command}`);
      setCmdHistory([command, ...cmdHistory]);
      setCmdHistoryIndex(-1);

      store.dispatch(setCommand(command));

      handleInputChange({ target: { value: "" } });
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const cmdHistoryLength = cmdHistory.length;
      const newIndex = Math.max(
        -1,
        Math.min(cmdHistoryIndex + 1, cmdHistoryLength - 1),
      );
      setCmdHistoryIndex(newIndex);
      handleInputChange({
        target: { value: newIndex !== -1 ? cmdHistory[newIndex] : "" },
      });
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const cmdHistoryLength = cmdHistory.length;
      const newIndex = Math.max(
        -1,
        Math.min(cmdHistoryIndex - 1, cmdHistoryLength - 1),
      );
      setCmdHistoryIndex(newIndex);
      handleInputChange({
        target: { value: newIndex !== -1 ? cmdHistory[newIndex] : "" },
      });
    }
    // Auto complete
    if (event.key === "Tab") {
      event.preventDefault();
      let input = inputTemp;
      if (!inputValue || inputValue == "") return;
      if (!inputTemp) input = inputValue;
      if (available.length > 0) {
        setInputValue(replaceInput(input, available[availableIndex]));
        setIsTabing(true);
        setInputTemp(input);
        setAvailableIndex(
          availableIndex >= available.length - 1 ? 0 : availableIndex + 1,
        );
      }
    } else if (isTabing) {
      handleInputChange(event);
      setIsTabing(false);
      setInputTemp("");
      setAvailableIndex(0);
    }
  };

  const handleOutputBoxScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const isBottom =
      event.currentTarget.scrollTop + event.currentTarget.clientHeight >=
      event.currentTarget.scrollHeight - 10;
    event.currentTarget.classList.toggle(styles["bottom"], isBottom);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ref = interactionRef.current;
    const dx = e.clientX - ref.startMouseX;
    const dy = e.clientY - ref.startMouseY;

    if (ref.type === "drag") {
      setPosition({ x: ref.startPosX + dx, y: ref.startPosY + dy });
    } else if (ref.type === "resize") {
      let newX = ref.startPosX;
      let newY = ref.startPosY;
      let newW = ref.startWidth;
      let newH = ref.startHeight;

      if (ref.resizeDir.includes("e")) newW = Math.max(CONSOLE_MIN_WIDTH, ref.startWidth + dx);
      if (ref.resizeDir.includes("w")) {
        newW = Math.max(CONSOLE_MIN_WIDTH, ref.startWidth - dx);
        newX = ref.startPosX + ref.startWidth - newW;
      }
      if (ref.resizeDir.includes("s")) newH = Math.max(CONSOLE_MIN_HEIGHT, ref.startHeight + dy);
      if (ref.resizeDir.includes("n")) {
        newH = Math.max(CONSOLE_MIN_HEIGHT, ref.startHeight - dy);
        newY = ref.startPosY + ref.startHeight - newH;
      }

      setPosition({ x: newX, y: newY });
      setSize({ width: newW, height: newH });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    interactionRef.current.type = "";
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles["traffic-lights"]}`)) return;
    e.preventDefault();
    interactionRef.current = {
      type: "drag",
      resizeDir: "",
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      startWidth: size.width,
      startHeight: size.height,
    };
    setIsDragging(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.preventDefault();
    e.stopPropagation();
    interactionRef.current = {
      type: "resize",
      resizeDir: dir,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      startWidth: size.width,
      startHeight: size.height,
    };
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Effects
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        inputBox?.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        inputBox?.current?.focus();
        return;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const cmdHistory = localStorage.getItem("cmdHistory")?.split(",") ?? [];
    setCmdHistory(cmdHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("cmdHistory", cmdHistory.slice(0, 100).join(","));
  }, [cmdHistory]);

  useEffect(() => {
    const username = localStorage.getItem("username") ?? "Anonymous";
    setUsername(username);
    SetUsername(username);
  }, []);

  useEffect(() => {
    localStorage.setItem("username", username);
    SetUsername(username);
  }, [username]);

  useEffect(() => {
    const backgroundImageUrl = localStorage.getItem("backgroundImageUrl") ?? "";
    setBackgroundImageUrl(backgroundImageUrl);
  }, []);

  useEffect(() => {
    localStorage.setItem("backgroundImageUrl", backgroundImageUrl);
  }, [backgroundImageUrl]);

  useEffect(() => {
    const backgroundColor = localStorage.getItem("backgroundColor") ?? "";
    setBackgroundColor(backgroundColor);
  }, []);

  useEffect(() => {
    localStorage.setItem("backgroundColor", backgroundColor);
  }, [backgroundColor]);

  useEffect(() => {
    AddConsoleLog(
      ...(localStorage.getItem("consoleContent")?.split(",") ??
        "Welcome to the console!"),
      "Type @#00ffaa'help'@# for available commands",
    );
    store.subscribe(() => {
      setConsoleContents(store.getState().consoleContent);
    });
  }, []);

  useEffect(() => {
    if (consoleBox.current)
      consoleBox.current.scrollTop = consoleBox.current.scrollHeight;
    localStorage.setItem(
      "consoleContent",
      consoleContents.slice(-100).join(","),
    );
  }, [consoleContents, inputValue]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const paths = window.location.pathname.split("/").filter(Boolean);
      setCurrentURL(`${paths.join("/")}/`);
      setAvailableCommands(
        [
          ...commandList["*"],
          ...(commandList[`${paths.join("/")}/`] ?? []),
        ].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setAvailablePaths(pathList[`/${paths.join("/")}`] ?? []);
    }
  }, []);

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setIsMobile(isMobile);
  }, []);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [consoleContents]);

  return isMobile ? (
    <div className={styles["un-support"]}>
      <ColorSpan
        str={
          "@#FF77B7Mobile device@# is @#FFA24Cnot supported.@# Please use a desktop browser. "
        }
      />
    </div>
  ) : (
    <div
      ref={consoleBox}
      className={styles["console"]}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Resize handles */}
      <div className={`${styles["resize-handle"]} ${styles["resize-n"]}`} onMouseDown={(e) => handleResizeStart(e, "n")} />
      <div className={`${styles["resize-handle"]} ${styles["resize-s"]}`} onMouseDown={(e) => handleResizeStart(e, "s")} />
      <div className={`${styles["resize-handle"]} ${styles["resize-e"]}`} onMouseDown={(e) => handleResizeStart(e, "e")} />
      <div className={`${styles["resize-handle"]} ${styles["resize-w"]}`} onMouseDown={(e) => handleResizeStart(e, "w")} />
      <div className={`${styles["resize-handle"]} ${styles["resize-nw"]}`} onMouseDown={(e) => handleResizeStart(e, "nw")} />
      <div className={`${styles["resize-handle"]} ${styles["resize-ne"]}`} onMouseDown={(e) => handleResizeStart(e, "ne")} />
      <div className={`${styles["resize-handle"]} ${styles["resize-sw"]}`} onMouseDown={(e) => handleResizeStart(e, "sw")} />
      <div className={`${styles["resize-handle"]} ${styles["resize-se"]}`} onMouseDown={(e) => handleResizeStart(e, "se")} />

      {/* Header */}
      <div
        className={`${styles["header"]} ${isDragging ? styles["dragging"] : ""}`}
        onMouseDown={handleDragStart}
      >
        <div className={styles["traffic-lights"]}>
          <span
            className={styles["close"]}
            onClick={() => { }}
          />
          <span
            className={styles["minimize"]}
            onClick={() => { }}
          />
          <span
            className={styles["maximize"]}
            onClick={() => { }}
          />
        </div>
        <p className={styles["title"]}>Console</p>
      </div>

      {/* Output */}
      <div
        tabIndex={-1}
        className={styles["output"]}
        onScroll={handleOutputBoxScroll}
      >
        {consoleContents.map((content, index) => (
          <div key={index} className={styles["output-line"]}>
            <ColorSpan str={content} />
          </div>
        ))}

        <div ref={outputEndRef} />
      </div>

      {available[0] && (
        <div className={styles["prompt"]}>
          <ColorSpan str={`@#FFF700${available.join("@#, @#FFF700")}`} />
        </div>
      )}

      <div className={styles["input"]}>
        <ColorSpan str={prefix} />
        <input
          ref={inputBox}
          type="text"
          value={`${inputValue}`}
          placeholder="Feel confused? Type 'help' to get started!"
          onChange={handleInputChange}
          onKeyDown={handleEnter}
        />
      </div>
    </div>
  );
}

export default Console;
