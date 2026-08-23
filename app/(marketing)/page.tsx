import Link from "next/link";

const steps = [
  { n: "1", title: "Creez votre mariage", text: "Prenoms, date, lieux et message d'invitation en quelques minutes." },
  { n: "2", title: "Choisissez un design", text: "Des templates premium adaptes a chaque style de ceremonie." },
  { n: "3", title: "Ajoutez vos photos", text: "Une galerie elegante, optimisee pour le mobile." },
  { n: "4", title: "Partagez le lien", text: "Un seul lien a envoyer sur WhatsApp, avec QR code et RSVP." },
];

const features = [
  { title: "Page publique personnalisee", text: "Une URL unique /mariage/vos-prenoms accessible partout." },
  { title: "Compte a rebours", text: "Le decompte jusqu'au grand jour, en direct." },
  { title: "RSVP integre", text: "Vos invites confirment leur presence en un clic." },
  { title: "Partage WhatsApp", text: "Un message pret a envoyer avec apercu et image." },
  { title: "QR Code imprimable", text: "A glisser sur vos faire-part papier." },
  { title: "Localisation & itineraire", text: "Vos invites trouvent la salle sans se perdre." },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-600">
            Faire-part de mariage digital
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight text-neutral-900 md:text-6xl">
            Une invitation de mariage elegante, en ligne, partageable par un simple lien.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-600">
            Transformez quelques informations et photos en une invitation
            magnifique, prete a etre partagee sur WhatsApp.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-8 py-3.5 text-base font-medium text-white shadow-sm hover:bg-brand-700"
            >
              Creer mon invitation
            </Link>
            <Link
              href="/mariage/alioune-fatou"
              className="rounded-lg border border-neutral-300 px-8 py-3.5 text-base font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Voir un exemple
            </Link>
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section id="comment" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-serif text-3xl font-bold text-neutral-900">
          Comment ca marche
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-serif text-lg font-bold text-brand-700">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-serif text-3xl font-bold text-neutral-900">
            Tout ce qu'il faut pour un beau faire-part
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-neutral-900">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-bold text-neutral-900 md:text-4xl">
          Pret a annoncer votre mariage ?
        </h2>
        <p className="mt-4 text-neutral-600">
          Creez votre invitation aujourd'hui, partagez-la en une minute.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-lg bg-brand-600 px-8 py-3.5 text-base font-medium text-white hover:bg-brand-700"
        >
          Commencer gratuitement
        </Link>
      </section>
    </>
  );
}
