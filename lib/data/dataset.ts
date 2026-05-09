import type { DataRow, WeeklyRow } from "./types";
import { PLATFORMS, ZONES } from "./types";

// Seeded PRNG — deterministic, no randomness on every render
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42); // fixed seed → same data every run

// Demand curve by hour — mimics real food delivery patterns
// Peak: 12-14 (lunch), 19-22 (dinner), slight morning 8-10
const HOURLY_DEMAND_MULTIPLIER: Record<number, number> = {
  0: 0.08, 1: 0.05, 2: 0.03, 3: 0.02, 4: 0.02, 5: 0.04,
  6: 0.12, 7: 0.22, 8: 0.40, 9: 0.50, 10: 0.55, 11: 0.75,
  12: 1.00, 13: 0.95, 14: 0.70, 15: 0.50, 16: 0.48, 17: 0.60,
  18: 0.78, 19: 1.00, 20: 0.98, 21: 0.85, 22: 0.60, 23: 0.30,
};

// Platform-specific base demand skew
const PLATFORM_BASE: Record<string, number> = {
  swft:   85,
  grubgo: 75,
  dropd:  60,
  rushly: 70,
};

// Platform-specific base PPD
const PLATFORM_BASE_PPD: Record<string, number> = {
  swft:   32,
  grubgo: 29,
  dropd:  26,
  rushly: 31,
};

function getWeatherWeight(rand: () => number, hour: number): DataRow["weather"] {
  const r = rand();
  // More rain in evenings
  if (hour >= 17 && hour <= 21) {
    if (r < 0.12) return "heavy_rain";
    if (r < 0.28) return "rain";
  } else {
    if (r < 0.04) return "heavy_rain";
    if (r < 0.14) return "rain";
  }
  return "clear";
}

function getWeatherDemandBoost(weather: DataRow["weather"]): number {
  if (weather === "heavy_rain") return 1.35;
  if (weather === "rain") return 1.18;
  return 1.0;
}

function getWeatherSupplyPenalty(weather: DataRow["weather"]): number {
  if (weather === "heavy_rain") return 0.60;
  if (weather === "rain") return 0.80;
  return 1.0;
}

export function generateDataset(rowCount = 10000): DataRow[] {
  const rows: DataRow[] = [];
  const baseTime = new Date("2024-01-01T00:00:00").getTime();

  for (let i = 0; i < rowCount; i++) {
    const platform = PLATFORMS[i % PLATFORMS.length];
    const zone = ZONES[Math.floor(rand() * ZONES.length)];

    // Spread across 90 days
    const dayOffset = Math.floor(rand() * 90);
    const hour = Math.floor(rand() * 24);
    const dayOfWeek = (dayOffset + 0) % 7; // 0=Mon
    const isWeekend = dayOfWeek >= 5;
    const timestamp = baseTime + dayOffset * 86400000 + hour * 3600000;

    const hourMult = HOURLY_DEMAND_MULTIPLIER[hour];
    const weekendMult = isWeekend ? 1.45 : 1.0;
    const weather = getWeatherWeight(rand, hour);
    const weatherDemandBoost = getWeatherDemandBoost(weather);
    const weatherSupplyPenalty = getWeatherSupplyPenalty(weather);

    const eventBoost = rand() < 0.06; // 6% chance of local event
    const eventMult = eventBoost ? 1.0 + rand() * 0.5 : 1.0;

    const baseDemand = PLATFORM_BASE[platform.id];
    const demand = Math.round(
      baseDemand * hourMult * weekendMult * weatherDemandBoost * eventMult *
      (0.85 + rand() * 0.3)
    );

    const baseSupply = Math.round(demand * (0.6 + rand() * 0.7));
    const supply = Math.max(1, Math.round(baseSupply * weatherSupplyPenalty));

    const shortage = Math.max(0, demand - supply);
    const fulfillmentRate = Math.min(1, supply / Math.max(1, demand));

    const basePPD = PLATFORM_BASE_PPD[platform.id] * (0.9 + rand() * 0.2);
    const surgeMult =
      shortage > 0
        ? Math.round((1 + (shortage / Math.max(1, demand)) * 0.9) * 100) / 100
        : 1.0;
    const ppd = Math.round(basePPD * surgeMult * 10) / 10;

    rows.push({
      timestamp,
      hour,
      dayOfWeek,
      platformId: platform.id,
      zone,
      demand,
      supply,
      basePPD: Math.round(basePPD * 10) / 10,
      surgeMult,
      ppd,
      shortage,
      fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
      weather,
      eventBoost,
    });
  }

  return rows;
}

// Singleton — generate once, reuse
let _dataset: DataRow[] | null = null;
export function getDataset(): DataRow[] {
  if (!_dataset) _dataset = generateDataset(10000);
  return _dataset;
}

// Get rows matching current hour + day
export function getRelevantRows(hour: number, dayOfWeek: number): DataRow[] {
  return getDataset().filter(
    (r) => r.hour === hour && r.dayOfWeek === dayOfWeek
  );
}

// Aggregate per platform for a given slice
export function aggregateByPlatform(rows: DataRow[]) {
  const map: Record<string, DataRow[]> = {};
  for (const r of rows) {
    if (!map[r.platformId]) map[r.platformId] = [];
    map[r.platformId].push(r);
  }
  return Object.entries(map).map(([platformId, rows]) => {
    const avg = (fn: (r: DataRow) => number) =>
      rows.reduce((s, r) => s + fn(r), 0) / rows.length;
    return {
      platformId,
      demand: Math.round(avg((r) => r.demand)),
      supply: Math.round(avg((r) => r.supply)),
      ppd: Math.round(avg((r) => r.ppd) * 10) / 10,
      surgeMult: Math.round(avg((r) => r.surgeMult) * 100) / 100,
      shortage: Math.round(avg((r) => r.shortage)),
      fulfillmentRate: Math.round(avg((r) => r.fulfillmentRate) * 100) / 100,
    };
  });
}

// Weekly PPD averages per platform
export function getWeeklyAverages(): WeeklyRow[] {
  const dataset = getDataset();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, dayIndex) => {
    const dayRows = dataset.filter((r) => r.dayOfWeek === dayIndex);
    const entry: WeeklyRow = { day };
    for (const p of PLATFORMS) {
      const pRows = dayRows.filter((r) => r.platformId === p.id);
      if (pRows.length === 0) { entry[p.id] = 0; continue; }
      const avg = pRows.reduce((s, r) => s + r.ppd, 0) / pRows.length;
      entry[p.id] = Math.round(avg * 10) / 10;
    }
    return entry;
  });
}

// Hourly demand curve for charts
export function getHourlyDemand(platformId: string) {
  const dataset = getDataset();
  return Array.from({ length: 24 }, (_, hour) => {
    const rows = dataset.filter(
      (r) => r.platformId === platformId && r.hour === hour
    );
    const avg = rows.length
      ? rows.reduce((s, r) => s + r.demand, 0) / rows.length
      : 0;
    return { hour: `${hour}:00`, demand: Math.round(avg) };
  });
}
