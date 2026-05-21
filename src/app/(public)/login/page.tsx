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
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center text-white">{t("auth.login.title")}</h3>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-white font-medium" htmlFor="email">{t("auth.login.email_label")}</label>
              <input
                type="email"
                placeholder={t("auth.login.placeholder_email")}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-700 text-white border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isSuccess}
              />
            </div>
            <div className="mt-4">
              <label className="block text-white font-medium" htmlFor="password">{t("auth.login.password_label")}</label>
              <input
                type="password"
                placeholder={t("auth.login.placeholder_password")}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-700 text-white border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isSuccess}
              />
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="flex items-center justify-center w-full px-6 py-2 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none disabled:bg-blue-800 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {isSuccess ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-green-400" />
                    {t("auth.login.button_success")}
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("auth.login.button_loading")}
                  </>
                ) : (
                  t("auth.login.button_submit")
                )}
              </button>
              <p className="text-sm text-center text-gray-400">
                {t("auth.login.need_account_admin")}
              </p>
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
