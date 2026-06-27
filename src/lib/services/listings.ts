import type { SupabaseClient } from "@supabase/supabase-js";
import type { Listing } from "@/types";

export type ListingFilters = {
  category_id?: string; theme_id?: string; condition?: Listing["condition"];
  listing_type?: Listing["listing_type"]; min_price?: number; max_price?: number;
  location?: string; search?: string; set_number?: string; year_from?: number; year_to?: number;
};
export type ListingSort = "newest" | "price_asc" | "price_desc" | "popular" | "investment";
export type ListingInput = {
  title: string; description: string; category_id: string; theme_id?: string;
  set_number?: string; piece_count?: number; year_released?: number;
  condition: Listing["condition"]; price: number; currency?: string; location: string;
  images?: string[]; status?: Listing["status"]; listing_type: Listing["listing_type"];
  minimum_bid?: number; bid_increment?: number; auction_end_at?: string;
  reserve_price?: number; auto_accept_price?: number; whatsapp_notifications?: boolean;
};

export async function createListing(sb: SupabaseClient, input: ListingInput): Promise<{ data: Listing | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  const { data, error } = await sb.from("listings").insert({ ...input, seller_id: user.id, currency: input.currency ?? "ZAR" }).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Listing, error: null };
}

export async function updateListing(sb: SupabaseClient, id: string, input: Partial<ListingInput>): Promise<{ data: Listing | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  const { data: existing } = await sb.from("listings").select("seller_id").eq("id", id).single();
  if (!existing || existing.seller_id !== user.id) return { data: null, error: "Not authorized" };
  const { data, error } = await sb.from("listings").update(input).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Listing, error: null };
}

export async function deleteListing(sb: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: existing } = await sb.from("listings").select("seller_id").eq("id", id).single();
  if (!existing || existing.seller_id !== user.id) return { error: "Not authorized" };
  const { error } = await sb.from("listings").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function getListingById(sb: SupabaseClient, id: string) {
  const { data, error } = await sb.from("listings").select("*, profiles(full_name, avatar_url)").eq("id", id).single();
  if (error || !data) return null;
  return data as Listing & { profiles?: { full_name: string; avatar_url: string | null } };
}

export async function incrementListingViews(sb: SupabaseClient, id: string): Promise<void> {
  await sb.rpc("increment_views", { listing_id: id }).catch(() => {});
}

export async function listListings(sb: SupabaseClient, filters: ListingFilters = {}, sort: ListingSort = "newest", page = 1, pageSize = 24): Promise<{ data: Listing[]; count: number }> {
  let query = sb.from("listings").select("*", { count: "exact" }).eq("status", "active");
  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.theme_id) query = query.eq("theme_id", filters.theme_id);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.listing_type) query = query.eq("listing_type", filters.listing_type);
  if (filters.min_price != null) query = query.gte("price", filters.min_price);
  if (filters.max_price != null) query = query.lte("price", filters.max_price);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.set_number) query = query.eq("set_number", filters.set_number);
  if (filters.year_from != null) query = query.gte("year_released", filters.year_from);
  if (filters.year_to != null) query = query.lte("year_released", filters.year_to);
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  switch (sort) {
    case "price_asc": query = query.order("price", { ascending: true }); break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "popular": query = query.order("views", { ascending: false }); break;
    case "investment": query = query.order("investment_score", { ascending: false, nullsLast: true }); break;
    default: query = query.order("created_at", { ascending: false });
  }
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);
  const { data, error, count } = await query;
  if (error) return { data: [], count: 0 };
  return { data: (data as Listing[]) ?? [], count: count ?? 0 };
}

export async function getListingsBySeller(sb: SupabaseClient, sellerId: string): Promise<Listing[]> {
  const { data } = await sb.from("listings").select("*").eq("seller_id", sellerId).order("created_at", { ascending: false });
  return (data as Listing[]) ?? [];
}

export async function getMyListings(sb: SupabaseClient): Promise<Listing[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  return getListingsBySeller(sb, user.id);
}

export async function uploadListingImages(sb: SupabaseClient, listingId: string, files: File[]): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i]; const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${listingId}/${Date.now()}-${i}.${ext}`;
    const { error: upErr } = await sb.storage.from("listings").upload(path, file, { upsert: false });
    if (upErr) return { urls, error: upErr.message };
    const { data: urlData } = sb.storage.from("listings").getPublicUrl(path);
    urls.push(urlData.publicUrl);
  }
  const { error } = await sb.from("listings").update({ images: urls }).eq("id", listingId);
  return { urls, error: error?.message ?? null };
}

export async function getFeaturedListings(sb: SupabaseClient, limit = 8): Promise<Listing[]> {
  const { data } = await sb.from("listings").select("*").eq("status", "active").order("investment_score", { ascending: false, nullsLast: true }).limit(limit);
  return (data as Listing[]) ?? [];
}

export async function getCategories(sb: SupabaseClient) {
  const { data } = await sb.from("categories").select("*").order("name");
  return data ?? [];
}

export async function getThemes(sb: SupabaseClient) {
  const { data } = await sb.from("lego_themes").select("*").order("name");
  return data ?? [];
}
