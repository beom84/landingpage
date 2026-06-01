"use client";

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
          Trace AI
        </a>

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
