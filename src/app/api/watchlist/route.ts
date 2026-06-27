import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
const addSchema = z.object({ listing_id: z.string().uuid() });
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data } = await sb.from("watchlist").select("*, listings(id, title, price, images, status, seller_id)").eq("user_id", user.id).order("created_at", { ascending: false });
  return ok(data ?? []);
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, addSchema);
  if ("error" in parsed) return parsed.error;
  const { error } = await sb.from("watchlist").upsert({ user_id: user.id, listing_id: parsed.data.listing_id }, { onConflict: "user_id,listing_id" });
  if (error) return serverError(error.message);
  return created({ saved: true });
}
