/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type * as Types from '@/lib/types';

import { TEXT_CONTENT_EN, TEXT_CONTENT_ZH } from '@/lib/locales';

type TextContentType = { [key: string]: string | string[] | TextContentType };

type I18nContextValue = {
  t: (key: string, ...args: string[]) => any;
  setLocale: (locale: Types.Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [activeTextContent, setActiveTextContent] = useState<TextContentType>(TEXT_CONTENT_EN);

  const setLocale = useCallback((locale: Types.Locale) => {
    setActiveTextContent(locale === 'zh' ? TEXT_CONTENT_ZH : TEXT_CONTENT_EN);
  }, []);

  /**
   * Template interpolation helper for i18n.
   * Usage: t("terminal.placeholder") => "Feel confused? Type 'help' to get started!"
   *        t("terminal.commandNotFound", "xyz") => "Command not found: @#fff700xyz"
   *
   * Supports {0}, {1}, ... placeholders in the string.
   */
  const t = useCallback(
    (key: string, ...args: string[]): any => {
      const keys = key.split('.');
      let value: unknown = activeTextContent;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as TextContentType)[k];
        } else {
          return key;
        }
      }
      if (typeof value === 'string') {
        return value.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)] ?? '');
      } else if (Array.isArray(value)) {
        return value.map((item) => item.replace(/\{(\d+)\}/g, (_, i) => args[parseInt(i)] ?? ''));
      } else {
        return key;
      }
    },
    [activeTextContent],
  );

  const value = useMemo(() => ({ t, setLocale }), [t, setLocale]);

  return createElement(I18nContext.Provider, { value }, children);
}

export default function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
