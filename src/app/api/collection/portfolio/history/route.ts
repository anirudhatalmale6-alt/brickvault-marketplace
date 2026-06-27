import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
import { getPortfolioHistory } from "@/lib/services/collection";
export async function GET(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
  return ok(await getPortfolioHistory(sb, days));
}
