"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function AppFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-white/10 py-4 text-xs text-[#a1a1aa]">
      <p>{t("app.footer.tagline")}</p>
    </footer>
  );
}
