"use client";

import Image from "next/image";
import { startTransition, useEffect, useRef, useState } from "react";
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
  const goalFocusTracked = useRef(false);
  const goalStartedTracked = useRef(false);
  const betaStartedTracked = useRef(false);
  const [goalDraft, setGoalDraft] = useState("");
  const [goalError, setGoalError] = useState("");
  const [goalSubmitted, setGoalSubmitted] = useState("");
  const [betaEmail, setBetaEmail] = useState("");
  const [betaError, setBetaError] = useState("");
  const [isBetaSubmitting, setIsBetaSubmitting] = useState(false);
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

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
    trackEvent("cta_clicked", { origin, target: "cta" });
    scrollToTarget("cta");
  };

  const handleNavClick = (target: string) => {
    trackEvent("nav_clicked", { target });
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
                막연한 목표를,
                <br />
                <span>지금 할 수 있는</span>
                <br />
                첫 행동으로.
              </h1>
              <p>
                생각만 하다가 뭘 할지 몰라서 끝나는 목표가 없으셨나요?
                <br />
                Trace AI와의 대화를 통해 당신의 계획을 오늘 당장 5분 만에 끝낼 수 있는 행동
                조각으로 분해해보세요.
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
          description="목표를 달성하지 못해도 이유를 피드백하면, Trace AI가 기록하고 다음 행동 선정에 참고합니다. 점진적으로 난이도를 조정하여 지속 가능한 성장을 돕습니다."
          id="faq"
          title={
            <>
              달성하지 못해도 괜찮습니다.
              <br />
              기록하고 나를 위한 앱을 만들어요
            </>
          }
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
              당신의 목표,
              <br />
               작지만 빠르게 시작할 시간입니다.
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
                onChange={(event) => {
                  setBetaEmail(event.target.value);
                  if (betaError) {
                    setBetaError("");
                  }
                }}
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
              {betaSubmitted
                ? "베타 신청이 기록되었습니다. 이제 목표 작성부터 신청 전환까지 analytics에서 함께 볼 수 있습니다."
                : "모달 오픈, 입력 시작, 신청 제출 이벤트를 analytics로 함께 기록합니다."}
            </p>
          </div>
        </div>
      ) : null}

      <footer className="site-footer">
        <div className="site-shell footer-shell">
          <div className="footer-brand">
            <a href="#hero" onClick={() => handleNavClick("footer_logo")}>
              Trace AI
            </a>
            <p>© 2024 Trace AI. 모든 권리 보유.</p>
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
