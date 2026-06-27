import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok } from "@/app/api/_helpers/response";
import { getBidHistory } from "@/lib/services/bids";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const sb = await createClient();
  return ok(await getBidHistory(sb, listingId));
}
