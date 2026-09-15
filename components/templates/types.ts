export type PublicPhoto = { id: string; url: string; isCover: boolean };

export type PublicEvent = {
  id: string;
  type: string;
  title: string;
  venueName: string;
  address: string | null;
  mapUrl: string | null;
  startsAt: Date | null;
};

export type PublicWedding = {
  id: string;
  slug: string;
  partnerOne: string;
  partnerTwo: string;
  weddingDate: Date;
  weddingTime: string | null;
  message: string | null;
  contactPhone: string | null;
  coverImageUrl: string | null;
  events: PublicEvent[];
  photos: PublicPhoto[];
  templateKey: string;
};

/**
 * Configuration visuelle d'un theme (le design est separe des donnees).
 *
 * Chaque theme declare explicitement ses surfaces et ses filets. La mise en
 * page ne suppose jamais un fond clair : c'est ce qui permet aux themes
 * sombres (luxury) d'avoir le meme contraste que les themes clairs.
 */
export type Theme = {
  key: string;
  name: string;
  /** Fond de page. */
  bg: string;
  /** Texte courant. */
  text: string;
  /** Fond des blocs poses sur la page (cartes, rail, formulaire). */
  surface: string;
  /** Filets et bordures, accordes au fond. */
  line: string;
  /** Couleur d'accent (heures, liens, ornement). */
  accent: string;
  /** Accent attenue : eyebrows, legendes, mentions. */
  accentSoft: string;
  /** Pastille pleine du rail horaire. */
  accentDot: string;
  /** Champs de formulaire : fond, texte, et jeu de couleurs natif. */
  field: string;
  /**
   * Filet des champs, separe de `field` : un champ en erreur remplace cette
   * classe au lieu d'entrer en conflit avec elle. Evite d'avoir a embarquer
   * tailwind-merge dans le bundle des invites.
   */
  fieldBorder: string;
  /** Texte et filet d'erreur, accordes au fond du theme. */
  fieldError: string;
  heroFont: string; // font-serif | font-sans
  heroBgClass: string; // degrade / couleur du hero
  /**
   * Voile leger sur toute la photo : harmonise la teinte et fait fondre le
   * bas du hero dans la page. Volontairement discret.
   */
  heroScrim: string;
  /**
   * Halo local, centre sur le titre, dans la couleur de fond du theme.
   * C'est lui qui garantit le contraste : le resultat ne depend plus de la
   * photo envoyee par les maries, seulement de cette couche.
   */
  heroTextScrim: string;
  divider: string; // ornement de cloture, utilise une seule fois
  /**
   * Teintes des confettis, en hexadecimal : elles sont posees en style
   * inline (une couleur tiree au sort par particule), donc des classes
   * Tailwind ne conviendraient pas ici.
   */
  confetti: string[];
};
