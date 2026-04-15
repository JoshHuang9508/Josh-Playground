import React, { useEffect, useRef, useState } from "react";

import Console from "@/components/Console";

export type WindowState = "normal" | "minimized" | "maximized" | "closed";

type ConsoleInstance = {
  id: string;
  windowState: WindowState;
  positionOffset: number;
};

function ConsoleManager() {
  const nextZIndexRef = useRef(999);

  const [consoles, setConsoles] = useState<ConsoleInstance[]>([
    { id: "1", windowState: "minimized", positionOffset: 0 },
  ]);

  const minimizedIds = consoles
    .filter((c) => c.windowState === "minimized")
    .map((c) => c.id);

  const toggleConsole = () => {
    setConsoles((prev) => {
      if (prev.length === 0) {
        return [{ id: "1", windowState: "normal", positionOffset: 0 }];
      }
      const c = prev[0];
      if (c.windowState === "minimized" || c.windowState === "closed") {
        return [{ ...c, windowState: "normal" }];
      }
      return [{ ...c, windowState: "minimized" }];
    });
  };

  const handleWindowStateChange = (id: string, state: WindowState) => {
    if (state === "closed") {
      setConsoles((prev) =>
        prev.map((c) => (c.id === id ? { ...c, windowState: "minimized" } : c)),
      );
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
        toggleConsole();
        return;
      }

      if (event.key === "Escape") {
        setConsoles((prev) =>
          prev.map((c) =>
            c.windowState === "normal"
              ? { ...c, windowState: "minimized" as WindowState }
              : c,
          ),
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const headerEl = (event.target as HTMLElement).closest(
        "[data-header]",
      ) as HTMLDivElement;
      if (headerEl) {
        headerEl.style.zIndex = String(nextZIndexRef.current);
        nextZIndexRef.current += 1;
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdownter", onPointerDown);
  }, []);

  return (
    <>
      {consoles.map((c) => (
        <Console
          key={c.id}
          id={c.id}
          windowState={c.windowState}
          onWindowStateChange={handleWindowStateChange}
          positionOffset={c.positionOffset}
          minimizedIndex={minimizedIds.indexOf(c.id)}
        />
      ))}
    </>
  );
}

export default ConsoleManager;
