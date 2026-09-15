"use client";

import { PUBLIC_WEDDING_PREFIX } from "@/lib/routes";
import { useActionState, useState } from "react";
import Link from "next/link";
import { createWeddingForClientAction } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Template = { id: string; name: string; description: string | null };
type Client = { id: string; name: string | null; email: string; weddings: number };

const selectClass =
  "h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

function autoSlug(a: string, b: string) {
  return `${a}-${b}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-neutral-200 bg-white p-6">
      <legend className="px-2 font-serif text-lg font-semibold text-neutral-900">
        {legend}
      </legend>
      {hint && <p className="mb-5 text-sm text-neutral-500">{hint}</p>}
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

/** Ecran de fin : le mot de passe temporaire n'est affiche qu'ici. */
function Created({
  weddingId,
  newAccount,
  onAgain,
}: {
  weddingId: string;
  newAccount?: { email: string; tempPassword: string };
  onAgain: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const credentials = newAccount
    ? `Espace client : ${window.location.origin}/login\nEmail : ${newAccount.email}\nMot de passe provisoire : ${newAccount.tempPassword}`
    : "";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="font-serif text-xl font-bold text-neutral-900">
        Mariage cree
      </h2>

      {newAccount && (
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-900">
            Notez ces identifiants maintenant
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Le mot de passe provisoire ne sera plus affiche apres cette page.
            Transmettez-le au client, qui pourra le changer depuis son espace.
          </p>

          <dl className="mt-4 space-y-2 rounded-lg bg-white p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Email</dt>
              <dd className="font-mono text-neutral-900">{newAccount.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Mot de passe</dt>
              <dd className="select-all font-mono text-base font-semibold text-neutral-900">
                {newAccount.tempPassword}
              </dd>
            </div>
          </dl>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => {
              navigator.clipboard.writeText(credentials).then(
                () => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                },
                () => undefined
              );
            }}
          >
            {copied ? "Copie !" : "Copier les identifiants"}
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/mariage/${weddingId}`}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Completer le mariage
        </Link>
        <Link
          href="/admin/weddings"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Retour a la liste
        </Link>
        <button
          type="button"
          onClick={onAgain}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          En creer un autre
        </button>
      </div>
    </div>
  );
}

export function AdminWeddingCreateForm({
  clients,
  templates,
}: {
  clients: Client[];
  templates: Template[];
}) {
  const [state, formAction, pending] = useActionState(
    createWeddingForClientAction,
    {}
  );
  const [mode, setMode] = useState<"existing" | "new">(
    clients.length > 0 ? "existing" : "new"
  );
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [formKey, setFormKey] = useState(0);

  if (state?.success && state.weddingId) {
    return (
      <Created
        weddingId={state.weddingId}
        newAccount={state.newAccount}
        onAgain={() => {
          setP1("");
          setP2("");
          setSlug("");
          setSlugTouched(false);
          setFormKey((k) => k + 1);
          // Reinitialise l'etat de l'action en rechargeant la page.
          window.location.reload();
        }}
      />
    );
  }

  return (
    <form key={formKey} action={formAction} className="space-y-6">
      <Fieldset
        legend="Client"
        hint="Le mariage appartiendra a ce compte : le client le retrouvera dans son espace et pourra le modifier."
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("existing")}
            disabled={clients.length === 0}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
              mode === "existing"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Client existant
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "new"
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Nouveau client
          </button>
        </div>

        <input type="hidden" name="clientMode" value={mode} />

        {mode === "existing" ? (
          <div>
            <Label htmlFor="userId">Compte *</Label>
            <select id="userId" name="userId" required className={selectClass}>
              <option value="">Choisir un client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ? `${c.name} — ` : ""}
                  {c.email}
                  {c.weddings > 0 ? ` (${c.weddings} mariage${c.weddings > 1 ? "s" : ""})` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input id="clientName" name="clientName" required placeholder="Awa Ndiaye" />
              </div>
              <div>
                <Label htmlFor="clientPhone">Telephone</Label>
                <Input id="clientPhone" name="clientPhone" placeholder="+221 77 000 00 00" />
              </div>
            </div>
            <div>
              <Label htmlFor="clientEmail">Email *</Label>
              <Input
                id="clientEmail"
                name="clientEmail"
                type="email"
                required
                placeholder="client@exemple.sn"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Un mot de passe provisoire sera genere et affiche une seule fois
                apres la creation.
              </p>
            </div>
          </>
        )}
      </Fieldset>

      <Fieldset legend="Mariage">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="partnerOne">Marie 1 *</Label>
            <Input
              id="partnerOne"
              name="partnerOne"
              required
              value={p1}
              onChange={(e) => setP1(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="partnerTwo">Marie 2 *</Label>
            <Input
              id="partnerTwo"
              name="partnerTwo"
              required
              value={p2}
              onChange={(e) => setP2(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="slug">Lien public *</Label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-neutral-400">{PUBLIC_WEDDING_PREFIX}/</span>
            <Input
              id="slug"
              name="slug"
              required
              value={slugTouched ? slug : autoSlug(p1, p2)}
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
          <Label htmlFor="message">Message d&apos;invitation</Label>
          <Textarea id="message" name="message" rows={3} />
        </div>

        <div>
          <Label htmlFor="contactPhone">Telephone affiche sur l&apos;invitation</Label>
          <Input id="contactPhone" name="contactPhone" placeholder="+221 ..." />
        </div>
      </Fieldset>

      <Fieldset
        legend="Offre et design"
        hint="L'offre se regle ici tant que le paiement en ligne n'est pas branche."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="planTier">Offre *</Label>
            <select id="planTier" name="planTier" required className={selectClass}>
              <option value="ESSENTIEL">Essentiel</option>
              <option value="PREMIUM">Premium</option>
              <option value="PRESTIGE">Prestige</option>
            </select>
          </div>
          <div>
            <Label htmlFor="templateId">Design *</Label>
            <select id="templateId" name="templateId" required className={selectClass}>
              <option value="">Choisir un design...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Fieldset>

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Creation..." : "Creer le mariage"}
        </Button>
        <Link
          href="/admin/weddings"
          className="inline-flex items-center rounded-lg px-5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
