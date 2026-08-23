"use client";

import { useActionState } from "react";
import { updateWeddingAction } from "@/actions/wedding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Wedding = {
  id: string;
  slug: string;
  partnerOne: string;
  partnerTwo: string;
  weddingDate: Date;
  weddingTime: string | null;
  message: string | null;
  contactPhone: string | null;
  templateId: string | null;
};

export function WeddingEditForm({ wedding }: { wedding: Wedding }) {
  const action = updateWeddingAction.bind(null, wedding.id);
  const [state, formAction, pending] = useActionState(action, {});
  const dateValue = new Date(wedding.weddingDate).toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="templateId" value={wedding.templateId ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="partnerOne">Prenom marie 1</Label>
          <Input id="partnerOne" name="partnerOne" defaultValue={wedding.partnerOne} required />
        </div>
        <div>
          <Label htmlFor="partnerTwo">Prenom marie 2</Label>
          <Input id="partnerTwo" name="partnerTwo" defaultValue={wedding.partnerTwo} required />
        </div>
      </div>

      <div>
        <Label htmlFor="slug">URL publique</Label>
        <Input id="slug" name="slug" defaultValue={wedding.slug} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="weddingDate">Date</Label>
          <Input id="weddingDate" name="weddingDate" type="date" defaultValue={dateValue} required />
        </div>
        <div>
          <Label htmlFor="weddingTime">Heure</Label>
          <Input id="weddingTime" name="weddingTime" type="time" defaultValue={wedding.weddingTime ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message d'invitation</Label>
        <Textarea id="message" name="message" rows={3} defaultValue={wedding.message ?? ""} />
      </div>

      <div>
        <Label htmlFor="contactPhone">Telephone de contact</Label>
        <Input id="contactPhone" name="contactPhone" defaultValue={wedding.contactPhone ?? ""} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Enregistre !</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
