export type BrickLinkSetDetails = {
  set_number: string; name: string; year_released: number; piece_count: number;
  theme: string; category: string; image_url: string | null;
};
export type BrickLinkMarketPrices = {
  set_number: string; condition: "new" | "used"; currency: string;
  unit_amount_avg: number; unit_amount_min: number; unit_amount_max: number; total_count: number;
};
export type BrickLinkSoldListing = {
  set_number: string; price: number; currency: string; condition: "new" | "used"; quantity: number; date: string;
};
export type FairValue = {
  set_number: string; condition: "new_sealed" | "new_open" | "used_complete" | "used_incomplete" | "parts_lot";
  suggested_price: number; low_range: number; high_range: number; currency: string;
  data_points: number; last_updated: string;
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rand(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000; const r = x - Math.floor(x);
  return Math.floor(min + r * (max - min));
}

const POPULAR_SETS: Record<string, { name: string; year: number; pieces: number; theme: string; base: number }> = {
  "75192": { name: "Millennium Falcon UCS", year: 2017, pieces: 7541, theme: "Star Wars", base: 14000 },
  "10297": { name: "Boutique Hotel", year: 2021, pieces: 3066, theme: "Icons", base: 4500 },
  "10307": { name: "Eiffel Tower", year: 2022, pieces: 10001, theme: "Icons", base: 11000 },
  "21313": { name: "Ship in a Bottle", year: 2018, pieces: 962, theme: "Ideas", base: 1200 },
};

function generateMockSet(setNumber: string) {
  const known = POPULAR_SETS[setNumber];
  if (known) return { set_number: setNumber, name: known.name, year_released: known.year, piece_count: known.pieces, theme: known.theme, category: "Sets", image_url: null, basePrice: known.base };
  const seed = hashString(setNumber);
  const year = rand(seed, 1995, 2025); const pieces = rand(seed + 1, 50, 3000);
  const themes = ["City", "Star Wars", "Technic", "Creator", "Marvel", "Harry Potter"];
  const theme = themes[seed % themes.length];
  const basePrice = Math.round((pieces * rand(seed + 2, 8, 25)) / 10) * 10;
  return { set_number: setNumber, name: `LEGO Set ${setNumber}`, year_released: year, piece_count: pieces, theme, category: "Sets", image_url: null, basePrice };
}

export async function fetchSetDetails(setNumber: string): Promise<BrickLinkSetDetails> {
  const mock = generateMockSet(setNumber);
  return { set_number: mock.set_number, name: mock.name, year_released: mock.year_released, piece_count: mock.piece_count, theme: mock.theme, category: mock.category, image_url: mock.image_url };
}

export async function fetchMarketPrices(setNumber: string, condition: "new" | "used" = "new"): Promise<BrickLinkMarketPrices> {
  const mock = generateMockSet(setNumber);
  const seed = hashString(setNumber + condition);
  const mult = condition === "new" ? 1.0 : 0.65;
  const avg = Math.round(mock.basePrice * mult); const spread = Math.round(avg * 0.25);
  return { set_number: setNumber, condition, currency: "ZAR", unit_amount_avg: avg, unit_amount_min: Math.max(100, avg - spread), unit_amount_max: avg + spread, total_count: rand(seed, 5, 120) };
}

export async function fetchRecentlySold(setNumber: string, limit = 10): Promise<BrickLinkSoldListing[]> {
  const mock = generateMockSet(setNumber); const listings: BrickLinkSoldListing[] = []; const now = Date.now();
  for (let i = 0; i < limit; i++) {
    const seed = hashString(`${setNumber}-${i}`);
    const condition: "new" | "used" = i % 3 === 0 ? "used" : "new";
    const mult = condition === "new" ? 1.0 : 0.65;
    const variance = 1 + rand(seed, -15, 15) / 100;
    const price = Math.round(mock.basePrice * mult * variance);
    const daysAgo = rand(seed + 1, 1, 365);
    listings.push({ set_number: setNumber, price, currency: "ZAR", condition, quantity: 1, date: new Date(now - daysAgo * 86400000).toISOString() });
  }
  return listings.sort((a, b) => b.date.localeCompare(a.date));
}

export async function calculateFairValue(setNumber: string, condition: "new_sealed" | "new_open" | "used_complete" | "used_incomplete" | "parts_lot"): Promise<FairValue> {
  const [newPrices, usedPrices] = await Promise.all([fetchMarketPrices(setNumber, "new"), fetchMarketPrices(setNumber, "used")]);
  const conditionMultipliers: Record<FairValue["condition"], { base: "new" | "used"; factor: number }> = {
    new_sealed: { base: "new", factor: 1.0 }, new_open: { base: "new", factor: 0.85 },
    used_complete: { base: "used", factor: 1.0 }, used_incomplete: { base: "used", factor: 0.55 },
    parts_lot: { base: "used", factor: 0.3 },
  };
  const cfg = conditionMultipliers[condition];
  const source = cfg.base === "new" ? newPrices : usedPrices;
  const suggested = Math.round(source.unit_amount_avg * cfg.factor);
  const low = Math.round(source.unit_amount_min * cfg.factor);
  const high = Math.round(source.unit_amount_max * cfg.factor);
  return { set_number: setNumber, condition, suggested_price: suggested, low_range: low, high_range: high, currency: "ZAR", data_points: source.total_count, last_updated: new Date().toISOString() };
}
