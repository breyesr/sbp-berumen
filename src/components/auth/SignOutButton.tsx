"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/I18nProvider";

export function SignOutButton() {
  const { t } = useI18n();

  return (
    <Button onClick={() => signOut()}>
      {t("common.actions.sign_out")}
    </Button>
  );
}
