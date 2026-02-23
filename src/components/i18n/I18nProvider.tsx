"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale, type AppLocale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/translator";
import type { TranslationKey } from "@/lib/i18n/messages";

type I18nContextValue = {
  locale: AppLocale;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  setLocale: (nextLocale: AppLocale) => Promise<void>;
  isSavingLocale: boolean;
  localeSaveError: string | null;
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function setLocaleCookie(locale: AppLocale) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${oneYear}; samesite=lax`;
}

export default function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale ?? DEFAULT_LOCALE);
  const [isSavingLocale, setIsSavingLocale] = useState(false);
  const [localeSaveError, setLocaleSaveError] = useState<string | null>(null);

  useEffect(() => {
    const sessionLocale = normalizeLocale(session?.user?.locale);
    if (status !== "authenticated" || !sessionLocale || sessionLocale === locale) return;
    setLocaleState(sessionLocale);
    setLocaleCookie(sessionLocale);
  }, [status, session?.user?.locale, locale]);

  const t = useMemo(() => createTranslator(locale), [locale]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      t,
      isSavingLocale,
      localeSaveError,
      formatDate: (value, options) =>
        new Intl.DateTimeFormat(locale, options).format(
          value instanceof Date ? value : new Date(value)
        ),
      formatNumber: (value, options) => new Intl.NumberFormat(locale, options).format(value),
      setLocale: async (nextLocale: AppLocale) => {
        if (nextLocale === locale) return;
        const nextT = createTranslator(nextLocale);

        setLocaleSaveError(null);
        setLocaleState(nextLocale);
        setLocaleCookie(nextLocale);
        document.documentElement.lang = nextLocale.toLowerCase();

        if (status !== "authenticated") return;

        setIsSavingLocale(true);
        try {
          const response = await fetch("/api/account/locale", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: nextLocale }),
          });

          if (!response.ok) {
            setLocaleSaveError(nextT("i18n.save_failed"));
            return;
          }

          await update({ locale: nextLocale } as any);
        } catch {
          setLocaleSaveError(nextT("i18n.save_failed"));
        } finally {
          setIsSavingLocale(false);
        }
      },
    };
  }, [locale, t, isSavingLocale, localeSaveError, status, update]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
