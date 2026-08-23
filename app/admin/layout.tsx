import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const nav = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/users", label: "Utilisateurs" },
    { href: "/admin/weddings", label: "Mariages" },
    { href: "/admin/templates", label: "Templates" },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-neutral-900 p-4 text-neutral-100 md:flex">
        <div className="mb-8 px-3 font-serif text-xl font-bold">
          Admin<span className="text-brand-400">.</span>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-sm text-brand-400 hover:bg-neutral-800"
          >
            ← Espace client
          </Link>
        </nav>
        <div className="border-t border-neutral-800 pt-3">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
