import { API_URL } from '@/lib/constants';

import type * as Types from '@/lib/types';

import { t } from '@/lib/i18n';

export async function getVideoBlob(videoId: string, format: string): Promise<any> {
  switch (format) {
    case 'mp4':
      const blob_mp4 = await fetch(`${API_URL}/api/ytdownload-mp4?videoId=${videoId}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }).then(async (response) => {
        const contentType = response.headers.get('Content-Type');
        if (!response.ok) {
          if (contentType === 'application/json') {
            const res = await response.json();
            throw new Error(res.message);
          }
          throw new Error(t('errors.mp4Failed'));
        }
        return response.blob();
      });

      return blob_mp4;
    case 'mp3':
      const blob_mp3 = await fetch(`${API_URL}/api/ytdownload-mp3?videoId=${videoId}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }).then(async (response) => {
        const contentType = response.headers.get('Content-Type');
        if (!response.ok) {
          if (contentType === 'application/json') {
            const res = await response.json();
            throw new Error(res.message);
          }
          throw new Error(t('errors.mp3Failed'));
        }
        return response.blob();
      });

      return blob_mp3;
  }
}

export const getVideoInfo = async (videoId: string, requestBy: string): Promise<Types.Track> => {
  const res = await fetch(`${API_URL}/api/ytdl?videoId=${videoId}`, {
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  });

  const { data } = await res.json();

  const track: Types.Track = {
    url: data.video_url,
    title: data.title,
    author: data.ownerChannelName,
    img: data.thumbnails[data.thumbnails.length - 1].url,
    requestBy: requestBy,
    id: Date.now(),
  };

  return track;
};

export const getPlaylist = async (playlistId: string, requestBy: string): Promise<Types.Track[]> => {
  const res = await fetch(`${API_URL}/api/ytpl?playlistId=${playlistId}`, {
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  });

  const { data } = await res.json();

  const tracks: Types.Track[] = data.map((item: any, index) => {
    return {
      url: item.shortUrl,
      title: item.title,
      author: item.author.name,
      img: item.thumbnails[item.thumbnails.length - 1].url,
      requestBy: requestBy,
      id: `${index}-${Date.now()}`,
    };
  });

  return tracks;
};
