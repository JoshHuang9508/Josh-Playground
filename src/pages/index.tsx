/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, createContext, type MutableRefObject } from 'react';
import { Provider } from 'react-redux';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import type * as Types from '@/lib/types';

import { DEFAULT_USERNAME, ABOUT_SEEN_KEY } from '@/lib/constants';

import { applySettingsToDOM, loadSettings, saveSettings } from '@/lib/settings';

import useI18n, { I18nProvider } from '@/lib/hooks/i18n';
import { MusicProvider } from '@/lib/hooks/Music';
import useBlogPosts from '@/lib/hooks/BlogPosts';

import store from '@/redux';

import TerminalManager from '@/components/TerminalManager';
import HomeView from '@/components/views/Home';
import ListenTogetherView from '@/components/views/ListenTogether';
import NotFoundView from '@/components/views/NotFound';
import ProjectsView from '@/components/views/Projects';
import BlogView from '@/components/views/Blog';
import BlogPostView from '@/components/views/BlogPost';
import Navigation from '@/components/Navigation';
import Settings from '@/components/Settings';
import About from '@/components/About';

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
  setExtensionArgs: (args: Record<string, string[]>) => void;
  setExtensionCommands: (commands: Types.CommandList) => void;
  setExtensionPaths: (paths: Record<string, string[]>) => void;
  setDynamicTitle: (title: string | null) => void;
  setUsername: (name: string) => void;
  setSettings: (s: Types.Settings) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsAboutOpen: (open: boolean) => void;
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
  // Open on the visitor's first ever visit, then never again.
  const [isAboutOpen, setIsAboutOpen] = useState(() => !localStorage.getItem(ABOUT_SEEN_KEY));

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

  useEffect(() => {
    localStorage.setItem(ABOUT_SEEN_KEY, '1');
  }, []);

  const renderView = () => {
    if (currentHash.startsWith('/blog/') && currentHash !== '/blog') {
      const slug = currentHash.slice('/blog/'.length);
      return <BlogPostView slug={slug} />;
    }
    switch (currentHash) {
      case '/':
        return <HomeView />;
      case '/projects':
        return <ProjectsView />;
      case '/blog':
        return <BlogView />;
      case '/listentogether':
        return <ListenTogetherView />;
      default:
        return <NotFoundView />;
    }
  };

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
          setExtensionArgs,
          setExtensionCommands,
          setExtensionPaths,
          setUsername,
          setDynamicTitle,
          setSettings,
          setIsSettingsOpen,
          setIsAboutOpen,
        }}
      >
        <div className={styles['app']}>
          <img src={settings.backgroundImageUrl || '/assets/bg.jpg'} className={styles['background']} alt="background" />
          <div className={styles['view-container']}>
            <Navigation currentHash={currentHash} />
            {renderView()}
          </div>
          <TerminalManager />
          <Settings />
          <About />
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
