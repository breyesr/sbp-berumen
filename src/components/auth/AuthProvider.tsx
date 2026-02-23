"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import I18nProvider from "@/components/i18n/I18nProvider";
import type { AppLocale } from "@/lib/i18n/config";

export default function AuthProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
    </SessionProvider>
  );
}
