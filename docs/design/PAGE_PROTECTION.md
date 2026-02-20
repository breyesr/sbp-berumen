# Page Protection Architecture

This document outlines the standard architecture for protecting pages and API routes within this Next.js application. All new pages containing non-public content **must** adhere to this two-layer protection strategy.

## Two-Layer Protection Strategy

To ensure robust security and a smooth user experience, we use a combination of server-side middleware and client-side conditional rendering.

### 1. Server-Side Protection (Middleware)

*   **File:** `middleware.ts` (in the project root)
*   **Role:** Acts as the primary, server-side gatekeeper for all routes. It is the most critical security layer.
*   **Mechanism:**
    1.  The middleware is configured to run on all incoming requests by default (by not having a `matcher` config).
    2.  It checks if the user has a valid authentication session.
    3.  If the user is **not authenticated** and is attempting to access any route that is not explicitly public (e.g., `/login`, `/register`), the middleware immediately stops the request and sends a **redirect** to the `/login` page.
    4.  The protected page's code is **never** executed or rendered on the server for an unauthenticated user.

### 2. Client-Side Protection (React Component)

*   **File:** Any page component that renders protected content (e.g., `src/app/page.tsx`, `src/app/copywriter/page.tsx`).
*   **Role:** Provides a graceful user experience by handling the UI state while the authentication status is being determined in the browser.
*   **Mechanism:**
    1.  The page component **must** be a Client Component (`"use client";`).
    2.  It **must** use the `useSession()` hook from `next-auth/react`.
    3.  The component logic must check the `status` returned by `useSession()` and render content conditionally:
        *   If `status === 'loading'`, it should render a loading indicator (e.g., a spinner or a skeleton screen). This prevents a "flash" of protected content.
        *   If `status === 'unauthenticated'`, it should render a clear "Access Denied" or "Please Sign In" message. This handles cases where a session expires while the user is on the page.
        *   If `status === 'authenticated'`, it should render the main, protected content of the page.

---

### Standard Implementation Example for a New Page

All new protected pages must follow this structure.

```tsx
// src/app/new-protected-page/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth/SignInButton";

// Main component for the page's content
function MyProtectedContent() {
  // ... (all the state, effects, and JSX for your feature go here)
  return (
    <div>
      <h1>My Protected Feature</h1>
      {/* ... */}
    </div>
  );
}

// The default export that wraps the content with the auth check
export default function NewProtectedPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-8">Please sign in to access this page.</p>
        <SignInButton />
      </div>
    );
  }

  return <MyProtectedContent />;
}
```