"use client";

import { useTransition } from "react";
import { deleteGuestAction } from "@/actions/guest.actions";

type Guest = {
  id: string;
  name: string;
  phone: string | null;
  response: string;
  partySize: number;
  message: string | null;
  createdAt: Date;
};

const responseLabel: Record<string, string> = {
  YES: "Present",
  NO: "Absent",
  MAYBE: "Peut-etre",
};
const responseColor: Record<string, string> = {
  YES: "text-green-700 bg-green-100",
  NO: "text-red-700 bg-red-100",
  MAYBE: "text-amber-700 bg-amber-100",
};

export function GuestList({ guests }: { guests: Guest[] }) {
  const [pending, startTransition] = useTransition();

  if (guests.length === 0) {
    return <p className="text-sm text-neutral-500">Aucune confirmation pour l'instant.</p>;
  }

  const totalPresent = guests
    .filter((g) => g.response === "YES")
    .reduce((sum, g) => sum + g.partySize, 0);

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-600">
        <strong>{totalPresent}</strong> personne(s) attendue(s) · {guests.length} reponse(s)
      </p>
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Invite</th>
              <th className="px-4 py-2.5 font-medium">Reponse</th>
              <th className="px-4 py-2.5 font-medium">Pers.</th>
              <th className="px-4 py-2.5 font-medium">Message</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {guests.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-900">{g.name}</div>
                  {g.phone && <div className="text-xs text-neutral-400">{g.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${responseColor[g.response]}`}>
                    {responseLabel[g.response]}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">{g.partySize}</td>
                <td className="max-w-xs truncate px-4 py-3 text-neutral-500">{g.message ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={pending}
                    onClick={() => startTransition(() => deleteGuestAction(g.id))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Suppr.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
