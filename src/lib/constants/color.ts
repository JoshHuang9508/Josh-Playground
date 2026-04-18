export const CUSTOM_COLOR_TAG_PREFIX = '@#';
export const CUSTOM_COLOR_TAG_SUFFIX = '@#';
export const CUSTOM_COLOR_TAG_REGEX = new RegExp(`${CUSTOM_COLOR_TAG_PREFIX}([0-9a-fA-F]{3,6})(.+?)(${CUSTOM_COLOR_TAG_SUFFIX}|$)`, 'g');
