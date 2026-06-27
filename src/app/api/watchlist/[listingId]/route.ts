import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { error } = await sb.from("watchlist").delete().eq("user_id", user.id).eq("listing_id", listingId);
  if (error) return serverError(error.message);
  return ok({ removed: true });
}
