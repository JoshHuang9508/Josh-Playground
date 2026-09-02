/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, createContext, type MutableRefObject } from 'react';
import { Provider } from 'react-redux';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import type * as Types from '@/lib/types';

import { DEFAULT_USERNAME } from '@/lib/constants';

import { applySettingsToDOM, loadSettings, saveSettings } from '@/lib/settings';

import useI18n, { I18nProvider } from '@/lib/hooks/i18n';
import { MusicProvider } from '@/lib/hooks/Music';
import useBlogPosts from '@/lib/hooks/BlogPosts';

import store from '@/redux';

import TerminalManager from '@/components/TerminalManager';
import ListenTogetherView from '@/components/views/ListenTogether';
import ProjectsView from '@/components/views/Projects';
import BlogView from '@/components/views/Blog';
import BlogPostView from '@/components/views/BlogPost';
import Settings from '@/components/Settings';
import About from '@/components/About';
import Dock from '@/components/Dock';
import AppWindow from '@/components/AppWindow';
import DesktopWidgets from '@/components/DesktopWidgets';

import styles from './index.module.css';

export type AppContextType = {
  extensionArgs: MutableRefObject<Record<string, string[]>>;
  extensionCommands: MutableRefObject<Types.CommandList>;
  extensionPaths: MutableRefObject<Record<string, string[]>>;
  dynamicTitle: string | null;
  currentHash: string;
  username: string;
  settings: Types.Settings;
  isSettingsOpen: boolean;
  isAboutOpen: boolean;
  isProjectsOpen: boolean;
  isBlogOpen: boolean;
  isListenTogetherOpen: boolean;
  isTerminalOpen: boolean;
  selectedBlogSlug: string | null;
  setExtensionArgs: (args: Record<string, string[]>) => void;
  setExtensionCommands: (commands: Types.CommandList) => void;
  setExtensionPaths: (paths: Record<string, string[]>) => void;
  setDynamicTitle: (title: string | null) => void;
  setUsername: (name: string) => void;
  setSettings: (s: Types.Settings) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsAboutOpen: (open: boolean) => void;
  setIsProjectsOpen: (open: boolean) => void;
  setIsBlogOpen: (open: boolean) => void;
  setIsListenTogetherOpen: (open: boolean) => void;
  setIsTerminalOpen: (open: boolean) => void;
  setSelectedBlogSlug: (slug: string | null) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

function PageInner() {
  const { posts } = useBlogPosts();
  const { t, setLocale } = useI18n();

  const extensionArgs = useRef<Record<string, string[]>>({});
  const extensionCommands = useRef<Types.CommandList>({});
  const extensionPaths = useRef<Record<string, string[]>>({});

  const [settings, setSettingsState] = useState<Types.Settings>(() => loadSettings());
  const [username, setUsername] = useState<string>(() => localStorage.getItem('username') ?? DEFAULT_USERNAME);
  const [currentHash, setCurrentHash] = useState<string>('/');
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isListenTogetherOpen, setIsListenTogetherOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);

  const setExtensionArgs = (args: Record<string, string[]>) => {
    extensionArgs.current = args;
  };

  const setExtensionCommands = (commands: Types.CommandList) => {
    extensionCommands.current = commands;
  };

  const setExtensionPaths = (paths: Record<string, string[]>) => {
    extensionPaths.current = paths;
  };

  const setSettings = (s: Types.Settings) => {
    setSettingsState(s);
    saveSettings(s);
    applySettingsToDOM(s);
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentHash(hash);
      setDynamicTitle(null);
    };
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (currentHash === '/projects') setIsProjectsOpen(true);
    if (currentHash.startsWith('/blog')) setIsBlogOpen(true);
    if (currentHash === '/listentogether') setIsListenTogetherOpen(true);
  }, [currentHash]);

  useEffect(() => {
    if (posts.length > 0) {
      extensionPaths.current = { '/blog': posts.map((p) => `${p.slug}/`) };
    }
  }, [posts]);

  useEffect(() => {
    const locale = localStorage.getItem('locale') ?? 'en';
    setLocale(locale as Types.Locale);
  }, [setLocale]);

  useEffect(() => {
    applySettingsToDOM(loadSettings());
  }, []);

  const renderBlogView = () => selectedBlogSlug ? <BlogPostView slug={selectedBlogSlug} onBack={() => setSelectedBlogSlug(null)} /> : <BlogView onSelectPost={setSelectedBlogSlug} />;

  return (
    <>
      <Head>
        <title>{dynamicTitle ?? t(`${currentHash}.title`)}</title>
        <meta name="description" content={t(`${currentHash}.subtitle`)} />
        <meta property="og:title" content={dynamicTitle ?? t(`${currentHash}.title`)} />
        <meta property="og:description" content={t(`${currentHash}.subtitle`)} />
        <meta property="og:url" content="https://www.whydog.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/preview.png" />
        <link rel="icon" type="image/png" href="/assets/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
        <link rel="shortcut icon" href="/assets/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
        <link rel="manifest" href="/assets/site.webmanifest" />
      </Head>
      <AppContext.Provider
        value={{
          extensionArgs,
          extensionCommands,
          extensionPaths,
          currentHash,
          dynamicTitle,
          username,
          settings,
          isSettingsOpen,
          isAboutOpen,
          isProjectsOpen,
          isBlogOpen,
          isListenTogetherOpen,
          isTerminalOpen,
          selectedBlogSlug,
          setExtensionArgs,
          setExtensionCommands,
          setExtensionPaths,
          setUsername,
          setDynamicTitle,
          setSettings,
          setIsSettingsOpen,
          setIsAboutOpen,
          setIsProjectsOpen,
          setIsBlogOpen,
          setIsListenTogetherOpen,
          setIsTerminalOpen,
          setSelectedBlogSlug,
        }}
      >
        <div className={styles['app']}>
          <img src={settings.backgroundImageUrl || '/assets/bg.jpg'} className={styles['background']} alt="background" />
          <DesktopWidgets />
          <div className={styles['view-container']}>
            <AppWindow appId="projects" title="Projects" isOpen={isProjectsOpen} onClose={() => setIsProjectsOpen(false)}><ProjectsView /></AppWindow>
            <AppWindow appId="blog" title="Blog" isOpen={isBlogOpen} onClose={() => setIsBlogOpen(false)}>{renderBlogView()}</AppWindow>
            <AppWindow appId="listentogether" title="Listen Together" isOpen={isListenTogetherOpen} onClose={() => setIsListenTogetherOpen(false)}><ListenTogetherView /></AppWindow>
          </div>
          <TerminalManager onVisibilityChange={setIsTerminalOpen} />
          <Settings />
          <About />
          <Dock />
        </div>
      </AppContext.Provider>
    </>
  );
}

function PageComponent() {
  return (
    <Provider store={store}>
      <I18nProvider>
        <MusicProvider>
          <PageInner />
        </MusicProvider>
      </I18nProvider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
