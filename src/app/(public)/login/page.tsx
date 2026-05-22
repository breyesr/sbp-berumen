"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Loader2 } from "lucide-react";

function LoginPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setError(errorParam ? t("auth.login.error_invalid_credentials") : null);
  }, [errorParam, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const isTwoFactorRequired =
          result.error === "CredentialsSignin" && result.code === "2fa_required";

        if (isTwoFactorRequired) {
          setIsSuccess(true);
          router.push(`/login/2fa?email=${encodeURIComponent(email)}`);
        } else {
          setError(t("auth.login.error_try_again"));
          console.error("Login error details:", result.error, result.code);
          setIsLoading(false);
        }
      } else {
        setIsSuccess(true);
        const session = await getSession();
        const needs2FASetup = !session?.user?.two_factor_enabled;
        router.push(needs2FASetup ? "/profile" : "/");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError(t("auth.login.error_try_again"));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background font-body">
      <div className="px-10 py-12 text-left bg-surface border border-border shadow-2xl rounded-[2.5rem] w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 3L35 11.66V28.34L20 37L5 28.34V11.66L20 3Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
                    <path d="M20 10L28 14.5V25.5L20 30L12 25.5V14.5L20 10Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
                    <circle cx="20" cy="20" r="3.5" fill="currentColor" className="text-primary"></circle>
                </svg>
            </div>
            <h3 className="text-3xl font-bold text-center text-foreground font-brand uppercase tracking-tighter">{t("auth.login.title")}</h3>
            <p className="text-[10px] text-foreground-subtle font-bold uppercase tracking-[0.3em] mt-2 font-brand">Intelligence Factory Terminal</p>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold font-brand uppercase tracking-widest text-center shadow-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle px-1 font-brand" htmlFor="email">{t("auth.login.email_label")}</label>
              <input
                type="email"
                placeholder={t("auth.login.placeholder_email")}
                className="w-full px-5 py-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background text-foreground placeholder:text-foreground-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isSuccess}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle px-1 font-brand" htmlFor="password">{t("auth.login.password_label")}</label>
              <input
                type="password"
                placeholder={t("auth.login.placeholder_password")}
                className="w-full px-5 py-4 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background text-foreground placeholder:text-foreground-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isSuccess}
              />
            </div>
            <div className="flex flex-col space-y-6 pt-4">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={clsx(
                    "flex items-center justify-center w-full px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95 shadow-lg font-brand",
                    isSuccess 
                        ? "bg-success text-white" 
                        : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary/20"
                )}
              >
                {isSuccess ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    {t("auth.login.button_success")}
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    {t("auth.login.button_loading")}
                  </>
                ) : (
                  t("auth.login.button_submit")
                )}
              </button>
              
              <div className="pt-6 border-t border-border">
                <p className="text-[10px] font-bold text-center text-foreground-subtle uppercase tracking-widest font-brand">
                    {t("auth.login.need_account_admin")}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div>{t("auth.login.loading")}</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
