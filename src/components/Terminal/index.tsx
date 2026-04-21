import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type * as Types from '@/lib/types';

import { TERMINAL_MIN_WIDTH, TERMINAL_MIN_HEIGHT, DEFAULT_SITE_NAME } from '@/lib/constants';

import { t } from '@/lib/i18n';

import { subscribeTerminal, setActiveTerminal, emitTerminalLog } from '@/lib/terminalLog';

import { findAvailable, findCommandHandler, replaceInput } from '@/lib/terminal';

import { AppContext } from '@/pages/index';

import ColorSpan from '@/components/ColorSpan';

import { IsMobile } from '@/utils';

import styles from './Terminal.module.css';

interface TerminalProps {
  id: string;
  windowState: Types.TerminalWindowState;
  onWindowStateChange: (id: string, state: Types.TerminalWindowState) => void;
  positionOffset: number;
  minimizedIndex: number;
}

export default function Terminal({ id, windowState, onWindowStateChange, positionOffset, minimizedIndex }: TerminalProps) {
  const { extensionArgs, extensionCommands, extensionPaths, currentHash, username } = useContext(AppContext)!;

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    x: IsMobile() ? 0 : window.innerWidth * 0.1 + positionOffset,
    y: IsMobile() ? 0 : window.innerHeight - window.innerHeight * 0.9 + positionOffset,
    width: IsMobile() ? window.innerWidth : window.innerWidth * 0.8,
    height: IsMobile() ? window.innerHeight : window.innerHeight * 0.8,
  });
  const isShifting = useRef(false);
  const isTabbing = useRef(false);

  const [position, setPosition] = useState(() => ({
    x: IsMobile() ? 0 : window.innerWidth * 0.1 + positionOffset,
    y: IsMobile() ? 0 : window.innerHeight - window.innerHeight * 0.9 + positionOffset,
  }));
  const [size, setSize] = useState(() => ({
    width: IsMobile() ? window.innerWidth : window.innerWidth * 0.8,
    height: IsMobile() ? window.innerHeight : window.innerHeight * 0.8,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputTemp, setInputTemp] = useState<string>('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [terminalContents, setTerminalContents] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [available, setAvailable] = useState<string[]>([]);
  const [availableIndex, setAvailableIndex] = useState<number>(0);

  const currentURL = useMemo(() => {
    const hashPaths = currentHash.split('/').filter(Boolean);
    return hashPaths.length > 0 ? `/${hashPaths.join('/')}/` : '/';
  }, [currentHash]);

  const prefix = `@#FF77B7${username}@#@@#FFA24C${window?.location.hostname ?? DEFAULT_SITE_NAME}@#:~${currentURL}$ `;
  const isMinimized = windowState === 'minimized';
  const iconX = window.innerWidth - (1 + minimizedIndex) * 64;
  const iconY = window.innerHeight - 64;

  const handleInputChange = (event) => {
    const input = event.target.value;
    setInputValue(input);

    const available = findAvailable(input, extensionCommands.current, extensionArgs.current, extensionPaths.current, currentHash);
    setAvailable(available);

    if (inputRef.current) {
      inputRef.current.style.color = available.length > 0 ? '#fff700' : '';
    }
  };

  const handleEnter = (event) => {
    if (event.key === 'Enter') {
      if (!inputValue || inputValue == '') return;
      const fullCommand = inputValue;

      setActiveTerminal(id);
      emitTerminalLog(`${prefix}@#fff700${fullCommand}`);
      setCmdHistory([fullCommand, ...cmdHistory]);
      localStorage.setItem('cmdHistory', [fullCommand, ...cmdHistory].slice(0, 100).join(','));
      setCmdHistoryIndex(-1);

      const handler = findCommandHandler(fullCommand, extensionCommands.current);
      if (handler) handler();
      else emitTerminalLog(t('terminal.commandNotFound', fullCommand));

      setActiveTerminal(null);
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
        isTabbing.current = true;
        setInputTemp(input);
        if (isShifting.current) {
          setAvailableIndex(availableIndex == 0 ? available.length - 1 : availableIndex - 1);
        } else {
          setAvailableIndex(availableIndex >= available.length - 1 ? 0 : availableIndex + 1);
        }
      }
    } else if (event.key === 'Shift') {
      event.preventDefault();
    } else if (isTabbing.current) {
      handleInputChange(event);
      isTabbing.current = false;
      isShifting.current = false;
      setInputTemp('');
      setAvailableIndex(0);
    }
  };

  const handleOutputBoxScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const isBottom = event.currentTarget.scrollTop + event.currentTarget.clientHeight >= event.currentTarget.scrollHeight - 10;
    event.currentTarget.classList.toggle(styles['bottom'], isBottom);
  };

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
  };

  useEffect(() => {
    const cmdHistory = localStorage.getItem('cmdHistory')?.split(',') ?? [];
    setCmdHistory(cmdHistory);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
          newW = Math.min(Math.max(TERMINAL_MIN_WIDTH, ref.startWidth + dx), vw - newX);
        }
        if (ref.resizeDir.includes('w')) {
          const maxDx = ref.startPosX;
          const clampedDx = Math.min(dx, ref.startWidth - TERMINAL_MIN_WIDTH);
          const finalDx = Math.max(-maxDx, clampedDx);
          newW = ref.startWidth - finalDx;
          newX = ref.startPosX + finalDx;
        }
        if (ref.resizeDir.includes('s')) {
          newH = Math.min(Math.max(TERMINAL_MIN_HEIGHT, ref.startHeight + dy), vh - newY);
        }
        if (ref.resizeDir.includes('n')) {
          const maxDy = ref.startPosY;
          const clampedDy = Math.min(dy, ref.startHeight - TERMINAL_MIN_HEIGHT);
          const finalDy = Math.max(-maxDy, clampedDy);
          newH = ref.startHeight - finalDy;
          newY = ref.startPosY + finalDy;
        }

        setPosition({ x: newX, y: newY });
        setSize({ width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      interactionRef.current.type = '';
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        isShifting.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        isShifting.current = false;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeTerminal(
      id,
      (messages) => setTerminalContents((prev) => [...prev, ...messages]),
      () => setTerminalContents([]),
    );
    setTerminalContents(t('terminal.welcome'));
    return unsubscribe;
  }, [id]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalContents, inputValue]);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [terminalContents]);

  return (
    <div
      ref={terminalRef}
      data-header
      className={`${styles['terminal']} ${isMinimized ? styles['minimized'] : ''} ${isDragging ? styles['no-transition'] : ''}`}
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
        <p className={styles['title']}>{t('terminal.title')}</p>
      </div>

      <div tabIndex={-1} className={styles['output']} onScroll={handleOutputBoxScroll}>
        {terminalContents.map((content, index) => (
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
        <ColorSpan className={styles['prefix']} str={prefix} />
        <input ref={inputRef} type="text" value={`${inputValue}`} placeholder={t('terminal.placeholder')} onChange={handleInputChange} onKeyDown={handleEnter} />
      </div>
    </div>
  );
}
