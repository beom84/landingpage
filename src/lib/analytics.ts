"use client";

import { sendGTMEvent } from "@next/third-parties/google";

type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

const hasTagManagerId = Boolean(
  process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-PZQ7HG3D"
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
    console.log(`[GTM] ${eventName}`, payload);
  }

  if (!hasTagManagerId) {
    return;
  }

  sendGTMEvent({
    event: eventName,
    ...payload,
  });
}
