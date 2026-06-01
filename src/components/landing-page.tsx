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

type FeedbackTone = "helpful" | "confusing";

type Recommendation = {
  action: string;
  betaPrompt: string;
  note: string;
  reason: string;
};

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

function buildRecommendation(goal: string): Recommendation {
  const normalized = goal.toLowerCase();

  if (normalized.includes("시험") || normalized.includes("공부")) {
    return {
      action: "시험 범위 사진 찍고 오늘 볼 페이지 3쪽만 표시하기",
      betaPrompt: "공부 루틴용 3일 베타 플랜 받아보기",
      note: "지금 필요한 건 의지보다 시작점을 보이게 만드는 일입니다.",
      reason: "시험 준비는 범위가 흐릴수록 회피가 커져서, 가장 먼저 범위를 시각화하는 행동을 권합니다.",
    };
  }

  if (
    normalized.includes("운동") ||
    normalized.includes("마라톤") ||
    normalized.includes("헬스")
  ) {
    return {
      action: "운동화 끈 묶고 현관 앞에 2분 서 있기",
      betaPrompt: "운동 시작 루틴 베타 신청하기",
      note: "몸을 움직이기 전에 준비 행동부터 자동화하는 편이 성공률이 높습니다.",
      reason: "운동 목표는 시작 마찰이 가장 크기 때문에, 실제 운동보다 앞단의 준비 행동을 먼저 고정합니다.",
    };
  }

  if (
    normalized.includes("글") ||
    normalized.includes("블로그") ||
    normalized.includes("콘텐츠") ||
    normalized.includes("기획")
  ) {
    return {
      action: "문서 제목만 쓰고 소제목 3개 초안 적기",
      betaPrompt: "콘텐츠 제작 베타 워크플로우 보기",
      note: "빈 문서의 압박을 줄이면 생각보다 빠르게 첫 문장이 나옵니다.",
      reason: "창작 목표는 완성본을 떠올릴수록 막히기 쉬워서, 초안의 뼈대만 먼저 만듭니다.",
    };
  }

  if (
    normalized.includes("프로젝트") ||
    normalized.includes("업무") ||
    normalized.includes("개발") ||
    normalized.includes("서비스")
  ) {
    return {
      action: "해야 할 일 3개만 적고 15분 안에 끝날 일 하나 고르기",
      betaPrompt: "업무 분해 베타 기능 먼저 써보기",
      note: "큰 프로젝트는 방향보다 즉시 끝낼 수 있는 조각을 먼저 찾는 게 중요합니다.",
      reason: "업무 목표는 범위가 넓을수록 착수 지연이 커져서, 시간제한이 짧은 한 조각을 먼저 고르게 합니다.",
    };
  }

  return {
    action: "목표를 한 문장으로 다시 적고 오늘 5분 안에 끝낼 첫 행동 1개만 정하기",
    betaPrompt: "나만의 첫 행동 추천 베타 신청하기",
    note: "아직 목표가 넓게 느껴진다면, Trace는 첫 행동부터 먼저 확정해 줍니다.",
    reason: "막연한 목표일수록 첫 행동의 크기를 줄이는 것이 가장 빠른 진입점입니다.",
  };
}

