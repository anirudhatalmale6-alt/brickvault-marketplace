import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, fail, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { listListings, createListing, type ListingFilters, type ListingSort } from "@/lib/services/listings";

const listingSchema = z.object({
  title: z.string().min(3).max(200), description: z.string().max(5000).optional().default(""),
  category_id: z.string().uuid(), theme_id: z.string().uuid().optional(),
  set_number: z.string().max(20).optional(), piece_count: z.number().int().positive().optional(),
  year_released: z.number().int().min(1950).max(2100).optional(),
  condition: z.enum(["new_sealed", "new_open", "used_complete", "used_incomplete", "parts_lot"]),
  price: z.number().positive(), currency: z.string().default("ZAR"), location: z.string().min(2),
  images: z.array(z.string().url()).optional(),
  status: z.enum(["draft", "pending", "active"]).optional().default("pending"),
  listing_type: z.enum(["fixed", "offers", "auction", "buy_now_auction"]),
  minimum_bid: z.number().positive().optional(), bid_increment: z.number().positive().optional(),
  auction_end_at: z.string().datetime().optional(), reserve_price: z.number().positive().optional(),
  auto_accept_price: z.number().positive().optional(), whatsapp_notifications: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const sb = await createClient();
  const { searchParams } = new URL(req.url);
  const filters: ListingFilters = {
    category_id: searchParams.get("category_id") ?? undefined,
    theme_id: searchParams.get("theme_id") ?? undefined,
    condition: searchParams.get("condition") as ListingFilters["condition"],
    listing_type: searchParams.get("listing_type") as ListingFilters["listing_type"],
    min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    location: searchParams.get("location") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    set_number: searchParams.get("set_number") ?? undefined,
    year_from: searchParams.get("year_from") ? Number(searchParams.get("year_from")) : undefined,
    year_to: searchParams.get("year_to") ? Number(searchParams.get("year_to")) : undefined,
  };
  const sort = (searchParams.get("sort") as ListingSort) ?? "newest";
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 24);
  const result = await listListings(sb, filters, sort, page, pageSize);
  return ok({ ...result, page, pageSize });
}

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, listingSchema);
  if ("error" in parsed) return parsed.error;
  if ((parsed.data.listing_type === "auction" || parsed.data.listing_type === "buy_now_auction") && (!parsed.data.minimum_bid || !parsed.data.auction_end_at)) {
    return fail("Auction listings require minimum_bid and auction_end_at");
  }
  const result = await createListing(sb, parsed.data);
  if (result.error) return serverError(result.error);
  return created(result.data);
}
