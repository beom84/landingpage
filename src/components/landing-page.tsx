"use client";

import Image from "next/image";
import { startTransition, useEffect, useRef, useState } from "react";
import { initializeAnalytics, trackEvent } from "@/lib/analytics";
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
      "막연한 목표는 뇌에 스트레스를 줍니다. 우리 뇌는 위협을 느끼면 회피하기 마련입니다.",
  },
  {
    number: "03",
    title: "행동을 기록하고 개선하지 않아서",
    description:
      "행동을 세우는 것보다 중요한 건 기록하고 개선하는 것입니다. 바꾸지 않는다면 좋은 계획도 나에게는 필요하지 않습니다.",
  },
] as const;

const beforeItems = [
  "보고서 써야 하고",
  "회의 준비도 해야 하고",
  "메일 답장도 해야 하고",
  "정산도 해야 하고",
  "병원 예약도 해야 하고...",
] as const;

const personalizedGrowthCards = [
  {
    description:
      '"주로 월요일 오후에 업무가 밀리는 경향이 있네요. 이때는 5분 단위의 아주 작은 행동부터 시작해보는 건 어떨까요?"',
    icon: "psychology" as const,
    title: "미루는 습관 감지",
  },
  {
    description:
      '"당신은 오전 10시에 가장 높은 달성률을 보입니다. 중요한 공부는 이 시간에 배치해 드릴게요."',
    icon: "schedule" as const,
    title: "최적의 시간대 추천",
  },
  {
    description:
      '"연속된 회의 직후에는 목표를 달성하지 못하는 패턴이 발견되었습니다. 이때는 휴식 시간을 먼저 제안합니다."',
    icon: "analytics" as const,
    title: "실패 패턴 분석",
  },
] as const;

const footerLinks = [
  { label: "이용약관", target: "footer_terms" },
  { label: "개인정보처리방침", target: "footer_privacy" },
  { label: "문의하기", target: "footer_contact" },
] as const;

type GoalTopic = "study" | "fitness" | "content" | "work" | "general";

function getLengthBucket(value: string) {
  const length = value.trim().length;

  if (length < 15) {
    return "short";
  }

  if (length < 40) {
    return "medium";
  }

  return "long";
}

function getGoalTopic(goal: string): GoalTopic {
  const normalized = goal.toLowerCase();

  if (normalized.includes("시험") || normalized.includes("공부")) {
    return "study";
  }

  if (
    normalized.includes("운동") ||
    normalized.includes("마라톤") ||
    normalized.includes("헬스")
  ) {
    return "fitness";
  }

  if (
    normalized.includes("글") ||
    normalized.includes("블로그") ||
    normalized.includes("콘텐츠") ||
    normalized.includes("기획")
  ) {
    return "content";
  }

  if (
    normalized.includes("프로젝트") ||
    normalized.includes("업무") ||
    normalized.includes("개발") ||
    normalized.includes("서비스")
  ) {
    return "work";
  }

  return "general";
}

