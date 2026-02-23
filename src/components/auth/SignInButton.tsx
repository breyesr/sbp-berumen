"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/I18nProvider";

export function SignInButton() {
  const { t } = useI18n();

  return (
    <Link href="/login">
      <Button>
        {t("common.actions.sign_in")}
      </Button>
    </Link>
  );
}
