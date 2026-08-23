import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const nav = [
    { href: "/dashboard", label: "Mes mariages" },
    { href: "/dashboard/mariage/nouveau", label: "Nouveau mariage" },
    { href: "/dashboard/settings", label: "Parametres" },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-white p-4 md:flex">
        <Link href="/" className="mb-8 px-3 font-serif text-xl font-bold text-neutral-900">
          Faire-part<span className="text-brand-600">.</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {n.label}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Administration
            </Link>
          )}
        </nav>
        <div className="border-t border-neutral-100 pt-3">
          <p className="truncate px-3 text-xs text-neutral-400">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <Link href="/dashboard" className="font-serif text-lg font-bold">
            Faire-part<span className="text-brand-600">.</span>
          </Link>
          <SignOutButton />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
