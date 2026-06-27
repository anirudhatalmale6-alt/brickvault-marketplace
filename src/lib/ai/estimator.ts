import { fetchSetDetails, fetchRecentlySold, calculateFairValue } from "@/lib/bricklink";

export type EstimateInput = {
  set_number?: string; condition: "new_sealed" | "new_open" | "used_complete" | "used_incomplete" | "parts_lot";
  completeness?: "complete" | "incomplete" | "unknown"; sealed?: boolean;
  piece_count?: number; year_released?: number; has_box?: boolean; has_instructions?: boolean;
};

export type PriceEstimate = {
  suggested_price: number; low_range: number; high_range: number; currency: string;
  confidence_score: number; investment_score: number; explanation: string[];
  market_data: { bricklink_avg: number | null; bricklink_min: number | null; bricklink_max: number | null; recent_sold_avg: number | null; recent_sold_count: number; data_points: number };
  set_info: { name: string | null; theme: string | null; year_released: number | null; piece_count: number | null };
  generated_at: string;
};

function computeConfidence(input: EstimateInput, dataPoints: number): number {
  let score = 0;
  if (dataPoints >= 30) score += 30; else if (dataPoints >= 10) score += 20; else if (dataPoints >= 3) score += 10;
  if (input.set_number) score += 20;
  if (input.piece_count) score += 10;
  if (input.year_released) score += 5;
  if (input.has_box) score += 5;
  if (input.has_instructions) score += 5;
  if (input.completeness && input.completeness !== "unknown") score += 10;
  if (input.condition === "new_sealed" || input.condition === "used_complete") score += 10;
  return Math.min(100, score);
}

function computeInvestmentScore(yearReleased: number | null, theme: string | null, dataPoints: number, recentAvg: number | null, bricklinkAvg: number | null): number {
  let score = 50;
  if (yearReleased) {
    const age = new Date().getFullYear() - yearReleased;
    if (age >= 15) score += 20; else if (age >= 10) score += 15; else if (age >= 5) score += 10; else if (age >= 2) score += 5; else score -= 10;
  }
  const hotThemes = ["star wars", "icons", "ideas", "harry potter", "lord of the rings"];
  if (theme && hotThemes.includes(theme.toLowerCase())) score += 10;
  if (recentAvg != null && bricklinkAvg != null && bricklinkAvg > 0) {
    const trend = (recentAvg - bricklinkAvg) / bricklinkAvg;
    if (trend > 0.1) score += 15; else if (trend > 0) score += 5; else if (trend < -0.1) score -= 10;
  }
  if (dataPoints >= 20) score += 5;
  return Math.max(0, Math.min(100, score));
}

function buildExplanation(input: EstimateInput, estimate: Awaited<ReturnType<typeof calculateFairValue>>, recentAvg: number | null, confidence: number, investment: number): string[] {
  const lines: string[] = [];
  lines.push(`Based on ${estimate.data_points} comparable listings, estimated fair value in ${input.condition.replace(/_/g, " ")} condition is R ${estimate.suggested_price.toLocaleString()}.`);
  if (input.condition === "new_sealed") lines.push("Sealed sets typically command a premium due to collector demand.");
  else if (input.condition === "parts_lot") lines.push("Parts lots are valued primarily by weight and piece count.");
  if (recentAvg != null && estimate.suggested_price > 0) {
    const diffPct = ((recentAvg - estimate.suggested_price) / estimate.suggested_price) * 100;
    if (Math.abs(diffPct) > 10) lines.push(`Recent sold prices (${diffPct > 0 ? "above" : "below"} market by ${Math.abs(diffPct).toFixed(0)}%) suggest ${diffPct > 0 ? "strong demand" : "a softening market"}.`);
  }
  if (confidence >= 75) lines.push("High confidence: strong data and clear condition.");
  else if (confidence >= 50) lines.push("Moderate confidence: limited comparable sales data.");
  else lines.push("Low confidence: very few comparable sales. Treat as a rough guide only.");
  if (investment >= 70) lines.push("Strong investment potential based on age, theme, and price trend.");
  else if (investment <= 30) lines.push("Limited investment potential.");
  return lines;
}

export async function estimatePrice(input: EstimateInput): Promise<PriceEstimate> {
  if (!input.set_number) {
    const base = (input.piece_count ?? 200) * (input.condition === "new_sealed" ? 15 : 8);
    return {
      suggested_price: Math.round(base), low_range: Math.round(base * 0.75), high_range: Math.round(base * 1.25), currency: "ZAR",
      confidence_score: 25, investment_score: 40,
      explanation: ["No set number provided - estimate is based on piece count alone.", "Add the set number for a much more accurate valuation."],
      market_data: { bricklink_avg: null, bricklink_min: null, bricklink_max: null, recent_sold_avg: null, recent_sold_count: 0, data_points: 0 },
      set_info: { name: null, theme: null, year_released: null, piece_count: input.piece_count ?? null },
      generated_at: new Date().toISOString(),
    };
  }
  const [setDetails, fairValue, recentSold] = await Promise.all([
    fetchSetDetails(input.set_number), calculateFairValue(input.set_number, input.condition), fetchRecentlySold(input.set_number, 20),
  ]);
  const recentAvg = recentSold.length > 0 ? Math.round(recentSold.reduce((s, r) => s + r.price, 0) / recentSold.length) : null;
  const confidence = computeConfidence(input, fairValue.data_points);
  const investment = computeInvestmentScore(setDetails.year_released, setDetails.theme, fairValue.data_points, recentAvg, fairValue.suggested_price);
  let suggested = fairValue.suggested_price;
  if (recentAvg != null && fairValue.data_points >= 3) suggested = Math.round(fairValue.suggested_price * 0.7 + recentAvg * 0.3);
  const explanation = buildExplanation(input, fairValue, recentAvg, confidence, investment);
  return {
    suggested_price: suggested, low_range: fairValue.low_range, high_range: fairValue.high_range, currency: "ZAR",
    confidence_score: confidence, investment_score: investment, explanation,
    market_data: { bricklink_avg: fairValue.suggested_price, bricklink_min: fairValue.low_range, bricklink_max: fairValue.high_range, recent_sold_avg: recentAvg, recent_sold_count: recentSold.length, data_points: fairValue.data_points },
    set_info: { name: setDetails.name, theme: setDetails.theme, year_released: setDetails.year_released, piece_count: setDetails.piece_count },
    generated_at: new Date().toISOString(),
  };
}
