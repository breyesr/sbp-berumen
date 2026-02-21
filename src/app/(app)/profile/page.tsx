"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [setup2FA, setSetup2FA] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    // Cast to any to access custom properties
    const s = session as any;
    if (s?.user?.two_factor_enabled) {
      setIs2FAEnabled(true);
    }
  }, [session]);

  const handleGenerate2FA = async () => {
    const response = await fetch('/api/2fa/generate', { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      setSetup2FA(data);
    } else {
      setError(data.error || "Failed to start 2FA setup.");
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: verificationCode }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("2FA enabled successfully!");
      setSetup2FA(null);
      await update(); // Re-fetch session to get updated 2FA status
    } else {
      setError(data.error || "Failed to verify 2FA code.");
    }
  };

  if (!session?.user) {
    return <p className="text-sm text-[#a1a1aa]">Loading profile...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h1>User Profile</h1>
      <p><strong>Email:</strong> {session?.user?.email}</p>
      <p><strong>2FA Status:</strong> {is2FAEnabled ? 'Enabled' : 'Disabled'}</p>

      {!is2FAEnabled && !setup2FA && (
        <button onClick={handleGenerate2FA} style={{ marginTop: '20px' }}>
          Enable 2FA
        </button>
      )}

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

      {setup2FA && (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px' }}>
          <h2>Set up Two-Factor Authentication</h2>
          <p>Scan the QR code with your authenticator app.</p>
          <img src={setup2FA.qrCodeDataUrl} alt="2FA QR Code" />
          <p>Or manually enter this secret: {setup2FA.secret}</p>
          
          <form onSubmit={handleVerify2FA} style={{ marginTop: '20px' }}>
            <label htmlFor="verificationCode">Verification Code:</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              minLength={6}
              maxLength={6}
            />
            <button type="submit">Verify & Activate</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <SignOutButton />
      </div>
    </div>
  );
}
