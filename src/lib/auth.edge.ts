import NextAuth from "next-auth";

// This is a minimal configuration for the Edge runtime.
// It does not include the Credentials provider or other Node.js-dependent modules.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [], // No providers are needed for the Edge middleware
});
