export const locales = ['zh-TW', 'zh-CN', 'ja', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-TW';

export const localeNames: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  'ja': '日本語',
  'en': 'English',
};

export const localeFlags: Record<Locale, string> = {
  'zh-TW': '🇹🇼',
  'zh-CN': '🇨🇳',
  'ja': '🇯🇵',
  'en': '🇺🇸',
};
