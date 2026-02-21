# Page Protection Architecture

This document outlines the standard architecture for protecting pages and API routes in this Next.js application.

## Two-Layer Protection Strategy

### 1. Server-Side Protection (Middleware)

- **File:** `middleware.ts`
- **Role:** Primary gatekeeper for route access.
- **Behavior:**
  1. Routes under `/login`, `/register`, and `/login/2fa` are public.
  2. Any other non-API route is protected.
  3. Unauthenticated users are redirected to `/login`.
  4. Authenticated users visiting public auth routes are redirected to `/`.

### 2. Client-Side Protection (App Route Group Layout)

- **Files:**
  - `src/app/(app)/layout.tsx`
  - `src/components/layout/AuthGate.tsx`
- **Role:** Centralized UI-level auth handling for protected pages.
- **Behavior:**
  1. `AuthGate` uses `useSession()` once at layout level.
  2. `status === "loading"` renders a shared loading state.
  3. `status === "unauthenticated"` renders a shared access-denied state.
  4. `status === "authenticated"` renders the persistent app shell.

## Route Group Structure

- **Protected app routes** (persistent shell):
  - `src/app/(app)/page.tsx` (`/`)
  - `src/app/(app)/copywriter/page.tsx` (`/copywriter`)
  - `src/app/(app)/profile/page.tsx` (`/profile`)
- **Public routes** (no app shell):
  - `src/app/(public)/login/page.tsx` (`/login`)
  - `src/app/(public)/register/page.tsx` (`/register`)
  - `src/app/(public)/login/2fa/page.tsx` (`/login/2fa`)

## Global App Shell Composition

- **File:** `src/components/layout/AppLayout.tsx`
- **Includes by default:**
  - `AppHeader`
  - `AppNavigation`
  - `AppFooter`
  - `AppScripts`
  - `<main>{children}</main>` slot for page content

This ensures shell state persists between protected page navigations using Next.js App Router layout persistence.
