import { useEffect, useState } from 'react';

export type GitHubWidgetData = {
  avatarUrl: string;
  bio: string;
  followers: number;
  publicRepos: number;
  latestActivity: {
    repo: string;
    type: string;
    createdAt: string;
  } | null;
};

export type YouTubeWidgetData = {
  channelName: string;
  channelAvatar: string;
  latestVideo: {
    title: string;
    url: string;
    thumbnail: string;
    publishedAt: string;
    views: number | null;
  } | null;
};

export type DiscordWidgetData = {
  avatarUrl: string;
  displayName: string;
  username: string;
  status: string;
  customStatus: string | null;
  activity: {
    name: string;
    details: string | null;
    state: string | null;
    imageUrl: string | null;
    startedAt: number | null;
  } | null;
};

const GITHUB_USERNAME = 'JoshHuang9508';
const DISCORD_USER_ID = '614396443016560649';

function useRemoteData<T>(load: () => Promise<T>, refreshInterval = 0) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const nextData = await load();
        if (!cancelled) setData(nextData);
      } catch {
        // Keep the last successful response when a social service is unavailable.
      }
    };

    void refresh();
    const interval = refreshInterval ? window.setInterval(refresh, refreshInterval) : null;

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [refreshInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

export function useGitHubWidget() {
  return useRemoteData<GitHubWidgetData>(
    async () => {
      const [profileResponse, eventsResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=1`),
      ]);
      if (!profileResponse.ok || !eventsResponse.ok) throw new Error('GitHub is unavailable');

      const profile = await profileResponse.json();
      const events = await eventsResponse.json();
      const latest = events[0];

      return {
        avatarUrl: profile.avatar_url,
        bio: profile.bio ?? '',
        followers: profile.followers ?? 0,
        publicRepos: profile.public_repos ?? 0,
        latestActivity: latest ? { repo: latest.repo.name, type: latest.type.replace(/Event$/, ''), createdAt: latest.created_at } : null,
      };
    },
    5 * 60 * 1000,
  );
}

export function useYouTubeWidget() {
  return useRemoteData<YouTubeWidgetData>(
    async () => {
      const response = await fetch('/api/social/youtube');
      if (!response.ok) throw new Error('YouTube is unavailable');
      return response.json();
    },
    10 * 60 * 1000,
  );
}

export function useDiscordWidget() {
  return useRemoteData<DiscordWidgetData>(async () => {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    if (!response.ok) throw new Error('Discord presence is unavailable');
    const result = await response.json();
    if (!result.success) throw new Error('Discord presence is unavailable');

    const presence = result.data;
    const activity = presence.activities.find((item: { type: number }) => item.type === 0);
    const customStatus = presence.activities.find((item: { type: number }) => item.type === 4);
    const avatar = presence.discord_user.avatar;
    const activityImage = activity?.assets?.large_image;

    return {
      avatarUrl: `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${avatar}.webp?size=160`,
      displayName: presence.discord_user.display_name ?? presence.discord_user.global_name ?? presence.discord_user.username,
      username: presence.discord_user.username,
      status: presence.discord_status,
      customStatus: customStatus?.state ?? null,
      activity: activity
        ? {
            name: activity.name,
            details: activity.details ?? null,
            state: activity.state ?? null,
            imageUrl: activityImage && activity.application_id ? `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activityImage}.png` : null,
            startedAt: activity.timestamps?.start ?? null,
          }
        : null,
    };
  }, 30 * 1000);
}
