import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-serif text-xl font-bold text-neutral-900">
            Faire-part<span className="text-brand-600">.</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
            <Link href="/#comment" className="hover:text-neutral-900">Comment ca marche</Link>
            <Link href="/tarifs" className="hover:text-neutral-900">Tarifs</Link>
            <Link href="/contact" className="hover:text-neutral-900">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Creer une invitation
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-neutral-500 md:flex-row">
          <p>© {new Date().getFullYear()} Faire-part Digital. Made in Dakar.</p>
          <div className="flex gap-6">
            <Link href="/tarifs" className="hover:text-neutral-800">Tarifs</Link>
            <Link href="/contact" className="hover:text-neutral-800">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
