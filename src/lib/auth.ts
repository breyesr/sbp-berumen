
import { verifyOtp } from "./totp";
import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "./clients";
import { normalizeLocale } from "./i18n/config";

class TwoFactorRequiredError extends CredentialsSignin {
  code = "2fa_required";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
      }

      if ((user || trigger === "update" || token.two_factor_enabled === undefined) && token.id) {
        let permissionsResult;
        try {
          permissionsResult = await db.query(
            `SELECT r.name as role, a.name as app, up."personaId", uca."clusterId", u.two_factor_enabled, u.locale
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur."userId"
             LEFT JOIN roles r ON ur."roleId" = r.id
             LEFT JOIN role_applications ra ON r.id = ra."roleId"
             LEFT JOIN applications a ON ra."applicationId" = a.id
             LEFT JOIN user_personas up ON u.id = up."userId"
             LEFT JOIN user_cluster_access uca ON u.id = uca."userId"
             WHERE u.id = $1`,
            [token.id]
          );
        } catch (dbError) {
          console.warn("User cluster access table might be missing, falling back to basic auth query.");
          permissionsResult = await db.query(
            `SELECT r.name as role, a.name as app, up."personaId", u.two_factor_enabled, u.locale
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur."userId"
             LEFT JOIN roles r ON ur."roleId" = r.id
             LEFT JOIN role_applications ra ON r.id = ra."roleId"
             LEFT JOIN applications a ON ra."applicationId" = a.id
             LEFT JOIN user_personas up ON u.id = up."userId"
             WHERE u.id = $1`,
            [token.id]
          );
        }

        token.roles = [...new Set(permissionsResult.rows.map(r => r.role).filter(Boolean))];
        token.apps = [...new Set(permissionsResult.rows.map(r => r.app).filter(Boolean))];
        token.personas = [...new Set(permissionsResult.rows.map(r => r.personaId).filter(Boolean))];
        token.clusters = [...new Set(permissionsResult.rows.map((r: any) => r.clusterId).filter(Boolean))];
        token.two_factor_enabled = Boolean(permissionsResult.rows[0]?.two_factor_enabled);
        token.locale = normalizeLocale(permissionsResult.rows[0]?.locale);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[] | undefined;
        session.user.apps = token.apps as string[] | undefined;
        session.user.personas = token.personas as number[] | undefined;
        session.user.clusters = token.clusters as string[] | undefined;
        session.user.two_factor_enabled = token.two_factor_enabled as boolean | undefined;
        session.user.locale = token.locale as "es-MX" | "en-US" | undefined;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password" },
        twoFaCode: { label: "2FA Code" },
        is2fa: { label: "Is 2FA" },
      },
      async authorize(credentials) {
        const { email, password, twoFaCode, is2fa } = credentials;

        if (typeof email !== 'string') throw new InvalidCredentialsError();
        
        const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userResult.rows[0];

        if (!user) throw new InvalidCredentialsError();

        if (is2fa) {
          if (!user.two_factor_secret || typeof twoFaCode !== 'string') throw new InvalidCredentialsError();
          const isValid = verifyOtp(twoFaCode, user.two_factor_secret);
          if (isValid) return { id: user.id, name: user.name, email: user.email };
          throw new InvalidCredentialsError();
        }

        if (typeof password !== 'string' || !user.password) throw new InvalidCredentialsError();
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          if (user.two_factor_enabled) {
            if (!user.two_factor_secret) {
              // Recover from inconsistent DB state so the user can re-enroll 2FA.
              await db.query(
                "UPDATE users SET two_factor_enabled = FALSE WHERE id = $1",
                [user.id]
              );
              return { id: user.id, name: user.name, email: user.email };
            }
            throw new TwoFactorRequiredError();
          }
          return { id: user.id, name: user.name, email: user.email };
        }

        throw new InvalidCredentialsError();
      },
    }),
  ],
});