export function LandingPage() {
  const seenSections = useRef(new Set<string>());
  const scrollMilestonesTracked = useRef(new Set<number>());
  const goalFocusTracked = useRef(false);
  const goalStartedTracked = useRef(false);
  const betaStartedTracked = useRef(false);
  const betaEmailStartedTracked = useRef(false);
  const [goalDraft, setGoalDraft] = useState("");
  const [goalError, setGoalError] = useState("");
  const [goalSubmitted, setGoalSubmitted] = useState("");
  const [betaEmail, setBetaEmail] = useState("");
  const [betaError, setBetaError] = useState("");
  const [isBetaSubmitting, setIsBetaSubmitting] = useState(false);
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  useEffect(() => {
    initializeAnalytics({
      analyticsVersion: "landing_v2",
      experienceName: "trace_landing",
      pageType: "landing_page",
    });

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

    const thresholds = [25, 50, 75, 90];

    const handleScroll = () => {
      const root = document.documentElement;
      const scrollableHeight = root.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        return;
      }

      const scrollDepth = Math.round((window.scrollY / scrollableHeight) * 100);

      thresholds.forEach((threshold) => {
        if (
          scrollDepth >= threshold &&
          !scrollMilestonesTracked.current.has(threshold)
        ) {
          scrollMilestonesTracked.current.add(threshold);
          trackEvent("scroll_depth_reached", {
            scroll_depth_percent: threshold,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isBetaModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsBetaModalOpen(false);
      trackEvent("beta_modal_closed", {
        reason: "escape_key",
        beta_submitted: betaSubmitted,
        has_goal: Boolean(goalSubmitted),
      });
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [betaSubmitted, goalSubmitted, isBetaModalOpen]);

  const scrollToTarget = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCtaClick = (origin: string) => {
    trackEvent("cta_clicked", {
      cta_label: "내 할 일 정리해보기",
      origin,
      target: "start_today",
    });
    scrollToTarget("start-today");
  };

  const handleNavClick = (target: string) => {
    trackEvent("nav_clicked", {
      navigation_area: target === "hero_logo" ? "header_brand" : "header_nav",
      target,
    });
  };

  const handleGoalFocus = () => {
    if (goalFocusTracked.current) {
      return;
    }

    goalFocusTracked.current = true;
    trackEvent("goal_input_focused", { location: "cta_form" });
  };

  const handleGoalChange = (value: string) => {
    setGoalDraft(value);

    if (goalError && value.trim()) {
      setGoalError("");
    }

    if (!goalStartedTracked.current && value.trim()) {
      goalStartedTracked.current = true;
      trackEvent("goal_input_started", {
        location: "cta_form",
        length_bucket: getLengthBucket(value),
      });
    }
  };

  const openBetaModal = (goal: string, source: string) => {
    const goalTopic = getGoalTopic(goal);

    betaStartedTracked.current = false;
    betaEmailStartedTracked.current = false;

    startTransition(() => {
      setGoalSubmitted(goal);
      setBetaEmail("");
      setBetaError("");
      setIsBetaSubmitting(false);
      setBetaSubmitted(false);
      setIsBetaModalOpen(true);
    });

    trackEvent("beta_modal_opened", {
      source,
      goal_length_bucket: getLengthBucket(goal),
      goal_length: goal.length,
      goal_topic: goalTopic,
    });
  };

  const handleGoalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedGoal = goalDraft.trim();

    if (!trimmedGoal) {
      setGoalError("오늘 이루고 싶은 목표를 먼저 적어주세요.");
      trackEvent("goal_submit_validation_failed", {
        reason: "empty_goal",
      });
      return;
    }

    setGoalError("");
    const goalTopic = getGoalTopic(trimmedGoal);

    trackEvent("goal_submitted", {
      goal_length_bucket: getLengthBucket(trimmedGoal),
      goal_length: trimmedGoal.length,
      goal_topic: goalTopic,
    });

    openBetaModal(trimmedGoal, "recommendation_cta");
  };

  const handleBetaFocus = () => {
    if (betaStartedTracked.current) {
      return;
    }

    betaStartedTracked.current = true;
    trackEvent("beta_form_started", {
      entry_point: "beta_modal",
      has_goal: Boolean(goalSubmitted),
    });
  };

  const handleBetaEmailChange = (value: string) => {
    setBetaEmail(value);

    if (betaError) {
      setBetaError("");
    }

    if (!betaEmailStartedTracked.current && value.trim()) {
      betaEmailStartedTracked.current = true;
      trackEvent("beta_email_started", {
        entry_point: "beta_modal",
      });
    }
  };

  const handleBetaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = betaEmail.trim();
    if (!trimmedEmail.includes("@")) {
      setBetaError("유효한 이메일 주소를 입력해 주세요.");
      trackEvent("beta_application_validation_failed", {
        reason: "invalid_email",
      });
      return;
    }

    setBetaError("");
    setIsBetaSubmitting(true);

    try {
      const response = await fetch("/api/beta-signups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          goal: goalSubmitted,
          goalTopic: getGoalTopic(goalSubmitted),
          pagePath: window.location.pathname,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        const message =
          data?.message || "사전 신청 저장 중 문제가 생겼습니다. 다시 시도해 주세요.";

        setBetaError(message);
        trackEvent("beta_application_save_failed", {
          status_code: response.status,
        });
        return;
      }

      setBetaSubmitted(true);
      trackEvent("beta_application_submitted", {
        email_domain: trimmedEmail.split("@")[1] ?? "unknown",
        goal_length_bucket: getLengthBucket(goalSubmitted),
        goal_topic: getGoalTopic(goalSubmitted),
        entry_point: "beta_modal",
      });

      setIsBetaModalOpen(false);
      trackEvent("beta_modal_closed", {
        reason: "submit_success",
        beta_submitted: true,
        has_goal: Boolean(goalSubmitted),
      });

      window.setTimeout(() => {
        scrollToTarget("hero");
      }, 0);
    } finally {
      setIsBetaSubmitting(false);
    }
  };

  const handleBetaModalClose = (reason: string) => {
    setIsBetaModalOpen(false);
    trackEvent("beta_modal_closed", {
      reason,
      beta_submitted: betaSubmitted,
      has_goal: Boolean(goalSubmitted),
    });
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
                할 일은 많은데, 시작을 못 하고 있다면
                <br className="responsive-break" />
                <span>머릿속 할 일을 적기만 하세요.</span>
              </h1>
              <p>지금 해야 할 일 하나와 첫 행동까지 정리해드립니다.</p>
              <button
                className="primary-button hero-cta"
                onClick={() => handleCtaClick("hero_cta")}
                type="button"
              >
                내 할 일 정리해보기
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
          className="how-section scroll-reveal"
          data-section="how-it-helps"
          id="how-it-helps"
        >
          <div className="site-shell">
            <div className="section-heading how-heading">
              <span className="section-kicker">HOW IT HELPS</span>
              <h2>복잡한 할 일을 지금 할 수 있는 행동으로 바꿔요</h2>
              <p>
                할 일을 전부 해내라고 말하지 않습니다.
                <br className="responsive-break" />
                지금 가장 중요한 일 하나와, 바로
                시작할 수 있는 첫 행동을 제안합니다.
              </p>
            </div>

            <div className="how-grid">
              <article className="how-card how-card-before">
                <div className="how-card-head">
                  <span className="how-pill">BEFORE</span>
                  <h3>머릿속 할 일이 너무 많을 때</h3>
                </div>
                <div className="how-before-stack">
                  {beforeItems.map((item) => (
                    <div className="how-before-item" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
                <p className="how-footer-copy">&ldquo;뭐부터 해야 하지?&rdquo;</p>
              </article>

              <div className="how-arrow" aria-hidden="true">
                <Icon className="ui-icon" name="arrow_right_alt" />
              </div>

              <article className="how-card how-card-after">
                <div className="how-card-head">
                  <span className="how-pill how-pill-primary">AFTER</span>
                  <h3>지금 할 일 하나만 남깁니다</h3>
                </div>
                <p className="how-after-copy">
                  오늘은 회의 준비부터 시작해도 괜찮아요.
                </p>
                <div className="how-action-card">
                  <div className="how-action-row">
                    <span className="how-action-icon">
                      <Icon className="ui-icon" name="bolt" />
                    </span>
                    <strong>첫 행동: 자료 파일을 열고 제목 3개만 확인하기</strong>
                  </div>
                  <span className="how-action-step">1</span>
                </div>
                <p className="how-footer-copy how-footer-copy-primary">
                  10분만 해도 다시 시작한 거예요.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="pain-section scroll-reveal"
          data-section="pain-points"
          id="pain-points"
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
          reverse
          description={
            <>
              &apos;영어 시험 공부&apos;라는 목표를 입력하면, 질문을 통해 나의 현재 상황에 맞춰
              당장 가능한 단위 행동을 제안합니다.
            </>
          }
          id="features"
          title={
            <>
              모호한 목표를
              <br className="responsive-break" />
              세밀하게 분해합니다
            </>
          }
          visual={
            <Image
              alt="영어 시험 공부 목표를 질문을 통해 지금 가능한 단위 행동으로 바꾸는 예시"
              className="diagram-image"
              height={704}
              sizes="(min-width: 1024px) 560px, 100vw"
              src="/goal-breakdown-flow.png"
              width={1495}
            />
          }
        />

        <FeatureSplit
          badge={<Icon className="ui-icon" name="check_circle" />}
          description={
            <>
              행동은 남겨야 다음에 더 잘할 수 있습니다. Trace는 작은 행동 하나하나를
              기록하고, 무엇이 잘 맞았는지 돌아보며 다음 행동을 더 쉽게 이어가도록
              돕습니다.
            </>
          }
          id="momentum"
          title={
            <>
              나의 행동을
              <br className="responsive-break" />
              확인하고 개선합니다.
            </>
          }
          visual={
            <Image
              alt="오늘 행동을 돌아보며 방해 요인을 확인하는 예시"
              className="checklist-image"
              height={1600}
              sizes="(min-width: 1024px) 560px, 100vw"
              src="/behavior-review.png"
              width={2670}
            />
          }
        />

        <FeatureSplit
          badgeTone="tint"
          description={
            <>
              계획대로 하지 못한 날에도 괜찮습니다. Trace는 남겨진 기록을 바탕으로 지금
              상황에 맞는 다음 행동을 다시 제안하고, 더 나에게 맞는 흐름으로 조정해줍니다.
            </>
          }
          id="faq"
          reverse
          title={
            <>
              늦잠자도 괜찮아요.
              <br className="responsive-break" />
              Trace와 함께 조정하세요.
            </>
          }
          visual={
            <Image
              alt="일과 회고 및 조정 예시 화면"
              className="growth-image"
              height={1728}
              sizes="(min-width: 1024px) 320px, 72vw"
              src="/adjustment-card-v2.png"
              width={2416}
            />
          }
        />

        <section
          className="personalized-section scroll-reveal"
          data-section="personalized-growth"
          id="personalized-growth"
        >
          <div className="site-shell">
            <div className="section-heading personalized-heading">
              <span className="section-kicker">PERSONALIZED GROWTH</span>
              <h2>사용자의 패턴을 기억하고 최적의 경로를 찾습니다</h2>
              <p>
                단순한 기록을 넘어, 사용자가 언제 집중력이 떨어지는지, 어떤 상황에서 계획을
                미루게 되는지 분석합니다. 데이터에 기반하여 당신에게 가장 잘 맞는 계획
                방식을 제안합니다.
              </p>
            </div>

            <div className="personalized-grid">
              {personalizedGrowthCards.map((card) => (
                <article className="personalized-card" key={card.title}>
                  <div className="personalized-icon">
                    <Icon className="ui-icon" name={card.icon} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="cta-section scroll-reveal"
          data-section="start-today"
          id="start-today"
        >
          <div className="site-shell cta-shell">
            <span className="cta-kicker">START TODAY</span>
            <h2>
              당신의 목표를 적어보세요
              <br className="responsive-break" />
              Trace가 함께 정리해드릴게요
            </h2>

            <div className="cta-lab cta-lab-single">
              <form className="goal-form-card" onSubmit={handleGoalSubmit}>
                <div className="card-label-row">
                  <span className="card-step">01</span>
                  <span className="card-label">오늘 이루고 싶은 목표</span>
                </div>
                <label className="sr-only" htmlFor="goal-input">
                  목표 입력
                </label>
                <textarea
                  aria-describedby={goalError ? "goal-input-warning" : undefined}
                  aria-invalid={goalError ? "true" : "false"}
                  id="goal-input"
                  className={`goal-textarea${goalError ? " has-error" : ""}`}
                  onChange={(event) => handleGoalChange(event.target.value)}
                  onFocus={handleGoalFocus}
                  placeholder="예: 영어 시험 공부를 미루지 않고 오늘 바로 시작하고 싶어요"
                  rows={4}
                  value={goalDraft}
                />
                {goalError ? (
                  <p className="goal-warning" id="goal-input-warning">
                    {goalError}
                  </p>
                ) : null}
                <div className="goal-hints">
                  <span>시험 준비</span>
                  <span>운동 시작</span>
                  <span>업무 프로젝트</span>
                </div>
                <button className="secondary-button cta-submit" type="submit">
                  첫 행동 추천받기
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {isBetaModalOpen ? (
        <div
          className="modal-backdrop"
          onClick={() => handleBetaModalClose("backdrop")}
          role="presentation"
        >
          <div
            aria-labelledby="beta-modal-title"
            aria-modal="true"
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="베타 신청 모달 닫기"
              className="modal-close"
              onClick={() => handleBetaModalClose("close_button")}
              type="button"
            >
              ×
            </button>

            <span className="modal-kicker">BETA ACCESS</span>
            <h3 id="beta-modal-title">첫 행동 추천을 가장 먼저 받아보세요</h3>
            <p className="modal-copy">
              방금 적어주신 목표를 바탕으로 베타 우선 초대와 첫 행동 추천을 보내드릴게요.
            </p>

            <div className="modal-goal-preview">
              <span>오늘 목표</span>
              <strong>{goalSubmitted}</strong>
            </div>

            <form className="beta-modal-form" onSubmit={handleBetaSubmit}>
              <label className="beta-label" htmlFor="beta-email">
                베타 초대를 받을 이메일
              </label>
              <input
                autoFocus
                id="beta-email"
                className="beta-input"
                onChange={(event) => handleBetaEmailChange(event.target.value)}
                onFocus={handleBetaFocus}
                placeholder="name@example.com"
                type="email"
                value={betaEmail}
              />
              <button
                className="primary-button beta-modal-button"
                disabled={isBetaSubmitting || betaSubmitted}
                type="submit"
              >
                {isBetaSubmitting
                  ? "저장 중..."
                  : betaSubmitted
                    ? "신청 완료"
                    : "베타테스트 신청하기"}
              </button>
            </form>

            {betaError ? <p className="beta-error">{betaError}</p> : null}

            <p className="beta-status modal-status">
           
            </p>
          </div>
        </div>
      ) : null}

      <footer className="site-footer">
        <div className="site-shell footer-shell">
          <div className="footer-brand">
            <a
              href="#hero"
              onClick={() =>
                trackEvent("nav_clicked", {
                  navigation_area: "footer_brand",
                  target: "footer_logo",
                })
              }
            >
              Trace
            </a>
            <p>© 2024 Trace AI. 모든 권리 보유.</p>
          </div>

          <div className="footer-links">
            {footerLinks.map((item) => (
              <a
                href="#hero"
                key={item.target}
                onClick={() =>
                  trackEvent("nav_clicked", {
                    navigation_area: "footer",
                    target: item.target,
                  })
                }
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
