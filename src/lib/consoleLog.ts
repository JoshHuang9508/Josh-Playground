type LogCallback = (messages: string[]) => void;
type ClearCallback = () => void;

const logSubscribers = new Map<string, LogCallback>();
const clearSubscribers = new Map<string, ClearCallback>();
let activeConsoleId: string | null = null;

export function subscribeConsole(
  id: string,
  onLog: LogCallback,
  onClear: ClearCallback,
) {
  logSubscribers.set(id, onLog);
  clearSubscribers.set(id, onClear);
  return () => {
    logSubscribers.delete(id);
    clearSubscribers.delete(id);
  };
}

export function setActiveConsole(id: string | null) {
  activeConsoleId = id;
}

export function emitConsoleLog(...messages: string[]) {
  if (activeConsoleId) {
    logSubscribers.get(activeConsoleId)?.(messages);
  } else {
    logSubscribers.forEach((cb) => cb(messages));
  }
}

export function clearActiveConsole() {
  if (activeConsoleId) {
    clearSubscribers.get(activeConsoleId)?.();
  }
}
