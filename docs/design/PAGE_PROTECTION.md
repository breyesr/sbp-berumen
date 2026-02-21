# Page Protection Architecture

This document describes the current layered access strategy for authentication and mandatory 2FA.

## Three-Layer Protection Strategy

### 1. Server-side route protection (middleware)

- **File:** `middleware.ts`
- **Role:** Base gatekeeper for page-level auth.
- **Behavior:**
  1. Public routes: `/login`, `/register`, `/login/2fa`
  2. Other non-API routes are protected
  3. Unauthenticated users are redirected to `/login`
  4. Authenticated users trying to access public auth routes are redirected to `/`

### 2. Client-side auth gate in protected layout

- **Files:**
  - `src/app/(app)/layout.tsx`
  - `src/components/layout/AuthGate.tsx`
- **Role:** Standardized UX for session loading / unauthenticated states.
- **Behavior:**
  1. `status === "loading"` shows loading view
  2. `status === "unauthenticated"` shows access-denied prompt
  3. `status === "authenticated"` renders app shell

### 3. Forced 2FA enforcement on protected pages

- **Files:**
  - `src/app/(public)/login/page.tsx`
  - `src/components/layout/TwoFAEnforcementModal.tsx`
  - `src/components/layout/AppLayout.tsx`
- **Behavior:**
  1. After successful credentials login, users without `two_factor_enabled` are redirected to `/profile`
  2. On protected pages other than `/profile`, users without 2FA see a blocking modal
  3. Modal CTA takes user to `/profile` to complete setup
  4. Optional escape path is Sign Out

## Route Group Structure

- **Protected routes (`src/app/(app)`)**
  - `/` (`src/app/(app)/page.tsx`)
  - `/copywriter` (`src/app/(app)/copywriter/page.tsx`)
  - `/profile` (`src/app/(app)/profile/page.tsx`)
- **Public routes (`src/app/(public)`)**
  - `/login`
  - `/register`
  - `/login/2fa`

## Global app shell composition

- **File:** `src/components/layout/AppLayout.tsx`
- **Includes:**
  - `AppHeader`
  - `AppNavigation`
  - `AppFooter`
  - `AppScripts`
  - `TwoFAEnforcementModal`
  - `<main>{children}</main>`

This setup preserves persistent layout behavior while enforcing authentication and 2FA requirements consistently.
