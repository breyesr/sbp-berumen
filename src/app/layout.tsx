import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import AuthProvider from "@/components/auth/AuthProvider";
import { auth } from "@/lib/auth";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { resolveRequestLocale } from "@/lib/i18n/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://staging-sbp.vercel.app"),
  title: "IntelAgent | Idea Stress Test",
  description: "Validate before you execute. AI-powered strategic analysis powered by Berumen's Methodology.",
  openGraph: {
    title: "IntelAgent | Idea Stress Test",
    description: "Validate your business ideas with AI-powered strategic analysis.",
    url: "https://staging-sbp.vercel.app",
    siteName: "IntelAgent",
    images: [
      {
        url: "/logo-preview.svg",
        secureUrl: "https://staging-sbp.vercel.app/logo-preview.svg",
        width: 1200,
        height: 630,
        type: "image/svg+xml",
        alt: "IntelAgent Logo",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntelAgent | Idea Stress Test",
    description: "Validate before you execute. AI-powered strategic analysis.",
    images: ["/icon.svg"],
  },
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
    <html lang={(initialLocale ?? DEFAULT_LOCALE).toLowerCase()} suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="brand"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider initialLocale={initialLocale}>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
