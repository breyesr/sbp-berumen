"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

function TwoFaVerificationPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSuccess) return;
    
    setError(null);
    setLoading(true);

    if (!email) {
      setError(t("auth.twofa.error_missing_email"));
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        twoFaCode: code,
        is2fa: "true", // Pass as string
        redirect: false,
      });

      if (result?.error) {
        setError(t("auth.twofa.error_invalid_code"));
        setLoading(false);
      } else {
        setIsSuccess(true);
        router.push("/");
      }
    } catch (err) {
      setError(t("auth.twofa.error_unexpected"));
      console.error(err);
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground font-body">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest font-brand">{t("auth.twofa.redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background font-body">
      <div className="px-10 py-12 text-left bg-surface border border-border shadow-2xl rounded-[2.5rem] w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-8">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 3L35 11.66V28.34L20 37L5 28.34V11.66L20 3Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
                    <path d="M20 10L28 14.5V25.5L20 30L12 25.5V14.5L20 10Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
                    <circle cx="20" cy="20" r="3.5" fill="currentColor" className="text-primary"></circle>
                </svg>
                <div className="text-2xl font-bold tracking-tight text-foreground font-brand">IntelAgent</div>
            </div>
            <h3 className="text-lg font-bold text-center text-foreground font-brand uppercase tracking-tight">{t("auth.twofa.title")}</h3>
            <p className="text-[10px] text-foreground-subtle font-bold uppercase tracking-[0.2em] mt-2 font-brand text-center max-w-xs">
                {t("auth.twofa.subtitle")}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold font-brand uppercase tracking-widest text-center shadow-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle px-1 font-brand" htmlFor="2fa-code">{t("auth.twofa.code_label")}</label>
              <input
                type="text"
                placeholder={t("auth.twofa.code_placeholder")}
                className="w-full px-5 py-6 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background text-foreground text-center tracking-[0.5em] text-3xl font-bold disabled:opacity-50 transition-all shadow-inner"
                id="2fa-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                disabled={loading || isSuccess}
                autoFocus
              />
            </div>
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className={clsx(
                    "flex items-center justify-center w-full px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95 shadow-lg font-brand",
                    isSuccess 
                        ? "bg-success text-white" 
                        : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary/20"
                )}
                disabled={loading || isSuccess || code.length !== 6}
              >
                {isSuccess ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    {t("auth.login.button_success")}
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    {t("auth.twofa.button_verifying")}
                  </>
                ) : (
                  t("auth.twofa.button_verify")
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TwoFaVerificationPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div>{t("auth.twofa.loading")}</div>}>
      <TwoFaVerificationPageContent />
    </Suspense>
  );
}
