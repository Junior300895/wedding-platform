import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tarifs" };

const plans = [
  {
    name: "Essentiel",
    tag: "Entree",
    highlight: false,
    features: ["Faire-part digital", "Date & lieu", "1 template", "Lien de partage"],
  },
  {
    name: "Premium",
    tag: "Le plus choisi",
    highlight: true,
    features: [
      "Tout l'Essentiel",
      "Galerie photo",
      "Compte a rebours",
      "Partage WhatsApp",
      "Carte & itineraire",
    ],
  },
  {
    name: "Prestige",
    tag: "Haut de gamme",
    highlight: false,
    features: [
      "Tout le Premium",
      "RSVP avance",
      "Design personnalise",
      "QR Code imprimable",
      "Programme detaille",
    ],
  },
];

export default function TarifsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-neutral-900">
          Des offres simples
        </h1>
        <p className="mt-4 text-neutral-600">
          Choisissez le niveau qui correspond a votre mariage.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl border p-8 ${
              p.highlight
                ? "border-brand-500 bg-white shadow-lg ring-1 ring-brand-500"
                : "border-neutral-200 bg-white"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">
                {p.tag}
              </span>
            )}
            <h3 className="font-serif text-2xl font-bold text-neutral-900">{p.name}</h3>
            {!p.highlight && (
              <p className="mt-1 text-sm text-neutral-500">{p.tag}</p>
            )}
            <ul className="mt-6 space-y-3 text-sm text-neutral-700">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`mt-8 block rounded-lg py-3 text-center text-sm font-medium ${
                p.highlight
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              Choisir {p.name}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-neutral-500">
        Options disponibles : domaine personnalise, template sur mesure, galerie
        etendue, version PDF imprimable, accompagnement.
      </p>
    </div>
  );
}
