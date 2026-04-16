import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import type * as Types from '@/lib/types';

import { CONSOLE_MIN_WIDTH, CONSOLE_MIN_HEIGHT, COMMAND_LIST, PATH_LIST } from '@/lib/constants';

import { t } from '@/lib/i18n';

import { subscribeConsole, setActiveConsole } from '@/lib/consoleLog';

import { AppContext } from '@/lib/hooks/CommandHandler';

import { AddConsoleLog, SetCommand } from '@/redux';

import ColorSpan from '@/components/ColorSpan';

import styles from './Console.module.css';

interface ConsoleProps {
  id: string;
  windowState: Types.ConsoleWindowState;
  onWindowStateChange: (id: string, state: Types.ConsoleWindowState) => void;
  positionOffset: number;
  minimizedIndex: number;
}

export default function Console({ id, windowState, onWindowStateChange, positionOffset, minimizedIndex }: ConsoleProps) {
  const { availableCommands, availableArgs, setAvailableCommands, setAvailablePaths, username, setUsername, currentHash } = useContext(AppContext)!;

  const consoleBox = useRef<HTMLDivElement>(null);
  const inputBox = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef({
    type: '' as '' | 'drag' | 'resize',
    resizeDir: '',
    startMouseX: 0,
    startMouseY: 0,
    startPosX: 0,
    startPosY: 0,
    startWidth: 0,
    startHeight: 0,
  });
  const prevLayoutRef = useRef({
    x: window.innerWidth * 0.1 + positionOffset,
    y: window.innerHeight - window.innerHeight * 0.9 + positionOffset,
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.8,
  });

  const [position, setPosition] = useState(() => ({
    x: window.innerWidth * 0.2 + positionOffset,
    y: window.innerHeight - window.innerHeight * 0.9 + positionOffset,
  }));
  const [size, setSize] = useState(() => ({
    width: window.innerWidth * 0.6,
    height: window.innerHeight * 0.8,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputTemp, setInputTemp] = useState<string>('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [consoleContents, setConsoleContents] = useState<string[]>([]);
  const [currentURL, setCurrentURL] = useState<string>('');
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [available, setAvailable] = useState<string[]>([]);
  const [availableIndex, setAvailableIndex] = useState<number>(0);
  const [isTabing, setIsTabing] = useState(false);

  const prefix = window
    ? `@#FF77B7${username ?? t('global.defaultUsername')}@#@@#FFA24C${window?.location.hostname}@#:~${currentURL}$ `
    : `@#FF77B7${username ?? t('global.defaultUsername')}@#@@#FFA24C${t('global.siteName')}@#:~${currentURL}$ `;
  const isMinimized = windowState === 'minimized';
  const iconX = 16 + minimizedIndex * 64;
  const iconY = window.innerHeight - 64;

  const findAvailablePath = (input: string) => {
    const paths = input.split('/');
    const lastPath = paths.pop();
    let pagePaths = currentHash.split('/').filter(Boolean);
    paths.forEach((element, index) => {
      if (index === 0 && element === '~') {
        pagePaths = [];
      } else if (element === '.') {
        return;
      } else if (element === '..') {
        pagePaths.pop();
      } else {
        pagePaths.push(element);
      }
    });
    return PATH_LIST[`/${pagePaths.join('/')}`]?.filter((_) => _.startsWith(lastPath)) ?? [];
  };

  const replaceInput = (input: string, replace: string) => {
    for (let i = 0; i < input.length; i++) {
      if (replace.startsWith(input.slice(i, input.length))) {
        return input.slice(0, i) + replace;
      }
    }
    return input + replace;
  };

  const findAvailable = (input: string, commands: Types.Command[]): string[] => {
    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1];
    const command = parts.length <= 1 ? '' : commands.find((cmd) => cmd.name === parts[0]);
    let availables: string[] = [];

    if (input == '' || input == ' ') {
      return availables;
    }
    if (!command && !input.endsWith(' ') && commands.filter((_) => _.name.startsWith(parts[0])).length != 0) {
      availables.push(...commands.filter((cmd) => cmd.name.startsWith(lastPart) && cmd.name != lastPart).map((cmd) => cmd.name));
    } else if (command) {
      if (command.options) {
        availables.push(...command.options.filter((opt) => opt.startsWith(lastPart) && opt != lastPart));
      }
      const argCompletions = availableArgs[command.name] ?? [];
      availables.push(...argCompletions.filter((a) => a.startsWith(lastPart) && a !== lastPart));
    }
    availables.push(...findAvailablePath(lastPart));

    return availables;
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    const available = findAvailable(value, availableCommands);
    setAvailable(available);
    if (inputBox.current) {
      inputBox.current.style.color = available.length > 0 ? '#fff700' : '';
    }
  };

  const handleEnter = (event) => {
    if (event.key === 'Enter') {
      if (!inputValue || inputValue == '') return;
      const command = inputValue;

      setActiveConsole(id);
      AddConsoleLog(`${prefix}@#fff700${command}`);
      setCmdHistory([command, ...cmdHistory]);
      localStorage.setItem('cmdHistory', [command, ...cmdHistory].slice(0, 100).join(','));
      setCmdHistoryIndex(-1);

      SetCommand(command);

      handleInputChange({ target: { value: '' } });
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const cmdHistoryLength = cmdHistory.length;
      const newIndex = Math.max(-1, Math.min(cmdHistoryIndex + 1, cmdHistoryLength - 1));
      setCmdHistoryIndex(newIndex);
      handleInputChange({
        target: { value: newIndex !== -1 ? cmdHistory[newIndex] : '' },
      });
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const cmdHistoryLength = cmdHistory.length;
      const newIndex = Math.max(-1, Math.min(cmdHistoryIndex - 1, cmdHistoryLength - 1));
      setCmdHistoryIndex(newIndex);
      handleInputChange({
        target: { value: newIndex !== -1 ? cmdHistory[newIndex] : '' },
      });
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      let input = inputTemp;
      if (!inputValue || inputValue == '') return;
      if (!inputTemp) input = inputValue;
      if (available.length > 0) {
        setInputValue(replaceInput(input, available[availableIndex]));
        setIsTabing(true);
        setInputTemp(input);
        setAvailableIndex(availableIndex >= available.length - 1 ? 0 : availableIndex + 1);
      }
    } else if (isTabing) {
      handleInputChange(event);
      setIsTabing(false);
      setInputTemp('');
      setAvailableIndex(0);
    }
  };

  const handleOutputBoxScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const isBottom = event.currentTarget.scrollTop + event.currentTarget.clientHeight >= event.currentTarget.scrollHeight - 10;
    event.currentTarget.classList.toggle(styles['bottom'], isBottom);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ref = interactionRef.current;
    const dx = e.clientX - ref.startMouseX;
    const dy = e.clientY - ref.startMouseY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (ref.type === 'drag') {
      const newX = Math.min(Math.max(0, ref.startPosX + dx), vw - ref.startWidth);
      const newY = Math.min(Math.max(0, ref.startPosY + dy), vh - ref.startHeight);
      setPosition({ x: newX, y: newY });
    } else if (ref.type === 'resize') {
      let newX = ref.startPosX;
      let newY = ref.startPosY;
      let newW = ref.startWidth;
      let newH = ref.startHeight;

      if (ref.resizeDir.includes('e')) {
        newW = Math.min(Math.max(CONSOLE_MIN_WIDTH, ref.startWidth + dx), vw - newX);
      }
      if (ref.resizeDir.includes('w')) {
        const maxDx = ref.startPosX;
        const clampedDx = Math.min(dx, ref.startWidth - CONSOLE_MIN_WIDTH);
        const finalDx = Math.max(-maxDx, clampedDx);
        newW = ref.startWidth - finalDx;
        newX = ref.startPosX + finalDx;
      }
      if (ref.resizeDir.includes('s')) {
        newH = Math.min(Math.max(CONSOLE_MIN_HEIGHT, ref.startHeight + dy), vh - newY);
      }
      if (ref.resizeDir.includes('n')) {
        const maxDy = ref.startPosY;
        const clampedDy = Math.min(dy, ref.startHeight - CONSOLE_MIN_HEIGHT);
        const finalDy = Math.max(-maxDy, clampedDy);
        newH = ref.startHeight - finalDy;
        newY = ref.startPosY + finalDy;
      }

      setPosition({ x: newX, y: newY });
      setSize({ width: newW, height: newH });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    interactionRef.current.type = '';
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleClose = () => {
    onWindowStateChange(id, 'closed');
  };

  const handleMinimize = () => {
    prevLayoutRef.current = {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
    };
    onWindowStateChange(id, 'minimized');
  };

  const handleRestore = () => {
    const prev = prevLayoutRef.current;
    setPosition({ x: prev.x, y: prev.y });
    setSize({ width: prev.width, height: prev.height });
    onWindowStateChange(id, 'normal');
  };

  const handleMaximize = () => {
    if (windowState === 'maximized') {
      const prev = prevLayoutRef.current;
      setPosition({ x: prev.x, y: prev.y });
      setSize({ width: prev.width, height: prev.height });
      onWindowStateChange(id, 'normal');
    } else {
      prevLayoutRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      onWindowStateChange(id, 'maximized');
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles['traffic-lights']}`)) return;
    if (windowState === 'maximized') return;
    e.preventDefault();
    interactionRef.current = {
      type: 'drag',
      resizeDir: '',
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      startWidth: size.width,
      startHeight: size.height,
    };
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.preventDefault();
    e.stopPropagation();
    interactionRef.current = {
      type: 'resize',
      resizeDir: dir,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      startWidth: size.width,
      startHeight: size.height,
    };
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const cmdHistory = localStorage.getItem('cmdHistory')?.split(',') ?? [];
    setCmdHistory(cmdHistory);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeConsole(
      id,
      (messages) => {
        setConsoleContents((prev) => [...prev, ...messages]);
      },
      () => {
        setConsoleContents([]);
      },
    );
    setConsoleContents(t('console.welcome'));
    return unsubscribe;
  }, [id]);

  useEffect(() => {
    if (consoleBox.current) consoleBox.current.scrollTop = consoleBox.current.scrollHeight;
  }, [consoleContents, inputValue]);

  useEffect(() => {
    const hashPaths = currentHash.split('/').filter(Boolean);
    setCurrentURL(hashPaths.length > 0 ? `/${hashPaths.join('/')}/` : '/');
    setAvailableCommands([...COMMAND_LIST['*'], ...(COMMAND_LIST[hashPaths.length > 0 ? `${hashPaths.join('/')}/` : '/'] ?? [])].sort((a, b) => a.name.localeCompare(b.name)));
    setAvailablePaths(PATH_LIST[`/${hashPaths.join('/')}`] ?? []);
  }, [currentHash]);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [consoleContents]);

  return (
    <div
      ref={consoleBox}
      data-header
      className={`${styles['console']} ${isMinimized ? styles['minimized'] : ''} ${isDragging ? styles['no-transition'] : ''}`}
      style={{
        left: isMinimized ? iconX : position.x,
        top: isMinimized ? iconY : position.y,
        width: size.width,
        height: size.height,
        borderRadius: windowState === 'maximized' ? 0 : undefined,
      }}
      onClick={isMinimized ? handleRestore : undefined}
    >
      <div className={styles['minimize-icon']}>
        <span>{'>_'}</span>
      </div>

      {windowState !== 'maximized' && (
        <>
          <div className={`${styles['resize-handle']} ${styles['resize-n']}`} onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className={`${styles['resize-handle']} ${styles['resize-s']}`} onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className={`${styles['resize-handle']} ${styles['resize-e']}`} onMouseDown={(e) => handleResizeStart(e, 'e')} />
          <div className={`${styles['resize-handle']} ${styles['resize-w']}`} onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className={`${styles['resize-handle']} ${styles['resize-nw']}`} onMouseDown={(e) => handleResizeStart(e, 'nw')} />
          <div className={`${styles['resize-handle']} ${styles['resize-ne']}`} onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className={`${styles['resize-handle']} ${styles['resize-sw']}`} onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className={`${styles['resize-handle']} ${styles['resize-se']}`} onMouseDown={(e) => handleResizeStart(e, 'se')} />
        </>
      )}

      <div className={`${styles['header']} ${isDragging ? styles['dragging'] : ''}`} onMouseDown={handleDragStart}>
        <div className={styles['traffic-lights']}>
          <span className={styles['close']} onClick={handleClose} />
          <span className={styles['minimize']} onClick={handleMinimize} />
          <span className={styles['maximize']} onClick={handleMaximize} />
        </div>
        <p className={styles['title']}>{t('console.title')}</p>
      </div>

      <div tabIndex={-1} className={styles['output']} onScroll={handleOutputBoxScroll}>
        {consoleContents.map((content, index) => (
          <div key={index} className={styles['output-line']}>
            <ColorSpan str={content} />
          </div>
        ))}
        <div ref={outputEndRef} />
      </div>

      {available[0] && (
        <div className={styles['prompt']}>
          <ColorSpan str={`@#FFF700${available.join('@#, @#FFF700')}`} />
        </div>
      )}

      <div className={styles['input']}>
        <ColorSpan str={prefix} style={{ minWidth: 'fit-content' }} />
        <input ref={inputBox} type="text" value={`${inputValue}`} placeholder={t('console.placeholder')} onChange={handleInputChange} onKeyDown={handleEnter} />
      </div>
    </div>
  );
}
