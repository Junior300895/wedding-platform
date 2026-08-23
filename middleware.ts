import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protege /dashboard et /admin ; ignore statics et /api
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
