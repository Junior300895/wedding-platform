import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-1 font-serif text-2xl font-bold text-neutral-900">Bon retour</h1>
      <p className="mb-6 text-sm text-neutral-500">Connectez-vous a votre espace.</p>
      <LoginForm />
    </>
  );
}
