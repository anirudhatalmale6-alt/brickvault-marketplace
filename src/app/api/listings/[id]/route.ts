import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, notFound, unauthorized, forbidden, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getListingById, updateListing, deleteListing } from "@/lib/services/listings";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(), description: z.string().max(5000).optional(),
  category_id: z.string().uuid().optional(), theme_id: z.string().uuid().optional(),
  set_number: z.string().max(20).optional(), piece_count: z.number().int().positive().optional(),
  year_released: z.number().int().min(1950).max(2100).optional(),
  condition: z.enum(["new_sealed", "new_open", "used_complete", "used_incomplete", "parts_lot"]).optional(),
  price: z.number().positive().optional(), location: z.string().min(2).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(["draft", "pending", "active", "sold"]).optional(),
  listing_type: z.enum(["fixed", "offers", "auction", "buy_now_auction"]).optional(),
  minimum_bid: z.number().positive().optional(), bid_increment: z.number().positive().optional(),
  auction_end_at: z.string().datetime().optional(), reserve_price: z.number().positive().optional(),
  auto_accept_price: z.number().positive().optional(), whatsapp_notifications: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const listing = await getListingById(sb, id);
  if (!listing) return notFound("Listing not found");
  return ok(listing);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: existing } = await sb.from("listings").select("seller_id").eq("id", id).single();
  if (!existing) return notFound();
  if (existing.seller_id !== user.id) return forbidden("You can only edit your own listings");
  const parsed = await parseBody(req, updateSchema);
  if ("error" in parsed) return parsed.error;
  const result = await updateListing(sb, id, parsed.data);
  if (result.error) return serverError(result.error);
  return ok(result.data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: existing } = await sb.from("listings").select("seller_id").eq("id", id).single();
  if (!existing) return notFound();
  if (existing.seller_id !== user.id) return forbidden();
  const result = await deleteListing(sb, id);
  if (result.error) return serverError(result.error);
  return ok({ deleted: true });
}
