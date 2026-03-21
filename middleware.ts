import { auth } from "@/lib/auth.edge";
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from "@/lib/ratelimit";

const publicRoutes = ['/login', '/login/2fa'];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const session = await auth();
  const isLoggedIn = !!session;

  // 1. Rate Limiting for API routes
  if (nextUrl.pathname.startsWith('/api')) {
    // Exclude auth routes from standard rate limiting to avoid blocking login
    if (!nextUrl.pathname.startsWith('/api/auth')) {
      // Identifier: use user ID if logged in, otherwise fallback to IP address
      const identifier = session?.user?.id || req.ip || "anonymous";
      const { success, limit, remaining, reset } = await checkRateLimit(identifier, nextUrl.pathname);

      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    }
  }

  // 2. Authentication & Authorization Flow
  const isPublicRoute = publicRoutes.some(path => nextUrl.pathname.startsWith(path));

  // If the user is logged in and trying to access a public route, redirect to home
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // If the user is not logged in and trying to access a protected route (non-API), redirect to login
  if (!isLoggedIn && !isPublicRoute && !nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes including API, excluding static files and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
