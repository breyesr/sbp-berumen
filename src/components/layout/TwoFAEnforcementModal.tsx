"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function TwoFAEnforcementModal() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const isOnProfile = pathname?.startsWith("/profile");
  const shouldShow =
    status === "authenticated" && !session?.user?.two_factor_enabled && !isOnProfile;

  useEffect(() => {
    if (!shouldShow) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="twofa-required-title"
        className="w-full max-w-md rounded-xl border border-white/15 bg-[#111214] p-6 text-[#ededed] shadow-2xl"
      >
        <h2 id="twofa-required-title" className="text-xl font-semibold">
          {t("modal.twofa_required.title")}
        </h2>
        <p className="mt-3 text-sm text-[#c4c4cc]">
          {t("modal.twofa_required.body_1")}
        </p>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          {t("modal.twofa_required.body_2")}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => router.push("/profile")}>{t("modal.twofa_required.cta_setup")}</Button>
          <Button
            type="button"
            className="bg-[#1f2937] hover:bg-[#374151]"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            {t("modal.twofa_required.cta_sign_out")}
          </Button>
        </div>
      </div>
    </div>
  );
}
