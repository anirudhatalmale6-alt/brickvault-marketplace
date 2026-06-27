import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
import { getSellerBids, getBuyerBids } from "@/lib/services/bids";
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const [sellerBids, buyerBids] = await Promise.all([getSellerBids(sb), getBuyerBids(sb)]);
  return ok({ seller_bids: sellerBids, buyer_bids: buyerBids });
}
