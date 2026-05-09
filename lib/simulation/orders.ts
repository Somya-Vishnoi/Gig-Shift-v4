import { ZONES } from "../data/types";

export type TierName = "basic" | "standard" | "surge";

export interface PricingTier {
  name: TierName;
  label: string;
  minRiders: number;
  maxRiders: number;
  minNoticeMinutes: number; // minimum lead time
  basePPD: number;
  color: string;
  description: string;
}

export const TIERS: PricingTier[] = [
  {
    name: "basic",
    label: "Basic",
    minRiders: 1,
    maxRiders: 10,
    minNoticeMinutes: 120,
    basePPD: 35,
    color: "#00C896",
    description: "1–10 riders · 2hr+ notice",
  },
  {
    name: "standard",
    label: "Standard",
    minRiders: 11,
    maxRiders: 50,
    minNoticeMinutes: 60,
    basePPD: 42,
    color: "#6C5CE7",
    description: "11–50 riders · 1hr+ notice",
  },
  {
    name: "surge",
    label: "Surge",
    minRiders: 51,
    maxRiders: 200,
    minNoticeMinutes: 0,
    basePPD: 55,
    color: "#FF4D1C",
    description: "51+ riders or instant · Premium rate",
  },
];

export interface OrderRequest {
  id: string;
  zone: string;
  ridersRequested: number;
  timeWindow: string; // e.g. "7:00 PM"
  noticeMinutes: number;
  placedAt: Date;
  tier: TierName;
  quotedPPD: number;
  totalQuote: number;
  status: "pending" | "fulfilling" | "fulfilled" | "partial";
  ridersConfirmed: number;
}

// Dynamic multipliers — same logic as dataset
function getHourMultiplier(hour: number): number {
  const curve: Record<number, number> = {
    0: 0.8, 1: 0.7, 2: 0.7, 3: 0.7, 4: 0.8, 5: 0.9,
    6: 1.0, 7: 1.1, 8: 1.2, 9: 1.1, 10: 1.0, 11: 1.1,
    12: 1.4, 13: 1.3, 14: 1.1, 15: 1.0, 16: 1.0, 17: 1.1,
    18: 1.2, 19: 1.5, 20: 1.45, 21: 1.3, 22: 1.1, 23: 0.9,
  };
  return curve[hour] ?? 1.0;
}

function getZoneMultiplier(zone: string): number {
  // High-demand zones cost more
  const hot: Record<string, number> = {
    "Koramangala": 1.15,
    "Indiranagar": 1.12,
    "MG Road": 1.18,
    "Whitefield": 1.08,
    "Electronic City": 1.05,
    "HSR Layout": 1.10,
    "BTM Layout": 1.06,
    "Jayanagar": 1.04,
    "Marathahalli": 1.07,
    "JP Nagar": 1.03,
  };
  return hot[zone] ?? 1.0;
}

function getNoticeMultiplier(noticeMinutes: number): number {
  if (noticeMinutes < 15) return 1.6;
  if (noticeMinutes < 30) return 1.4;
  if (noticeMinutes < 60) return 1.2;
  if (noticeMinutes < 120) return 1.1;
  return 1.0;
}

export function getTierForRequest(
  riderCount: number,
  noticeMinutes: number
): PricingTier {
  // Surge if instant or large
  if (noticeMinutes < 30 || riderCount > 50) return TIERS[2];
  if (riderCount > 10) return TIERS[1];
  return TIERS[0];
}

export interface PriceQuote {
  tier: PricingTier;
  basePPD: number;
  finalPPD: number;
  totalCost: number;
  multipliers: {
    hour: number;
    zone: number;
    notice: number;
  };
}

export function computeQuote(
  riderCount: number,
  zone: string,
  noticeMinutes: number,
  hour?: number
): PriceQuote {
  const currentHour = hour ?? new Date().getHours();
  const tier = getTierForRequest(riderCount, noticeMinutes);

  const mHour = getHourMultiplier(currentHour);
  const mZone = getZoneMultiplier(zone);
  const mNotice = getNoticeMultiplier(noticeMinutes);

  const combined = mHour * mZone * mNotice;
  const finalPPD = Math.round(tier.basePPD * combined * 10) / 10;
  const totalCost = Math.round(finalPPD * riderCount);

  return {
    tier,
    basePPD: tier.basePPD,
    finalPPD,
    totalCost,
    multipliers: { hour: mHour, zone: mZone, notice: mNotice },
  };
}

// Simulate fulfillment — how fast riders confirm based on tier + zone
export function getFulfillmentRatePerTick(
  tier: TierName,
  riderCount: number
): number {
  // riders confirmed per 2s tick
  const base = tier === "surge" ? 4 : tier === "standard" ? 3 : 2;
  return Math.max(1, Math.round(base * (1 + Math.random() * 0.5)));
}

export function generateOrderId(): string {
  return "GS-" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export const TIME_WINDOWS = [
  "Now (Instant)", "In 30 min", "In 1 hour", "In 2 hours",
  "Tonight 7 PM", "Tonight 8 PM", "Tomorrow 12 PM", "Tomorrow 7 PM",
];

export function timeWindowToNoticeMinutes(tw: string): number {
  const map: Record<string, number> = {
    "Now (Instant)": 0,
    "In 30 min": 30,
    "In 1 hour": 60,
    "In 2 hours": 120,
    "Tonight 7 PM": 90,
    "Tonight 8 PM": 120,
    "Tomorrow 12 PM": 720,
    "Tomorrow 7 PM": 1140,
  };
  return map[tw] ?? 60;
}
