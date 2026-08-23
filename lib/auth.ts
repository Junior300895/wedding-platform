import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Retourne la session ou null. */
export async function getSession() {
  return auth();
}

/** Retourne l'utilisateur courant ou null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Exige une session, sinon redirige vers /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Exige le role ADMIN, sinon redirige. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
