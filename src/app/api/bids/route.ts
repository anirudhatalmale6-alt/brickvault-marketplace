import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { placeBid, getBidsForListing } from "@/lib/services/bids";
const placeSchema = z.object({ listing_id: z.string().uuid(), amount: z.number().positive() });
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get("listing_id");
  if (!listingId) return serverError("listing_id required");
  const sb = await createClient();
  return ok(await getBidsForListing(sb, listingId));
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, placeSchema);
  if ("error" in parsed) return parsed.error;
  const result = await placeBid(sb, parsed.data.listing_id, parsed.data.amount);
  if (result.error) return serverError(result.error);
  return created(result.data);
}
