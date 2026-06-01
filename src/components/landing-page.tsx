"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { FeatureSplit } from "./feature-split";
import { Icon } from "./icon";
import { SiteHeader } from "./site-header";

const painPoints = [
  {
    number: "01",
    title: "시작점을 못 찾아서",
    description:
      '"공부해야지"라는 결심은 좋지만, 책상 앞에 앉아 무엇부터 펼쳐야 할지 고민하다 에너지를 다 써버립니다.',
  },
  {
    number: "02",
    title: "목표가 너무 커서",
    description:
      "거대한 산처럼 느껴지는 목표는 뇌에 스트레스를 줍니다. 우리 뇌는 위협을 느끼면 회피하기 마련입니다.",
  },
  {
    number: "03",
    title: "실패 후 재조정이 힘들어서",
    description:
      "어제 계획을 지키지 못하면 자책감이 앞섭니다. 다시 시작할 용기를 내는 것이 새 목표를 세우는 것보다 어렵습니다.",
  },
] as const;

const footerLinks = [
  "이용약관",
  "개인정보처리방침",
  "문의하기",
] as const;

export function LandingPage() {
  const seenSections = useRef(new Set<string>());

  useEffect(() => {
    trackEvent("landing_page_viewed", { path: window.location.pathname });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          const sectionName = (entry.target as HTMLElement).dataset.section;
          if (!sectionName || seenSections.current.has(sectionName)) {
            return;
          }

          seenSections.current.add(sectionName);
          trackEvent("section_view", { section: sectionName });
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll<HTMLElement>("[data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToTarget = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCtaClick = (origin: string) => {
    trackEvent("cta_clicked", { origin, target: "cta" });
    scrollToTarget("cta");
  };

  const handleNavClick = (target: string) => {
    trackEvent("nav_clicked", { target });
  };

  return (
    <div className="page-root">
      <SiteHeader onCtaClick={handleCtaClick} onNavClick={handleNavClick} />

      <main>
        <section className="hero-section scroll-reveal" data-section="hero" id="hero">
          <div className="site-shell hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">GOAL TO ACTION SYSTEM</span>
              <h1>
                막연한 목표를,
                <br />
                <span>지금 할 수 있는</span>
                <br />
                첫 행동으로.
              </h1>
              <p>
                생각만 하다가 끝나는 무거운 목표들. 첫걸음은 당신의 거대한 야심을 오늘
                당장 5분 만에 끝낼 수 있는 행동 조각으로 분해합니다.
              </p>
              <button
                className="primary-button hero-cta"
                onClick={() => handleCtaClick("hero_cta")}
                type="button"
              >
                오늘 하루 시작하기
              </button>
            </div>

            <div className="hero-phone-wrap" aria-hidden="true">
              <div className="hero-glow" />
              <Icon className="hero-star ui-icon" name="star" />
              <div className="hero-phone">
                <div className="phone-head">
                  <span>오늘의 행동</span>
                  <Icon className="dots-icon ui-icon" name="more_horiz" />
                </div>

                <div className="phone-card is-active">
                  <div className="check-circle filled">
                    <Icon className="check-icon ui-icon" name="check" />
                  </div>
                  <div>
                    <h3>전공 서적 3페이지 읽기</h3>
                    <p>목표: 기말고사 A+ 받기</p>
                  </div>
                </div>

                <div className="phone-card">
                  <div className="check-circle" />
                  <div>
                    <h3>운동화 끈 묶고 현관 서기</h3>
                    <p>목표: 10km 마라톤 완주</p>
                  </div>
                </div>

                <div className="phone-card is-muted">
                  <div className="check-circle" />
                  <div>
                    <h3>물 한 잔 마시기</h3>
                    <p>목표: 건강한 습관 만들기</p>
                  </div>
                </div>

                <button className="primary-button phone-cta" type="button">
                  완료하고 다음 단계로
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="pain-section scroll-reveal"
          data-section="pain-points"
          id="science"
        >
          <div className="site-shell">
            <div className="section-heading">
              <span className="section-kicker">PAIN POINTS</span>
              <h2>우리는 왜 시작하지 못할까요?</h2>
            </div>

            <div className="pain-grid">
              {painPoints.map((item) => (
                <article className="pain-card" key={item.number}>
                  <span className="pain-number">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <FeatureSplit
          badge={<Icon className="ui-icon" name="add" />}
          description="'영어 시험 공부'라는 단어를 입력하면, 나의 현재 상황에 맞춰 당장 가능한 단위 행동을 제안합니다."
          id="features"
          title={
            <>
              모호한 목표를
              <br />
              세밀하게 분해합니다
            </>
          }
          visual={
            <div className="diagram-card" aria-hidden="true">
              <div className="diagram-dashed" />
              <div className="diagram-flow">
                <div className="diagram-node">영어 시험 공부</div>
                <Icon className="arrow-icon ui-icon" name="arrow_right_alt" />
                <div className="diagram-node primary">단어 5개 읽기</div>
              </div>
            </div>
          }
        />

        <FeatureSplit
          badge={<Icon className="ui-icon" name="check_circle" />}
          description="동기부여는 행동의 결과물입니다. 아주 작은 성공(Small Win)을 통해 도파민을 활성화하고 다음단계로 자연스럽게 이끕니다."
          id="community"
          reverse
          title={
            <>
              생각보다 행동이
              <br />
              먼저 오게 만듭니다
            </>
          }
          visual={
            <div className="checklist-card" aria-hidden="true">
              <span className="celebration">🎉</span>
              <h3>체크리스트 완료</h3>
              <div className="progress-track">
                <div className="progress-value" />
              </div>
              <div className="checklist-items">
                <div className="checklist-item done">
                  <div className="small-check">
                    <Icon className="tiny-check-icon ui-icon" name="check" />
                  </div>
                  <span>책상 정리하기</span>
                </div>
                <div className="checklist-item done">
                  <div className="small-check">
                    <Icon className="tiny-check-icon ui-icon" name="check" />
                  </div>
                  <span>노트북 켜기</span>
                </div>
                <div className="checklist-item current">
                  <div className="small-check outline" />
                  <span>첫 문단 읽기</span>
                </div>
              </div>
            </div>
          }
        />

        <FeatureSplit
          badgeTone="tint"
          badge={<Icon className="ui-icon" name="trending_up" />}
          description="목표를 달성하고 피드백하면, Trace가 기록하고 다음 행동 선정에 참고합니다. 점진적으로 난이도를 조정하여 지속 가능한 성장을 돕습니다."
          id="faq"
          title="피드백하고 성장합니다"
          visual={
            <div className="growth-visual">
              <Image
                alt="Feedback and growth illustration"
                className="growth-image"
                height={382}
                src="/feedback-growth.png"
                width={512}
              />
            </div>
          }
        />

        <section className="cta-section scroll-reveal" data-section="cta-section" id="cta">
          <div className="site-shell cta-shell">
            <span className="cta-kicker">START TODAY</span>
            <h2>
              당신의 위대한 목표,
              <br />
              가장 작게 시작할 시간입니다.
            </h2>
            <button
              className="secondary-button"
              onClick={() => handleCtaClick("footer_cta")}
              type="button"
            >
              무료로 첫 행동 추천받기
            </button>
            <p>카드 등록 불필요 · 30초면 시작 가능</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-shell footer-shell">
          <div className="footer-brand">
            <a href="#hero" onClick={() => handleNavClick("footer_logo")}>
              Trace
            </a>
            <p>© 2024 Trace. 모든 권리 보유.</p>
          </div>

          <div className="footer-links">
            {footerLinks.map((item) => (
              <a href="#hero" key={item} onClick={() => handleNavClick(item)}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
