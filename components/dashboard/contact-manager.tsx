"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createContactAction,
  updateContactAction,
  deleteContactAction,
} from "@/actions/contact.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ManagedContact = {
  id: string;
  name: string;
  phone: string;
  role: string | null;
};

type ActionState = { error?: string; success?: boolean };

function ContactForm({
  action,
  contact,
  submitLabel,
  onDone,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  contact?: ManagedContact;
  submitLabel: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const prefix = contact?.id ?? "new";

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl bg-neutral-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${prefix}-name`}>Nom</Label>
          <Input
            id={`${prefix}-name`}
            name="name"
            defaultValue={contact?.name ?? ""}
            placeholder="Awa Diop"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-phone`}>Telephone</Label>
          <Input
            id={`${prefix}-phone`}
            name="phone"
            type="tel"
            defaultValue={contact?.phone ?? ""}
            placeholder="77 123 45 67"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${prefix}-role`}>Role (facultatif)</Label>
        <Input
          id={`${prefix}-role`}
          name="role"
          defaultValue={contact?.role ?? ""}
          placeholder="Temoin, organisatrice..."
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement..." : submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone} disabled={pending}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

/**
 * Personnes a contacter pour les renseignements sur le lieu ou le mariage.
 * Affichees en bas de l'invitation, chacune avec ses boutons Appeler et WhatsApp.
 */
export function ContactManager({
  weddingId,
  contacts,
}: {
  weddingId: string;
  contacts: ManagedContact[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {contacts.length === 0 && !adding && (
        <p className="text-sm text-neutral-500">
          Aucun contact. Sans contact, l&apos;invitation affiche le telephone de contact
          des informations generales.
        </p>
      )}

      <ul className="space-y-3">
        {contacts.map((c) => (
          <li key={c.id} className="rounded-xl border border-neutral-200 p-4">
            {editingId === c.id ? (
              <ContactForm
                action={updateContactAction.bind(null, c.id)}
                contact={c}
                submitLabel="Enregistrer"
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{c.name}</p>
                  {c.role && <p className="text-sm text-neutral-500">{c.role}</p>}
                  <p className="text-sm text-neutral-600">{c.phone}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setAdding(false);
                      setEditingId(c.id);
                    }}
                    className="rounded px-2 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => deleteContactAction(c.id))}
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
        <ContactForm
          action={createContactAction.bind(null, weddingId)}
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
          Ajouter un contact
        </Button>
      )}
    </div>
  );
}
