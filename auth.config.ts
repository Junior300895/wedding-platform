import type { NextAuthConfig } from "next-auth";

/**
 * Config de base compatible Edge (middleware).
 * Le provider Credentials (qui utilise bcrypt + Prisma) est ajoute
 * dans auth.ts, hors runtime Edge.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      const isDashboard = path.startsWith("/dashboard");
      const isAdmin = path.startsWith("/admin");

      if (isAdmin) return isLoggedIn && role === "ADMIN";
      if (isDashboard) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // renseigne dans auth.ts
} satisfies NextAuthConfig;