export function LandingPage() {
  const seenSections = useRef(new Set<string>());
  const goalFocusTracked = useRef(false);
  const goalStartedTracked = useRef(false);
  const betaStartedTracked = useRef(false);
  const [goalDraft, setGoalDraft] = useState("");
  const [goalSubmitted, setGoalSubmitted] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [betaEmail, setBetaEmail] = useState("");
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const handleGoalFocus = () => {
    if (goalFocusTracked.current) {
      return;
    }

    goalFocusTracked.current = true;
    trackEvent("goal_input_focused", { location: "cta_form" });
  };

  const handleGoalChange = (value: string) => {
    setGoalDraft(value);

    if (!goalStartedTracked.current && value.trim()) {
      goalStartedTracked.current = true;
      trackEvent("goal_input_started", {
        location: "cta_form",
        length_bucket: getLengthBucket(value),
      });
    }
  };

  const handleGoalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedGoal = goalDraft.trim();

    if (!trimmedGoal) {
      trackEvent("goal_submit_validation_failed", {
        reason: "empty_goal",
      });
      return;
    }

    const nextRecommendation = buildRecommendation(trimmedGoal);
    betaStartedTracked.current = false;

    trackEvent("goal_submitted", {
      goal_length_bucket: getLengthBucket(trimmedGoal),
      goal_length: trimmedGoal.length,
    });

    startTransition(() => {
      setGoalSubmitted(trimmedGoal);
      setRecommendation(nextRecommendation);
      setBetaSubmitted(false);
      setFeedbackTone(null);
      setFeedbackNote("");
      setFeedbackSubmitted(false);
      setBetaEmail("");
    });

    trackEvent("recommendation_viewed", {
      recommendation_type: nextRecommendation.betaPrompt,
    });
  };

  const handleBetaFocus = () => {
    if (betaStartedTracked.current) {
      return;
    }

    betaStartedTracked.current = true;
    trackEvent("beta_form_started", {
      has_recommendation: Boolean(recommendation),
    });
  };

  const handleBetaSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = betaEmail.trim();
    if (!trimmedEmail.includes("@")) {
      trackEvent("beta_application_validation_failed", {
        reason: "invalid_email",
      });
      return;
    }

    setBetaSubmitted(true);
    trackEvent("beta_application_submitted", {
      email_domain: trimmedEmail.split("@")[1] ?? "unknown",
      goal_length_bucket: getLengthBucket(goalSubmitted),
    });
  };

  const handleFeedbackChoice = (tone: FeedbackTone) => {
    setFeedbackTone(tone);
    trackEvent("feedback_option_selected", { tone });
  };

  const handleFeedbackSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!feedbackTone) {
      trackEvent("feedback_validation_failed", { reason: "tone_missing" });
      return;
    }

    setFeedbackSubmitted(true);
    trackEvent("feedback_submitted", {
      tone: feedbackTone,
      has_note: Boolean(feedbackNote.trim()),
    });
  };

  const handleRecommendationReset = () => {
    setGoalDraft("");
    setGoalSubmitted("");
    setRecommendation(null);
    setBetaEmail("");
    setBetaSubmitted(false);
    setFeedbackTone(null);
    setFeedbackNote("");
    setFeedbackSubmitted(false);
    goalStartedTracked.current = false;
    betaStartedTracked.current = false;
    trackEvent("recommendation_reset", { source: "cta_lab" });
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
            <p className="cta-intro">
              단순 클릭 수만 보는 대신, 어디서 막히는지 읽을 수 있도록 목표 입력부터 추천 결과,
              베타 신청과 피드백까지 한 흐름으로 측정합니다.
            </p>

            <div className="cta-lab">
              <form className="goal-form-card" onSubmit={handleGoalSubmit}>
                <div className="card-label-row">
                  <span className="card-step">01</span>
                  <span className="card-label">오늘 이루고 싶은 목표</span>
                </div>
                <label className="sr-only" htmlFor="goal-input">
                  목표 입력
                </label>
                <textarea
                  id="goal-input"
                  className="goal-textarea"
                  onChange={(event) => handleGoalChange(event.target.value)}
                  onFocus={handleGoalFocus}
                  placeholder="예: 영어 시험 공부를 미루지 않고 오늘 바로 시작하고 싶어요"
                  rows={4}
                  value={goalDraft}
                />
                <div className="goal-hints">
                  <span>시험 준비</span>
                  <span>운동 시작</span>
                  <span>업무 프로젝트</span>
                </div>
                <button className="secondary-button cta-submit" type="submit">
                  첫 행동 추천받기
                </button>
                <p className="cta-help">입력 내용은 이 데모 화면 안에서만 사용됩니다.</p>
              </form>

              <div className="result-card">
                <div className="card-label-row">
                  <span className="card-step">02</span>
                  <span className="card-label">추천 결과와 전환 흐름</span>
                </div>

                {recommendation ? (
                  <>
                    <div className="recommendation-box">
                      <p className="recommendation-kicker">추천 첫 행동</p>
                      <h3>{recommendation.action}</h3>
                      <p>{recommendation.reason}</p>
                    </div>

                    <div className="recommendation-note">
                      <Icon className="ui-icon note-icon" name="check_circle" />
                      <span>{recommendation.note}</span>
                    </div>

                    <form className="beta-form" onSubmit={handleBetaSubmit}>
                      <label className="beta-label" htmlFor="beta-email">
                        베타 우선 체험 신청
                      </label>
                      <div className="beta-row">
                        <input
                          id="beta-email"
                          className="beta-input"
                          onChange={(event) => setBetaEmail(event.target.value)}
                          onFocus={handleBetaFocus}
                          placeholder="이메일을 입력하면 베타 초대를 보내드려요"
                          type="email"
                          value={betaEmail}
                        />
                        <button className="primary-button beta-button" type="submit">
                          {recommendation.betaPrompt}
                        </button>
                      </div>
                      <p className="beta-status">
                        {betaSubmitted
                          ? "베타 신청 신호가 기록되었습니다. 이제 추천 가치와 신청 전환을 같이 볼 수 있습니다."
                          : "추천 결과를 본 뒤 신청까지 이어지는지를 보면 결과 자체의 설득력을 확인할 수 있습니다."}
                      </p>
                    </form>

                    <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                      <span className="feedback-label">이 추천이 실제로 시작에 도움이 될까요?</span>
                      <div className="feedback-options">
                        <button
                          className={`feedback-chip${feedbackTone === "helpful" ? " active" : ""}`}
                          onClick={() => handleFeedbackChoice("helpful")}
                          type="button"
                        >
                          도움이 돼요
                        </button>
                        <button
                          className={`feedback-chip${feedbackTone === "confusing" ? " active" : ""}`}
                          onClick={() => handleFeedbackChoice("confusing")}
                          type="button"
                        >
                          더 단순해야 해요
                        </button>
                      </div>
                      <textarea
                        className="feedback-textarea"
                        onChange={(event) => setFeedbackNote(event.target.value)}
                        placeholder="어디서 부담을 느꼈는지 적어주면 반복 사용 가능성 신호를 더 잘 읽을 수 있어요"
                        rows={3}
                        value={feedbackNote}
                      />
                      <div className="feedback-actions">
                        <button className="secondary-button feedback-submit" type="submit">
                          피드백 보내기
                        </button>
                        <button
                          className="ghost-button"
                          onClick={handleRecommendationReset}
                          type="button"
                        >
                          다른 목표로 다시 보기
                        </button>
                      </div>
                      <p className="feedback-status">
                        {feedbackSubmitted
                          ? "피드백이 기록되었습니다. 반복 사용 가능성을 읽는 데 이 구간이 가장 중요합니다."
                          : "피드백 제출이 꾸준히 나오면, 단발 클릭보다 더 강한 재사용 신호로 볼 수 있습니다."}
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="result-empty">
                    <p className="recommendation-kicker">이 구간에서 읽고 싶은 해석</p>
                    <ul>
                      <li>방문은 많은데 CTA 클릭이 낮으면 Hero 카피를 먼저 점검합니다.</li>
                      <li>CTA 클릭은 높은데 목표 제출이 낮으면 입력 UX 부담을 의심합니다.</li>
                      <li>목표 제출은 많은데 베타 신청이 낮으면 추천 가치가 약한 신호입니다.</li>
                      <li>피드백 제출이 이어지면 반복 사용 가능성을 볼 수 있습니다.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
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
