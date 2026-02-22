import { auth } from "@/lib/auth.edge";
import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/login/2fa'];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  console.log('Middleware visiting:', nextUrl.pathname);
  const session = await auth();
  const isLoggedIn = !!session;

  const isPublicRoute = publicRoutes.some(path => nextUrl.pathname.startsWith(path));

  // If the user is logged in and trying to access a public route, redirect to home
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // If the user is not logged in and trying to access a protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for API routes, static files, and images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
