type LogCallback = (messages: string[]) => void;
type ClearCallback = () => void;

const logSubscribers = new Map<string, LogCallback>();
const clearSubscribers = new Map<string, ClearCallback>();

let activeTerminalId: string | null = null;

export function subscribeTerminal(id: string, onLog: LogCallback, onClear: ClearCallback) {
  logSubscribers.set(id, onLog);
  clearSubscribers.set(id, onClear);
  return () => {
    logSubscribers.delete(id);
    clearSubscribers.delete(id);
  };
}

export function setActiveTerminal(id: string | null) {
  activeTerminalId = id;
}

export function emitTerminalLog(...messages: string[]) {
  if (activeTerminalId) {
    logSubscribers.get(activeTerminalId)?.(messages);
  } else {
    logSubscribers.forEach((cb) => cb(messages));
  }
}

export function clearActiveTerminalLog() {
  if (activeTerminalId) {
    clearSubscribers.get(activeTerminalId)?.();
  }
}
