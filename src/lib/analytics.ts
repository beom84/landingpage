"use client";

import { sendGAEvent } from "@next/third-parties/google";

type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

type AnalyticsUserProperties = Record<string, AnalyticsValue>;

type AnalyticsInitOptions = {
  analyticsVersion?: string;
  experienceName?: string;
  pageType?: string;
  userId?: string | null;
  userProperties?: AnalyticsUserProperties;
};

const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-FG5T2B8DPX";
const hasMeasurementId = Boolean(measurementId);
const visitorIdKey = "trace_visitor_id";
const sessionIdKey = "trace_session_id";

const analyticsContext = {
  analyticsVersion: "landing_v1",
  experienceName: "trace_landing",
  pageType: "landing_page",
  userId: null as string | null,
  userState: "anonymous" as "anonymous" | "authenticated",
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}

function readStoredId(
  storage: Storage,
  storageKey: string,
  prefix: string
): string {
  const existingValue = storage.getItem(storageKey);
  if (existingValue) {
    return existingValue;
  }

  const createdValue = createId(prefix);
  storage.setItem(storageKey, createdValue);
  return createdValue;
}

function getVisitorId() {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    return readStoredId(window.localStorage, visitorIdKey, "visitor");
  } catch {
    return "storage_unavailable";
  }
}

function getSessionId() {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    return readStoredId(window.sessionStorage, sessionIdKey, "session");
  } catch {
    return "storage_unavailable";
  }
}

function getDeviceType() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  if (window.innerWidth < 768) {
    return "mobile";
  }

  if (window.innerWidth < 1200) {
    return "tablet";
  }

  return "desktop";
}

function getViewportBucket() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const width = window.innerWidth;

  if (width < 480) {
    return "xs";
  }

  if (width < 768) {
    return "sm";
  }

  if (width < 1024) {
    return "md";
  }

  if (width < 1440) {
    return "lg";
  }

  return "xl";
}

function getLocale() {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return "unknown";
}

function callGtag(...args: unknown[]) {
  if (typeof window === "undefined" || !hasMeasurementId) {
    return;
  }

  const analyticsWindow = window as typeof window & {
    dataLayer?: unknown[];
    gtag?: (...gtagArgs: unknown[]) => void;
  };

  if (typeof analyticsWindow.gtag === "function") {
    analyticsWindow.gtag(...args);
    return;
  }

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.dataLayer.push(args);
}

function sanitizeParams(
  params: AnalyticsParams
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return [];
      }

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return [[key, value]];
      }

      return [[key, String(value)]];
    })
  );
}

function getCommonParams(): AnalyticsParams {
  return {
    analytics_version: analyticsContext.analyticsVersion,
    device_type: getDeviceType(),
    experience_name: analyticsContext.experienceName,
    locale: getLocale(),
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
    page_title: typeof document !== "undefined" ? document.title : "",
    page_type: analyticsContext.pageType,
    session_id: getSessionId(),
    user_state: analyticsContext.userState,
    viewport_bucket: getViewportBucket(),
    visitor_id: getVisitorId(),
  };
}

function setAnalyticsUserProperties(userProperties: AnalyticsUserProperties = {}) {
  const payload = sanitizeParams({
    device_type: getDeviceType(),
    locale: getLocale(),
    user_state: analyticsContext.userState,
    viewport_bucket: getViewportBucket(),
    ...userProperties,
  });

  if (!Object.keys(payload).length) {
    return;
  }

  callGtag("set", "user_properties", payload);
}

export function initializeAnalytics({
  analyticsVersion = "landing_v1",
  experienceName = "trace_landing",
  pageType = "landing_page",
  userId,
  userProperties = {},
}: AnalyticsInitOptions = {}) {
  analyticsContext.analyticsVersion = analyticsVersion;
  analyticsContext.experienceName = experienceName;
  analyticsContext.pageType = pageType;
  analyticsContext.userId = userId ?? null;
  analyticsContext.userState = userId ? "authenticated" : "anonymous";

  if (userId) {
    callGtag("set", { user_id: userId });
  }

  setAnalyticsUserProperties(userProperties);
}

export function setAnalyticsUser(userId: string | null) {
  analyticsContext.userId = userId;
  analyticsContext.userState = userId ? "authenticated" : "anonymous";

  callGtag("set", { user_id: userId });
  setAnalyticsUserProperties();
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  const payload = sanitizeParams({
    ...getCommonParams(),
    ...params,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[GA] ${eventName}`, payload);
  }

  if (!hasMeasurementId) {
    return;
  }

  sendGAEvent("event", eventName, payload);
}
