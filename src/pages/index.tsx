import { useEffect, useState, useRef, createContext } from 'react';
import { Provider } from 'react-redux';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import type * as Types from '@/lib/types';

import { MUSIC_LIST, TEXT_CONTENT, DEFAULT_SETTINGS } from '@/lib/constants';

import { t } from '@/lib/i18n';

import { applySettingsToDOM, loadSettings, saveSettings } from '@/lib/settings';

import useBlogPosts from '@/lib/hooks/BlogPosts';

import store from '@/redux';

import ConsoleManager from '@/components/ConsoleManager';
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
  extensionArgs: Record<string, string[]>;
  extensionCommands: Types.CommandList;
  extensionPaths: Record<string, string[]>;
  backgroundImageUrl: string;
  backgroundColor: string;
  dynamicTitle: string | null;
  currentHash: string;
  username: string;
  settings: Types.ThemeSettings;
  isSettingsOpen: boolean;
  setExtensionArgs: (args: Record<string, string[]>) => void;
  setExtensionCommands: (cmds: Types.CommandList) => void;
  setExtensionPaths: (paths: Record<string, string[]>) => void;
  setBackgroundImageUrl: (url: string) => void;
  setBackgroundColor: (color: string) => void;
  setDynamicTitle: (title: string | null) => void;
  setUsername: (name: string) => void;
  setSettings: (s: Types.ThemeSettings) => void;
  setIsSettingsOpen: (open: boolean) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

function PageComponent() {
  const { posts } = useBlogPosts();

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const [extensionArgs, setExtensionArgs] = useState<Record<string, string[]>>({});
  const [extensionCommands, setExtensionCommands] = useState<Types.CommandList>({});
  const [extensionPaths, setExtensionPaths] = useState<Record<string, string[]>>({});
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [username, setUsername] = useState<string>(t('global.defaultUsername'));
  const [currentHash, setCurrentHash] = useState<string>('/');
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0);
  const [settings, setSettingsState] = useState<Types.ThemeSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setSettings = (s: Types.ThemeSettings) => {
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
      setExtensionPaths({ '/blog': posts.map((p) => `${p.slug}/`) });
    }
  }, [posts]);

  useEffect(() => {
    const backgroundImageUrl = localStorage.getItem('backgroundImageUrl') ?? '';
    setBackgroundImageUrl(backgroundImageUrl);
  }, []);

  useEffect(() => {
    const backgroundColor = localStorage.getItem('backgroundColor') ?? '';
    setBackgroundColor(backgroundColor);
  }, []);

  useEffect(() => {
    const loaded = loadSettings();
    setSettingsState(loaded);
    applySettingsToDOM(loaded);
  }, []);

  useEffect(() => {
    const username = localStorage.getItem('username') ?? t('global.defaultUsername');
    setUsername(username);
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
        <title>{t('global.siteTitle', dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)}</title>
        <meta name="description" content={TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT['*'].subtitle} />
        <meta property="og:title" content={t('global.siteTitle', dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)} />
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
          backgroundImageUrl,
          backgroundColor,
          currentHash,
          dynamicTitle,
          username,
          settings,
          isSettingsOpen,
          setExtensionArgs,
          setExtensionCommands,
          setExtensionPaths,
          setBackgroundImageUrl,
          setBackgroundColor,
          setUsername,
          setDynamicTitle,
          setSettings,
          setIsSettingsOpen,
        }}
      >
        <div className={styles['app']} style={{ backgroundColor: backgroundColor }}>
          <img src={backgroundImageUrl ? backgroundImageUrl : settings.backgroundImageUrl || '/assets/bg.jpg'} className={styles['background']} alt="background" />
          <div className={styles['view-container']}>
            <Navigation currentHash={currentHash} />
            {renderView()}
          </div>
          <ConsoleManager />
          <Settings />
        </div>
      </AppContext.Provider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
