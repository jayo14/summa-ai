/* Aetheris Glassmorphism reminder: keep the brand quiet, soft, and orb-led so the pastel glass shell remains the visual hero. */

type SummaLogoProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function SummaLogo({ compact = false, inverse = false }: SummaLogoProps) {
  return (
    <div className={`summa-logo ${inverse ? "summa-logo-inverse" : ""}`} aria-label="Summa AI">
      <span className="summa-orb" aria-hidden="true" />
      {!compact && (
        <span className="summa-wordmark" aria-hidden="true">
          summa<span>AI</span>
        </span>
      )}
    </div>
  );
}
