# Faire-part Digital — Plateforme de faire-part de mariage

Application web full-stack permettant de créer des invitations de mariage
digitales, élégantes et partageables par lien. Générée à partir de la
documentation d'architecture Next.js Full Stack.

## Stack technique

| Couche          | Technologie                    |
| --------------- | ------------------------------ |
| Framework       | Next.js 15 (App Router)        |
| Langage         | TypeScript                     |
| UI              | Tailwind CSS                   |
| ORM             | Prisma                         |
| Base de données | PostgreSQL                     |
| Validation      | Zod                            |
| Auth            | Auth.js (NextAuth v5)          |
| Médias          | Abstraction (local / Cloudinary / S3) |
| QR Code         | qrcode                         |

## Fonctionnalités (MVP)

- **Comptes** : inscription, connexion, rôles CUSTOMER / ADMIN
- **Mariage** : créer, modifier, publier, archiver, supprimer
- **Templates** : 6 designs (Classic, Minimal, Luxury, Floral, Tradition, Oriental) — le design est séparé des données
- **Photos** : upload, photo de couverture, suppression
- **Page publique** : `/mariage/[slug]` avec hero, compte à rebours, programme, localisation, galerie, RSVP, partage
- **RSVP** : formulaire public sans compte (présence, nombre de personnes, message)
- **Partage** : WhatsApp, copie de lien, QR code
- **SEO** : metadata dynamiques + Open Graph pour l'aperçu WhatsApp/réseaux
- **Dashboard client** : gestion des mariages et suivi des RSVP
- **Admin** : statistiques, utilisateurs, mariages, activation des templates
- **API** : route handlers (`/api/templates`, `/api/rsvp`, `/api/public/weddings/[slug]`, `/api/upload`, `/api/webhooks/payment`)

## Démarrage rapide

### 1. Prérequis

- Node.js 18.18+ (idéalement 20+)
- Une base PostgreSQL (locale ou managée : Neon, Supabase, Railway…)

### 2. Installation

```bash
npm install
cp .env.example .env.local
```

Renseignez au minimum `DATABASE_URL` et `AUTH_SECRET` dans `.env.local` :

```bash
# Générer un secret
npx auth secret        # ou : openssl rand -base64 32
```

### 3. Base de données

```bash
npm run db:push        # crée les tables (dev)
npm run db:seed        # templates + comptes de démo + un mariage exemple
```

### 4. Lancer

```bash
npm run dev
```

Ouvrir http://localhost:3000

### Comptes de démonstration (après seed)

| Rôle   | Email             | Mot de passe |
| ------ | ----------------- | ------------ |
| Admin  | admin@wedding.sn  | admin1234    |
| Client | demo@wedding.sn   | demo1234     |

Exemple d'invitation publiée : http://localhost:3000/mariage/alioune-fatou

## Structure du projet

```
wedding-platform/
├── app/
│   ├── (marketing)/          # accueil, tarifs, contact
│   ├── (auth)/               # login, register
│   ├── dashboard/            # espace client (CRUD mariage, photos, RSVP)
│   ├── mariage/[slug]/       # page publique (rendu par template)
│   ├── admin/                # administration
│   └── api/                  # route handlers
├── actions/                  # Server Actions (wedding, event, guest, photo, auth, share, admin)
├── components/
│   ├── ui/                   # composants de base
│   ├── dashboard/            # composants espace client
│   ├── admin/                # composants admin
│   └── templates/            # système de templates + sections publiques
├── lib/
│   ├── db.ts                 # client Prisma
│   ├── auth.ts               # helpers d'autorisation
│   ├── storage.ts            # abstraction de stockage médias
│   ├── utils.ts              # utilitaires (slug, dates, prix)
│   └── validations/          # schémas Zod
├── prisma/
│   ├── schema.prisma         # modèle de données complet
│   └── seed.ts               # données initiales
├── auth.ts / auth.config.ts  # configuration NextAuth v5
├── middleware.ts             # protection des routes /dashboard et /admin
└── types/
```

## Modèle de données

`User`, `Wedding`, `WeddingEvent`, `WeddingPhoto`, `WeddingTemplate`,
`Guest`, `Order`, `Payment`, `ShareEvent` — voir `prisma/schema.prisma`.

## Stockage des médias

Par défaut `STORAGE_PROVIDER="local"` : les images sont écrites dans
`/public/uploads` (aucune configuration, idéal en développement).

Pour la **production**, implémentez un provider dans `lib/storage.ts`
(classe conforme à l'interface `StorageProvider`) et basculez
`STORAGE_PROVIDER` sur `cloudinary` ou `s3`. Ne jamais stocker les
binaires dans PostgreSQL ; prévoir compression, miniatures, CDN et quotas
par offre (cf. documentation, section 13).

## Paiement

Le webhook `/api/webhooks/payment` est un squelette conforme à la
section 17 de la documentation (Order → Payment → activation du mariage).
À compléter selon le prestataire retenu (Wave, Orange Money, Stripe…),
en vérifiant impérativement la signature du webhook.

## Déploiement (Vercel)

1. Pousser le dépôt sur GitHub.
2. Importer le projet sur Vercel.
3. Configurer les variables d'environnement (`DATABASE_URL`, `AUTH_SECRET`,
   `NEXT_PUBLIC_APP_URL`, stockage…).
4. Le build lance `prisma generate` automatiquement.
5. Appliquer les migrations Prisma sur la base de production
   (`prisma migrate deploy`).

## Scripts utiles

```bash
npm run dev          # développement
npm run build        # build de production
npm run db:push      # synchroniser le schéma (dev)
npm run db:migrate   # créer une migration
npm run db:seed      # peupler la base
npm run db:studio    # explorer la base (Prisma Studio)
```

## Sécurité (rappels)

- Validation Zod côté serveur sur chaque entrée.
- Contrôle d'accès (propriétaire / admin) dans chaque Server Action.
- Secrets uniquement côté serveur.
- Prévoir rate-limiting sur `/login` et le RSVP public en production.

---

Généré depuis *Documentation complète — Faire-part mariage Next.js Full Stack*.
