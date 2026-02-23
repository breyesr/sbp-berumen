import { DEFAULT_LOCALE, type AppLocale } from "./config";
import { dictionaries, type TranslationDictionary, type TranslationKey } from "./messages";

const TOKEN_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function getDictionary(locale: AppLocale): TranslationDictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function createTranslator(locale: AppLocale) {
  const dictionary = getDictionary(locale);

  return function t(key: TranslationKey, params?: Record<string, string | number>): string {
    const template = dictionary[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? `[missing:${key}]`;
    if (!params) return template;

    return template.replace(TOKEN_REGEX, (_, token: string) => {
      const value = params[token];
      return value === undefined ? `{{${token}}}` : String(value);
    });
  };
}

