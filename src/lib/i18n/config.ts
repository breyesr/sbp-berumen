export const LOCALES = ["es-MX", "en-US"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "es-MX";
export const LOCALE_COOKIE_NAME = "sbp_locale";

const LOCALE_ALIASES: Record<string, AppLocale> = {
  es: "es-MX",
  "es-mx": "es-MX",
  en: "en-US",
  "en-us": "en-US",
};

export function normalizeLocale(input: string | null | undefined): AppLocale | undefined {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  return LOCALE_ALIASES[normalized];
}

export function isSupportedLocale(input: string | null | undefined): input is AppLocale {
  return Boolean(normalizeLocale(input));
}

