import { DEFAULT_LOCALE, normalizeLocale, type AppLocale } from "./config";

function parseAcceptLanguage(headerValue: string | null | undefined): string[] {
  if (!headerValue) return [];

  return headerValue
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .filter(Boolean);
}

export function resolveRequestLocale({
  userLocale,
  cookieLocale,
  acceptLanguage,
}: {
  userLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): AppLocale {
  const fromUser = normalizeLocale(userLocale);
  if (fromUser) return fromUser;

  const fromCookie = normalizeLocale(cookieLocale);
  if (fromCookie) return fromCookie;

  const browserCandidates = parseAcceptLanguage(acceptLanguage);
  for (const candidate of browserCandidates) {
    const normalized = normalizeLocale(candidate);
    if (normalized) return normalized;
  }

  return DEFAULT_LOCALE;
}

