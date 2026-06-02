import type { ReactNode } from "react";

type FeatureSplitProps = {
  badge?: ReactNode;
  badgeTone?: "solid" | "tint";
  description: ReactNode;
  id: string;
  reverse?: boolean;
  title: ReactNode;
  visual: ReactNode;
};

export function FeatureSplit({
  badge,
  badgeTone = "solid",
  description,
  id,
  reverse = false,
  title,
  visual,
}: FeatureSplitProps) {
  return (
    <section
      className={`feature-section scroll-reveal${reverse ? " reverse" : ""}`}
        data-section={id}
      id={id}
    >
      <div className="site-shell feature-grid">
        <div className="feature-copy">
          {badge ? (
            <div className={`feature-badge${badgeTone === "tint" ? " tint" : ""}`}>
              {badge}
            </div>
          ) : null}
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="feature-visual-wrap">{visual}</div>
      </div>
    </section>
  );
}
