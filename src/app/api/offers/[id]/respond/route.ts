import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
const respondSchema = z.object({ accept: z.boolean() });
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, respondSchema);
  if ("error" in parsed) return parsed.error;
  const { data: offer } = await sb.from("offers").select("*").eq("id", id).single();
  if (!offer) return notFound("Offer not found");
  if (offer.buyer_id !== user.id) return forbidden("Only the buyer can respond to a counter");
  if (offer.status !== "countered") return serverError("Offer is not in countered state");
  if (offer.counter_amount == null) return serverError("No counter amount present");
  if (parsed.data.accept) {
    await sb.from("offers").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", id);
    await sb.from("listings").update({ status: "sold" }).eq("id", offer.listing_id);
    await sb.from("orders").insert({ buyer_id: offer.buyer_id, seller_id: offer.seller_id, total: offer.counter_amount, status: "pending" });
    return ok({ accepted: true, amount: offer.counter_amount });
  }
  await sb.from("offers").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", id);
  return ok({ rejected: true });
}
