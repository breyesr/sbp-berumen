"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth/SignInButton";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Loader2 } from "lucide-react";

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const { t } = useI18n();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-body">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest font-brand">{t("auth_gate.loading")}</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4 font-body animate-fade-in">
        <div className="bg-surface border border-border p-10 md:p-16 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-lg w-full text-center">
            <div className="flex items-center gap-3 mb-10">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 3L35 11.66V28.34L20 37L5 28.34V11.66L20 3Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
                    <path d="M20 10L28 14.5V25.5L20 30L12 25.5V14.5L20 10Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
                    <circle cx="20" cy="20" r="3.5" fill="currentColor" className="text-primary"></circle>
                </svg>
                <div className="text-3xl font-bold tracking-tighter text-foreground font-brand">IntelAgent</div>
            </div>
            
            <h1 className="mb-4 text-2xl font-bold font-brand uppercase tracking-tight">{t("auth_gate.access_denied_title")}</h1>
            <p className="mb-10 text-foreground-muted font-medium italic font-body">{t("auth_gate.access_denied_message")}</p>
            
            <div className="w-full">
                <SignInButton />
            </div>
        </div>
        
        <p className="mt-8 text-[10px] text-foreground-subtle font-bold uppercase tracking-[0.4em] font-brand">
            Intelligence Factory • Internal Access Only
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
