import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="font-serif text-4xl font-bold text-neutral-900">Contact</h1>
      <p className="mt-4 text-neutral-600">
        Une question sur nos offres ou un besoin sur mesure ? Ecrivez-nous.
      </p>

      <div className="mt-10 space-y-4 rounded-2xl border border-neutral-200 bg-white p-8">
        <div>
          <p className="text-sm font-medium text-neutral-500">Email</p>
          <p className="text-neutral-900">contact@faire-part.sn</p>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">WhatsApp</p>
          <p className="text-neutral-900">+221 77 000 00 00</p>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">Localisation</p>
          <p className="text-neutral-900">Dakar, Senegal</p>
        </div>
      </div>
    </div>
  );
}
