"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  moveEventAction,
} from "@/actions/event.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ManagedEvent = {
  id: string;
  type: string;
  title: string;
  venueName: string;
  address: string | null;
  mapUrl: string | null;
  notes: string | null;
  startsAt: Date | null;
};

type ActionState = { error?: string; success?: boolean };

const TYPE_LABELS: Record<string, string> = {
  CEREMONY: "Ceremonie",
  RECEPTION: "Reception",
  OTHER: "Autre",
};

/**
 * Formate une date pour <input type="datetime-local">, qui attend une heure
 * locale (toISOString decalerait la valeur en UTC).
 */
function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatWhen(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventForm({
  action,
  event,
  submitLabel,
  onDone,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  event?: ManagedEvent;
  submitLabel: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl bg-neutral-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={event?.type ?? "CEREMONY"}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="CEREMONY">Ceremonie</option>
            <option value="RECEPTION">Reception</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
        <div>
          <Label htmlFor="startsAt">Date et heure</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toLocalInput(event?.startsAt ?? null)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="title">Intitule</Label>
        <Input
          id="title"
          name="title"
          defaultValue={event?.title ?? ""}
          placeholder="Ceremonie religieuse"
          required
        />
      </div>

      <div>
        <Label htmlFor="venueName">Lieu</Label>
        <Input
          id="venueName"
          name="venueName"
          defaultValue={event?.venueName ?? ""}
          placeholder="Grande Mosquee de Dakar"
          required
        />
      </div>

      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          defaultValue={event?.address ?? ""}
          placeholder="Avenue Malick Sy, Dakar"
        />
      </div>

      <div>
        <Label htmlFor="mapUrl">Lien Google Maps</Label>
        <Input
          id="mapUrl"
          name="mapUrl"
          type="url"
          defaultValue={event?.mapUrl ?? ""}
          placeholder="https://maps.app.goo.gl/..."
        />
        <p className="mt-1 text-xs text-neutral-500">
          Optionnel : sans lien, l&apos;itineraire est deduit du lieu et de
          l&apos;adresse.
        </p>
      </div>

      <div>
        <Label htmlFor="notes">Precisions</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={event?.notes ?? ""}
          placeholder="Tenue traditionnelle souhaitee"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement..." : submitLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onDone}
          disabled={pending}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}

export function EventManager({
  weddingId,
  events,
}: {
  weddingId: string;
  events: ManagedEvent[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {events.length === 0 && !adding && (
        <p className="text-sm text-neutral-500">
          Aucun evenement. Ajoutez la ceremonie et la reception pour afficher le
          programme sur votre invitation.
        </p>
      )}

      <ul className="space-y-3">
        {events.map((ev, index) => (
          <li key={ev.id} className="rounded-xl border border-neutral-200 p-4">
            {editingId === ev.id ? (
              <EventForm
                action={updateEventAction.bind(null, ev.id)}
                event={ev}
                submitLabel="Enregistrer"
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-neutral-400">
                    {TYPE_LABELS[ev.type] ?? "Evenement"}
                  </p>
                  <p className="mt-0.5 font-medium text-neutral-900">{ev.title}</p>
                  <p className="text-sm text-neutral-600">{ev.venueName}</p>
                  {ev.address && (
                    <p className="text-sm text-neutral-500">{ev.address}</p>
                  )}
                  {ev.startsAt && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatWhen(ev.startsAt)}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Monter"
                    disabled={pending || index === 0}
                    onClick={() => startTransition(() => moveEventAction(ev.id, "up"))}
                    className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre"
                    disabled={pending || index === events.length - 1}
                    onClick={() => startTransition(() => moveEventAction(ev.id, "down"))}
                    className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    &darr;
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setAdding(false);
                      setEditingId(ev.id);
                    }}
                    className="rounded px-2 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => deleteEventAction(ev.id))}
                    className="rounded px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Suppr.
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <EventForm
          action={createEventAction.bind(null, weddingId)}
          submitLabel="Ajouter"
          onDone={() => setAdding(false)}
        />
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingId(null);
            setAdding(true);
          }}
        >
          Ajouter un evenement
        </Button>
      )}
    </div>
  );
}
