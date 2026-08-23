import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <h1 className="font-serif text-3xl font-bold text-neutral-900">Invitation introuvable</h1>
      <p className="mt-3 text-neutral-600">
        Ce lien n'existe pas ou l'invitation n'est pas encore publiee.
      </p>
      <Link href="/" className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
        Retour a l'accueil
      </Link>
    </div>
  );
}
