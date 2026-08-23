import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 font-serif text-2xl font-bold text-neutral-900">Creer un compte</h1>
      <p className="mb-6 text-sm text-neutral-500">Commencez votre invitation en quelques minutes.</p>
      <RegisterForm />
    </>
  );
}
