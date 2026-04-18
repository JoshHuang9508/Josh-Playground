import { useEffect, useState, useRef, createContext, type MutableRefObject } from 'react';
import { Provider } from 'react-redux';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import type * as Types from '@/lib/types';

import { MUSIC_LIST, TEXT_CONTENT, DEFAULT_SETTINGS, DEFAULT_USERNAME } from '@/lib/constants';

import { applySettingsToDOM, loadSettings, saveSettings, hslString } from '@/lib/settings';

import useBlogPosts from '@/lib/hooks/BlogPosts';

import store from '@/redux';

import TerminalManager from '@/components/TerminalManager';
import HomeView from '@/components/views/Home';
import ListenTogetherView from '@/components/views/ListenTogether';
import NotFoundView from '@/components/views/NotFound';
import ProjectsView from '@/components/views/Projects';
import BlogView from '@/components/views/Blog';
import BlogPostView from '@/components/views/BlogPost';
import OsuStatsView from '@/components/views/OsuStats';
import Navigation from '@/components/Navigation';
import Settings from '@/components/Settings';

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
  setDynamicTitle: (title: string | null) => void;
  setUsername: (name: string) => void;
  setSettings: (s: Types.Settings) => void;
  setIsSettingsOpen: (open: boolean) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

function PageComponent() {
  const { posts } = useBlogPosts();

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const extensionArgs = useRef<Record<string, string[]>>({});
  const extensionCommands = useRef<Types.CommandList>({});
  const extensionPaths = useRef<Record<string, string[]>>({});
  const [settings, setSettingsState] = useState<Types.Settings>(DEFAULT_SETTINGS);
  const [username, setUsername] = useState<string>(DEFAULT_USERNAME);
  const [currentHash, setCurrentHash] = useState<string>('/');
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setSettings = (s: Types.Settings) => {
    setSettingsState(s);
    saveSettings(s);
    applySettingsToDOM(s);
  };

  const handleMusicEnd = () => {
    setMusicIndex((prev) => (prev + 1) % MUSIC_LIST.length);
  };

  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentHash(hash);
      setDynamicTitle(null);
    };
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  useEffect(() => {
    const onInteraction = () => {
      if (!audioPlayerRef.current || isPlaying) return;
      audioPlayerRef.current.play();
      audioPlayerRef.current.volume = 0.05;
      setIsPlaying(true);
    };
    document.addEventListener('click', onInteraction);
    document.addEventListener('touchstart', onInteraction);
    return () => {
      document.removeEventListener('click', onInteraction);
      document.removeEventListener('touchstart', onInteraction);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.src = MUSIC_LIST[musicIndex].path;
    audioPlayerRef.current.play();
    audioPlayerRef.current.volume = 0.05;
  }, [musicIndex]);

  useEffect(() => {
    if (posts.length > 0) {
      extensionPaths.current = { '/blog': posts.map((p) => `${p.slug}/`) };
    }
  }, [posts]);

  useEffect(() => {
    const username = localStorage.getItem('username') ?? DEFAULT_USERNAME;
    setUsername(username);
  }, []);

  useEffect(() => {
    const loaded = loadSettings();
    setSettingsState(loaded);
    applySettingsToDOM(loaded);
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
      case '/osu':
        return <OsuStatsView />;
      default:
        return <NotFoundView />;
    }
  };

  return (
    <Provider store={store}>
      <audio data-audio-player ref={audioPlayerRef} src={MUSIC_LIST[musicIndex].path} onEnded={handleMusicEnd} />
      <Head>
        <title>{dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title}</title>
        <meta name="description" content={TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT['*'].subtitle} />
        <meta property="og:title" content={dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title} />
        <meta property="og:description" content={TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT['*'].subtitle} />
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
          setUsername,
          setDynamicTitle,
          setSettings,
          setIsSettingsOpen,
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
        </div>
      </AppContext.Provider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
