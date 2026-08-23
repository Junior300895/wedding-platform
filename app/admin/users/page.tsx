import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "Utilisateurs · Admin" };

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { weddings: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-neutral-900">Utilisateurs</h1>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Mariages</th>
              <th className="px-4 py-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-neutral-900">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={u.role === "ADMIN" ? "text-brand-700" : "text-neutral-600"}>
                    {u.role === "ADMIN" ? "Admin" : "Client"}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{u._count.weddings}</td>
                <td className="px-4 py-3 text-neutral-500">{formatDateFr(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
