"use client";

const navItems = [
  { href: "#how-it-helps", label: "작동 원리", target: "how_it_helps" },
  { href: "#pain-points", label: "고민 해결", target: "pain_points" },
  { href: "#personalized-growth", label: "패턴 학습", target: "personalized_growth" },
  { href: "#start-today", label: "지금 시작하기", target: "start_today" },
] as const;

type SiteHeaderProps = {
  onCtaClick: (origin: string) => void;
  onNavClick: (target: string) => void;
};

export function SiteHeader({ onCtaClick, onNavClick }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-shell nav-shell">
        <a
          className="brand-link"
          href="#hero"
          onClick={() => onNavClick("hero_logo")}
        >
          Trace
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              href={item.href}
              key={item.href}
              onClick={() => onNavClick(item.target)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          className="primary-button nav-cta"
          onClick={() => onCtaClick("header_cta")}
          type="button"
        >
          지금 바로 시작하기
        </button>
      </div>
    </header>
  );
}
