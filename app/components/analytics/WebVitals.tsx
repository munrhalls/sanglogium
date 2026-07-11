"use client";

import { useEffect } from "react";
import {
  onCLS,
  onFCP,
  onINP,
  onLCP,
  onTTFB,
  type MetricWithAttribution as Metric
} from "web-vitals/attribution";

/**
 * Web Vitals Real User Monitoring (RUM) Component
 *
 * Collects Core Web Vitals metrics using the web-vitals library.
 * Reports to console in development, can be extended for production analytics.
 *
 * Metrics collected:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * - TBT (Total Blocking Time) - derived from INP and CLS
 */

// Metric thresholds for console warnings
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
};

type MetricName = keyof typeof THRESHOLDS;

function getRating(name: MetricName, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

function logMetric(metric: Metric, name: MetricName) {
  const rating = getRating(name, metric.value);
  const style = {
    good: "color: green; font-weight: bold;",
    "needs-improvement": "color: orange; font-weight: bold;",
    poor: "color: red; font-weight: bold;",
  }[rating];

  // eslint-disable-next-line no-console
  console.log(
    `%c[Web Vitals] ${name}: ${metric.value.toFixed(2)} (${rating})`,
    style,
    metric
  );

  // Warn in development for poor metrics
  if (process.env.NODE_ENV === "development" && rating === "poor") {
    // eslint-disable-next-line no-console
    console.warn(`[Web Vitals] ${name} needs attention: ${metric.value.toFixed(2)}`);
  }
}

function sendToAnalytics(metric: Metric, name: string) {
  const payload = JSON.stringify({
    name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    attribution: metric.attribution,
  });

  const blob = new Blob([payload], { type: "application/json" });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/vitals", blob);
  } else {
    fetch("/api/analytics/vitals", {
      body: blob,
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }

  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "web_vitals", {
      metric_name: name,
      value: metric.value,
      metric_rating: metric.rating,
    });
  }
}

export function WebVitals() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    if (process.env.NEXT_PUBLIC_DISABLE_WEB_VITALS === "true") return;

    const sampleRate =
      Number(process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE) || 1;
    if (Math.random() > sampleRate) return;

    try {
      // Collect all Core Web Vitals
      onLCP((metric) => {
        logMetric(metric, "LCP");
        sendToAnalytics(metric, "LCP");
      });

      onINP((metric) => {
        logMetric(metric, "INP");
        sendToAnalytics(metric, "INP");
      });

      onCLS((metric) => {
        logMetric(metric, "CLS");
        sendToAnalytics(metric, "CLS");
      });

      onTTFB((metric) => {
        logMetric(metric, "TTFB");
        sendToAnalytics(metric, "TTFB");
      });

      onFCP((metric) => {
        logMetric(metric, "FCP");
        sendToAnalytics(metric, "FCP");
      });

      // eslint-disable-next-line no-console
      console.log("[Web Vitals] Monitoring initialized");
    } catch (error) {
      // Fail silently - web vitals should never break the app
      // eslint-disable-next-line no-console
      console.error("[Web Vitals] Failed to initialize:", error);
    }
  }, []);

  // This component renders nothing - it's purely for side effects
  return null;
}
