import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type BetaSignupPayload = {
  email?: unknown;
  goal?: unknown;
  goalTopic?: unknown;
  pagePath?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getAppsScriptUrl() {
  const url = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL?.trim();

  if (!url) {
    throw new Error("Missing required environment variable: GOOGLE_APPS_SCRIPT_WEB_APP_URL");
  }

  return url;
}

export async function POST(request: NextRequest) {
  let payload: BetaSignupPayload;

  try {
    payload = (await request.json()) as BetaSignupPayload;
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const goal = typeof payload.goal === "string" ? payload.goal.trim() : "";
  const goalTopic =
    typeof payload.goalTopic === "string" ? payload.goalTopic.trim() : "general";
  const pagePath =
    typeof payload.pagePath === "string" ? payload.pagePath.trim() : "/";

  if (!isNonEmptyString(email) || !email.includes("@")) {
    return NextResponse.json(
      { message: "유효한 이메일 주소를 입력해 주세요." },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(goal)) {
    return NextResponse.json(
      { message: "오늘 이루고 싶은 목표를 먼저 적어주세요." },
      { status: 400 }
    );
  }

  try {
    const appsScriptResponse = await fetch(getAppsScriptUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        goal,
        goalTopic,
        pagePath,
        submittedAt: new Date().toISOString(),
      }),
    });

    const appsScriptData = (await appsScriptResponse.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!appsScriptResponse.ok || appsScriptData?.ok === false) {
      return NextResponse.json(
        {
          message:
            appsScriptData?.message ||
            "Apps Script 저장 중 문제가 생겼습니다. 배포 설정을 확인해 주세요.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save beta signup via Apps Script", error);

    return NextResponse.json(
      {
        message:
          "사전 신청 저장 중 문제가 생겼습니다. 설정을 확인한 뒤 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
