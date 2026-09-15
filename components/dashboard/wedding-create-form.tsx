"use client";

import { PUBLIC_WEDDING_PREFIX } from "@/lib/routes";
import { useActionState, useState } from "react";
import { createWeddingAction } from "@/actions/wedding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Template = { id: string; name: string; description: string | null };

function autoSlug(a: string, b: string) {
  return `${a}-${b}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function WeddingCreateForm({ templates }: { templates: Template[] }) {
  const [state, formAction, pending] = useActionState(createWeddingAction, {});
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const computedSlug = slugTouched ? slug : autoSlug(p1, p2);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="partnerOne">Prenom marie 1 *</Label>
          <Input id="partnerOne" name="partnerOne" required value={p1} onChange={(e) => setP1(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="partnerTwo">Prenom marie 2 *</Label>
          <Input id="partnerTwo" name="partnerTwo" required value={p2} onChange={(e) => setP2(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="slug">URL publique *</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">{PUBLIC_WEDDING_PREFIX}/</span>
          <Input
            id="slug"
            name="slug"
            required
            value={computedSlug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="weddingDate">Date *</Label>
          <Input id="weddingDate" name="weddingDate" type="date" required />
        </div>
        <div>
          <Label htmlFor="weddingTime">Heure</Label>
          <Input id="weddingTime" name="weddingTime" type="time" />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message d'invitation</Label>
        <Textarea id="message" name="message" rows={3} placeholder="Nous vous invitons a partager..." />
      </div>

      <div>
        <Label htmlFor="contactPhone">Telephone de contact</Label>
        <Input id="contactPhone" name="contactPhone" placeholder="+221 ..." />
      </div>

      <div>
        <Label htmlFor="templateId">Template *</Label>
        <select
          id="templateId"
          name="templateId"
          required
          className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm"
        >
          <option value="">Choisir un design...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.description}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creation..." : "Creer le mariage"}
      </Button>
    </form>
  );
}
