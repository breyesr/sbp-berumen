import { auth } from "@/lib/auth.edge";

export const config = {
  // Match all routes except for API routes, static files, and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  if (!req.auth) {
    const url = req.nextUrl.clone();
    // Redirect to /login if the user is not authenticated
    // and is trying to access a protected route.
    if (url.pathname !== "/login" && url.pathname !== "/register") {
      url.pathname = "/login";
      return Response.redirect(url);
    }
  }
});
