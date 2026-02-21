"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function TwoFaVerificationPageContent() {
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
      setError("Email is missing. Please try logging in again.");
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
        setError("Invalid 2FA code. Please try again.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred during 2FA verification.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-white">2FA Verification</h3>
        <p className="text-center text-gray-400 mt-2">
          Please enter the 6-digit code from your authenticator app.
        </p>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-white" htmlFor="2fa-code">2FA Code</label>
              <input
                type="text"
                placeholder="XXXXXX"
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
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TwoFaVerificationPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <TwoFaVerificationPageContent />
      </Suspense>
    );
  }
