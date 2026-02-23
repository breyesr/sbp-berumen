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
          "inline-flex items-center rounded-md border border-white/20 bg-[#0d0e10]",
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
                "rounded px-2 py-1 text-xs transition-colors",
                isActive
                  ? "bg-[#4F46E5]/30 text-white"
                  : "text-[#a1a1aa] hover:text-[#ededed]"
              )}
              disabled={isSavingLocale}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>
      {isSavingLocale ? (
        <p className="text-[10px] text-[#a1a1aa]">{t("i18n.saving")}</p>
      ) : null}
      {!isSavingLocale && localeSaveError ? (
        <p className="max-w-52 text-right text-[10px] text-amber-300">{localeSaveError}</p>
      ) : null}
    </div>
  );
}
