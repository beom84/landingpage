"use client";

type SiteHeaderProps = {
  onCtaClick: (origin: string) => void;
  onNavClick: (target: string) => void;
};

const navItems = [
  { href: "#features", label: "기능", target: "features" },
  { href: "#science", label: "과학적 근거", target: "science" },
  { href: "#community", label: "커뮤니티", target: "community" },
  { href: "#faq", label: "FAQ", target: "faq" },
] as const;

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

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a
              href={item.href}
              key={item.label}
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
          무료로 시작하기
        </button>
      </div>
    </header>
  );
}

