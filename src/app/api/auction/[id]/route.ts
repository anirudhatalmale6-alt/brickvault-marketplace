import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, notFound } from "@/app/api/_helpers/response";
import { getAuctionInfo } from "@/lib/services/bids";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const info = await getAuctionInfo(sb, id);
  if (!info) return notFound("Auction not found");
  return ok(info);
}
