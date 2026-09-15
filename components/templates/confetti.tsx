/**
 * Pluie de confettis sur l'invitation publique.
 *
 * Composant serveur : les valeurs aleatoires sont figees au rendu et
 * n'entrainent aucun JavaScript cote client. La page etant en ISR
 * (revalidate = 60), la disposition change au rafraichissement du cache.
 *
 * Chaque particule demarre avec un delai negatif : au premier affichage
 * elles sont deja en vol, jamais un ecran vide qui se remplirait.
 */
export function Confetti({
  colors,
  count = 50,
}: {
  colors: string[];
  count?: number;
}) {
  if (colors.length === 0) return null;

  const pieces = Array.from({ length: count }, (_, i) => {
    const size = 5 + Math.random() * 10; // 5 a 15 px
    const duration = 9 + Math.random() * 7; // 9 a 16 s
    return {
      key: i,
      left: Math.random() * 100,
      size,
      duration,
      delay: -Math.random() * duration,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
