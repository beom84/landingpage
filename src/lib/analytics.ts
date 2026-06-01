"use client";

import { sendGAEvent } from "@next/third-parties/google";

type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

const hasMeasurementId = Boolean(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-FG5T2B8DPX"
);

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

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  const payload = sanitizeParams(params);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[GA] ${eventName}`, payload);
  }

  if (!hasMeasurementId) {
    return;
  }

  sendGAEvent("event", eventName, payload);
}
