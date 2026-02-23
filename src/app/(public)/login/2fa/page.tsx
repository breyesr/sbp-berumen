"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

function TwoFaVerificationPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(t("auth.twofa.error_unexpected"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        {t("auth.twofa.redirecting")}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-white">{t("auth.twofa.title")}</h3>
        <p className="text-center text-gray-400 mt-2">
          {t("auth.twofa.subtitle")}
        </p>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-white" htmlFor="2fa-code">{t("auth.twofa.code_label")}</label>
              <input
                type="text"
                placeholder={t("auth.twofa.code_placeholder")}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-700 text-white border-gray-600 text-center tracking-widest"
                id="2fa-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none"
                disabled={loading || code.length !== 6}
              >
                {loading ? t("auth.twofa.button_verifying") : t("auth.twofa.button_verify")}
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
