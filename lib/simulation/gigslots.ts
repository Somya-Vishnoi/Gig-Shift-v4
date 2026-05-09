import { ZONES, PLATFORMS } from "../data/types";

export interface GigSlot {
  id: string;
  zone: string;
  platformId: string;
  ridersNeeded: number;
  ppd: number;
  surgeActive: boolean;
  surgeMult: number;
  distanceKm: number;
  expiresInMin: number;
  status: "open" | "accepted" | "expired";
}

export interface AdminOrderRow {
  orderId: string;
  platformId: string;
  zone: string;
  requested: number;
  confirmed: number;
  ppd: number;
  tier: string;
  elapsedSec: number;
  sla: "green" | "amber" | "red";
  incentivePPD: number;
}

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function generateGigSlots(tick: number): GigSlot[] {
  const slots: GigSlot[] = [];
  const hour = new Date().getHours();
  const isPeak = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 22);

  ZONES.forEach((zone, zi) => {
    if (sr(tick * 31 + zi * 7) < 0.4) return;
    const platform = PLATFORMS[Math.floor(sr(tick * 13 + zi) * PLATFORMS.length)];
    const needed = Math.floor(sr(tick * 17 + zi) * 12) + 2;
    const basePPD = 32 + Math.floor(sr(tick * 19 + zi) * 20);
    const surgeActive = isPeak && sr(tick * 23 + zi) > 0.5;
    const surgeMult = surgeActive ? Math.round((1.2 + sr(tick * 29 + zi) * 0.6) * 100) / 100 : 1.0;
    const ppd = Math.round(basePPD * surgeMult * 10) / 10;

    slots.push({
      id: `slot-${zone.slice(0, 3).toLowerCase()}-${tick}-${zi}`,
      zone,
      platformId: platform.id,
      ridersNeeded: needed,
      ppd,
      surgeActive,
      surgeMult,
      distanceKm: Math.round((1 + sr(tick * 41 + zi) * 8) * 10) / 10,
      expiresInMin: Math.floor(5 + sr(tick * 43 + zi) * 25),
      status: "open",
    });
  });

  return slots.sort((a, b) => b.ppd - a.ppd);
}

export function generateAdminOrders(tick: number): AdminOrderRow[] {
  const rows: AdminOrderRow[] = [];

  PLATFORMS.forEach((p, pi) => {
    const count = 1 + Math.floor(sr(tick * 7 + pi) * 3);
    for (let i = 0; i < count; i++) {
      const zi = Math.floor(sr(tick * 11 + pi * 5 + i) * ZONES.length);
      const requested = 5 + Math.floor(sr(tick * 13 + pi * 3 + i) * 40);
      const confirmed = Math.min(requested, Math.floor(requested * (0.4 + sr(tick * 17 + pi * 7 + i) * 0.6)));
      const elapsedSec = Math.floor(sr(tick * 19 + pi + i) * 1800);
      const pct = confirmed / requested;
      const sla: "green" | "amber" | "red" = pct >= 0.85 ? "green" : pct >= 0.55 ? "amber" : "red";
      const tier = requested > 50 ? "surge" : requested > 10 ? "standard" : "basic";
      const basePPD = tier === "surge" ? 55 : tier === "standard" ? 42 : 35;
      const ppd = Math.round(basePPD * (1 + sr(tick * 23 + pi + i) * 0.3) * 10) / 10;
      const incentivePPD = Math.round(ppd * 0.72 * 10) / 10;

      rows.push({
        orderId: `GS-${p.id.toUpperCase().slice(0, 3)}-${(tick * 10 + pi * 3 + i).toString(36).toUpperCase().slice(-3)}`,
        platformId: p.id,
        zone: ZONES[zi],
        requested,
        confirmed,
        ppd,
        tier,
        elapsedSec,
        sla,
        incentivePPD,
      });
    }
  });

  return rows.sort((a, b) => (a.sla === "red" ? -1 : b.sla === "red" ? 1 : 0));
}

export interface WorkerActivityRow {
  workerId: string;
  workerName: string;
  zone: string;
  platformId: string;
  status: "idle" | "dispatched" | "delivering" | "returning";
  ppd: number;
  earningsToday: number;
  deliveriesToday: number;
}

const WORKER_NAMES = [
  "Ravi Kumar", "Suresh Mehta", "Amit Patel", "Deepak Rao", "Vijay Singh",
  "Kiran Babu", "Arun Tiwari", "Mohan Lal", "Sanjay Gupta", "Prakash Nair",
  "Mahesh Das", "Rajesh Verma", "Anand Chari", "Sunil Fernandez", "Venkat Hari",
];


export function generateWorkerActivity(tick: number): WorkerActivityRow[] {
  return WORKER_NAMES.map((name, i) => {
    const r1 = sr(tick * 17 + i * 31 + 7);
    const r2 = sr(tick * 23 + i * 47 + 3);
    const platform = PLATFORMS[i % PLATFORMS.length];
    const zone = ZONES[Math.floor(r1 * ZONES.length)];
    const statuses = ["idle", "dispatched", "delivering", "returning"] as const;
    const status = statuses[Math.floor(r2 * statuses.length)];
    const ppd = 30 + Math.round(r1 * 25);
    const deliveries = Math.floor(r2 * 12) + 2;
    return {
      workerId: `w-${i + 1}`,
      workerName: name,
      zone,
      platformId: platform.id,
      status,
      ppd,
      earningsToday: Math.round(ppd * deliveries * (0.8 + r1 * 0.4)),
      deliveriesToday: deliveries,
    };
  });
}

export interface LiveOrderRow {
  id: string;
  platformId: string;
  zone: string;
  ridersRequested: number;
  ridersConfirmed: number;
  quotedPPD: number;
  totalCost: number;
  status: "fulfilling" | "fulfilled" | "at_risk";
  elapsedMinutes: number;
}

export function generateLiveOrders(tick: number): LiveOrderRow[] {
  return PLATFORMS.map((p, i) => {
    const r1 = sr(tick * 7 + i * 13 + 5);
    const r2 = sr(tick * 11 + i * 19 + 9);
    const requested = 10 + Math.floor(r1 * 40);
    const confirmed = Math.min(requested, Math.floor(requested * (0.4 + r2 * 0.7)));
    const elapsed = Math.floor(r1 * 25);
    const fillRate = confirmed / requested;
    const status: LiveOrderRow["status"] =
      confirmed >= requested ? "fulfilled" :
      fillRate < 0.4 && elapsed > 15 ? "at_risk" : "fulfilling";
    const ppd = 35 + Math.round(r1 * 20);
    return {
      id: `GS-${p.id.toUpperCase()}-${(tick % 99) + 1}`,
      platformId: p.id,
      zone: ZONES[i % ZONES.length],
      ridersRequested: requested,
      ridersConfirmed: confirmed,
      quotedPPD: ppd,
      totalCost: ppd * requested,
      status,
      elapsedMinutes: elapsed,
    };
  });
}
