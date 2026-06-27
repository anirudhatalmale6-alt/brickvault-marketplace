import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, serverError } from "@/app/api/_helpers/response";
import { estimatePrice, type EstimateInput } from "@/lib/ai/estimator";
const schema = z.object({
  set_number: z.string().max(20).optional(),
  condition: z.enum(["new_sealed", "new_open", "used_complete", "used_incomplete", "parts_lot"]),
  completeness: z.enum(["complete", "incomplete", "unknown"]).optional(),
  sealed: z.boolean().optional(), piece_count: z.number().int().positive().optional(),
  year_released: z.number().int().min(1950).max(2100).optional(),
  has_box: z.boolean().optional(), has_instructions: z.boolean().optional(),
});
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid JSON", 400, "INVALID_JSON"); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "), 400);
  try { return ok(await estimatePrice(parsed.data as EstimateInput)); }
  catch { return serverError("Price estimation failed"); }
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const body = { set_number: searchParams.get("set_number") ?? undefined, condition: searchParams.get("condition") ?? "used_complete", piece_count: searchParams.get("piece_count") ? Number(searchParams.get("piece_count")) : undefined };
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid query parameters", 400);
  try { return ok(await estimatePrice(parsed.data as EstimateInput)); }
  catch { return serverError("Price estimation failed"); }
}
