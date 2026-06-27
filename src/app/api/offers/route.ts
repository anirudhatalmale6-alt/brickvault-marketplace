import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { makeOffer, getMySentOffers } from "@/lib/services/offers";
const makeSchema = z.object({ listing_id: z.string().uuid(), amount: z.number().positive(), message: z.string().max(500).optional() });
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getMySentOffers(sb));
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, makeSchema);
  if ("error" in parsed) return parsed.error;
  const result = await makeOffer(sb, parsed.data.listing_id, parsed.data.amount, parsed.data.message);
  if (result.error) return serverError(result.error);
  return created(result.data);
}
