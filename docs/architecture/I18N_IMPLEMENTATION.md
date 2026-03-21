# I18N Architecture

This document describes frontend localization for `es-MX` and `en-US`.

## Locales

- Default locale: `es-MX`
- Secondary locale: `en-US`
- Cookie name: `sbp_locale`

## Locale resolution order

- Logged in:
  1. `users.locale` from DB/session
  2. `sbp_locale` cookie
  3. Browser `Accept-Language`
  4. `es-MX`
- Logged out:
  1. `sbp_locale` cookie
  2. Browser `Accept-Language`
  3. `es-MX`

Server resolution happens in `src/lib/i18n/server.ts` and is applied in `src/app/layout.tsx`.

## Runtime model

- Dictionaries live in `src/lib/i18n/messages.ts`.
- Translation helper lives in `src/lib/i18n/translator.ts`.
- Client context/provider lives in `src/components/i18n/I18nProvider.tsx`.
- UI switcher is `src/components/i18n/LanguageSwitch.tsx`.

When language changes:

1. UI updates immediately in memory.
2. Cookie is updated.
3. If authenticated, `PATCH /api/account/locale` persists to DB.
4. Session locale is refreshed client-side.

## Data model

- `users.locale` stores user preference (`es-MX`, `en-US`, or `NULL`).
- Existing DBs can be upgraded with:

```bash
npm run db:locale:migrate
```

## Implementation rules

- Use stable translation keys, not raw user-facing strings.
- Keep API payload text unchanged server-side; localize display copy in frontend.
- Use `Intl.DateTimeFormat`/`Intl.NumberFormat` through i18n helpers for locale-aware formatting.

## How to add new localized copy

1. Add key/value to both locale dictionaries in `src/lib/i18n/messages.ts`.
2. Use `t("your.key")` in component/page code.
3. For dynamic text, use interpolation tokens like `{{email}}`.
4. Manually test in both locales with the `ES | EN` switch.
