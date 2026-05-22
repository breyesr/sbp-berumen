"use client";

import { clsx } from "clsx";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { AppLocale } from "@/lib/i18n/config";

const OPTIONS: Array<{ locale: AppLocale; labelKey: "i18n.switch_es" | "i18n.switch_en" }> = [
  { locale: "es-MX", labelKey: "i18n.switch_es" },
  { locale: "en-US", labelKey: "i18n.switch_en" },
];

export default function LanguageSwitch({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { locale, setLocale, isSavingLocale, localeSaveError, t } = useI18n();

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        role="group"
        aria-label={t("i18n.switch_aria_label")}
        className={clsx(
          "inline-flex items-center rounded-lg border border-border bg-surface shadow-sm",
          compact ? "p-0.5" : "p-1"
        )}
      >
        {OPTIONS.map((option) => {
          const isActive = locale === option.locale;
          return (
            <button
              key={option.locale}
              type="button"
              onClick={() => void setLocale(option.locale)}
              className={clsx(
                "rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 font-brand",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground-subtle hover:text-foreground hover:bg-surface-hover"
              )}
              disabled={isSavingLocale}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>
      {isSavingLocale ? (
        <p className="text-[9px] text-foreground-subtle font-brand uppercase tracking-tighter">{t("i18n.saving")}</p>
      ) : null}
      {!isSavingLocale && localeSaveError ? (
        <p className="max-w-52 text-right text-[9px] text-error font-bold uppercase tracking-tighter">{localeSaveError}</p>
      ) : null}
    </div>
  );
}
