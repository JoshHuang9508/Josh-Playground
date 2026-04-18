import { CUSTOM_COLOR_TAG_REGEX } from '@/lib/constants';

export function escapeCustomColorTags(str: string): string {
  return str.replace(CUSTOM_COLOR_TAG_REGEX, (_match, _color, content) => {
    return content;
  });
}
