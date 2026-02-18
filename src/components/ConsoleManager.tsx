import React, { useEffect, useRef, useState } from "react";

import styles from "@/styles/_app.module.css";

import Console from "@/components/Console";

export type WindowState = "normal" | "minimized" | "maximized" | "closed";

type ConsoleInstance = {
  id: string;
  windowState: WindowState;
  positionOffset: number;
};

function ConsoleManager() {
  const [consoles, setConsoles] = useState<ConsoleInstance[]>([
    { id: "1", windowState: "normal", positionOffset: 0 },
  ]);

  const nextIdRef = useRef(2);
  const nextZIndexRef = useRef(999);

  const addConsole = () => {
    const currentId = nextIdRef.current;
    nextIdRef.current += 1;
    setConsoles((prev) => [
      ...prev,
      { id: String(currentId), windowState: "normal", positionOffset: 0 },
    ]);
  };

  const handleWindowStateChange = (id: string, state: WindowState) => {
    if (state === "closed") {
      setConsoles((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    setConsoles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, windowState: state } : c)),
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        addConsole();
        return;
      }

      if (event.key === "Escape") {
        setConsoles((prev) => {
          const lastMinimized = [...prev]
            .reverse()
            .find((c) => c.windowState === "minimized");
          if (!lastMinimized) return prev;
          return prev.map((c) =>
            c.id === lastMinimized.id
              ? { ...c, windowState: "normal" as WindowState }
              : c,
          );
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const headerEl = (event.target as HTMLElement).closest("[data-header]") as HTMLDivElement;
      if (headerEl) {
        headerEl.style.zIndex = String(nextZIndexRef.current);
        nextZIndexRef.current += 1;
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdownter", onPointerDown);
  }, []);

  const minimizedConsoles = consoles.filter(
    (c) => c.windowState === "minimized",
  );

  return (
    <>
      {consoles.map((c) =>
        c.windowState !== "minimized" ? (
          <Console
            key={c.id}
            id={c.id}
            windowState={c.windowState}
            onWindowStateChange={handleWindowStateChange}
            positionOffset={c.positionOffset}
          />
        ) : null,
      )}

      {minimizedConsoles.length > 0 && (
        <div className={styles["taskbar"]}>
          {minimizedConsoles.map((c) => (
            <div
              key={c.id}
              className={styles["taskbar-item"]}
              onClick={() => handleWindowStateChange(c.id, "normal")}
            >
              <span>Console {c.id}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ConsoleManager;

