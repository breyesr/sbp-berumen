import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import AuthProvider from "@/components/auth/AuthProvider";
import { auth } from "@/lib/auth";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { resolveRequestLocale } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Idea Stress Test",
  description: "Validate before you execute. AI-powered strategic analysis.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const cookieStore = await cookies();
  const headersStore = await headers();
  const initialLocale = resolveRequestLocale({
    userLocale: session?.user?.locale,
    cookieLocale: cookieStore.get("sbp_locale")?.value,
    acceptLanguage: headersStore.get("accept-language"),
  });

  return (
    <html lang={(initialLocale ?? DEFAULT_LOCALE).toLowerCase()}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider initialLocale={initialLocale}>{children}</AuthProvider>
      </body>
    </html>
  );
}
