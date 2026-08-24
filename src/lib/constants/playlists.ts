import type * as Types from '@/lib/types';

/**
 * Background music playlists, pulled straight from YouTube by playlist ID.
 *
 * The ID is the `list=` value in a playlist URL, e.g.
 *   https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *                                          ^--------- this part ---------^
 *
 * The first entry is the one that plays on load. An empty array simply leaves
 * the player card in its "nothing configured" state.
 */
export const MUSIC_PLAYLISTS: Types.MusicPlaylist[] = [
  { id: 'PLlaxXCMiGQ4SyqJN1we5H3gCl4O6JumBG', name: '歌曲堆放處', coverVideoId: 'GNkPJvVEm0s' },
  { id: 'PLlaxXCMiGQ4RA5M436yQdiMV7SL-WI32S', name: 'Banger', coverVideoId: 'YHlcmmkiwbU' },
];

export const MUSIC_VOLUME = 0.3;

export const youtubeThumbnail = (videoId: string) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
