import { createClient } from "@/lib/supabase/server";
import { ok } from "@/app/api/_helpers/response";
import { getFeaturedListings } from "@/lib/services/listings";
export async function GET() {
  const sb = await createClient();
  const listings = await getFeaturedListings(sb, 8);
  return ok(listings);
}
