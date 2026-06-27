import type { SupabaseClient } from "@supabase/supabase-js";
import type { Offer } from "@/types";

export async function makeOffer(sb: SupabaseClient, listingId: string, amount: number, message?: string): Promise<{ data: Offer | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  const { data: listing } = await sb.from("listings").select("id, seller_id, price, listing_type, status").eq("id", listingId).single();
  if (!listing) return { data: null, error: "Listing not found" };
  if (listing.status !== "active") return { data: null, error: "Listing not available" };
  if (listing.listing_type === "fixed") return { data: null, error: "Offers not accepted" };
  if (listing.seller_id === user.id) return { data: null, error: "Cannot offer on own listing" };
  if (amount <= 0) return { data: null, error: "Invalid amount" };
  const { data: existing } = await sb.from("offers").select("id").eq("listing_id", listingId).eq("buyer_id", user.id).eq("status", "pending").maybeSingle();
  if (existing) return { data: null, error: "You already have a pending offer" };
  const { data, error } = await sb.from("offers").insert({ listing_id: listingId, buyer_id: user.id, seller_id: listing.seller_id, amount, status: "pending", message: message ?? null }).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Offer, error: null };
}

export async function acceptOffer(sb: SupabaseClient, offerId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: offer } = await sb.from("offers").select("*").eq("id", offerId).single();
  if (!offer) return { error: "Offer not found" };
  if (offer.seller_id !== user.id) return { error: "Not authorized" };
  if (offer.status !== "pending") return { error: "Offer no longer pending" };
  const { error } = await sb.from("offers").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", offerId);
  if (error) return { error: error.message };
  await sb.from("listings").update({ status: "sold" }).eq("id", offer.listing_id);
  await sb.from("orders").insert({ buyer_id: offer.buyer_id, seller_id: offer.seller_id, total: offer.amount, status: "pending" });
  return { error: null };
}

export async function rejectOffer(sb: SupabaseClient, offerId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: offer } = await sb.from("offers").select("*").eq("id", offerId).single();
  if (!offer) return { error: "Offer not found" };
  if (offer.seller_id !== user.id) return { error: "Not authorized" };
  const { error } = await sb.from("offers").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", offerId);
  return { error: error?.message ?? null };
}

export async function counterOffer(sb: SupabaseClient, offerId: string, counterAmount: number): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: offer } = await sb.from("offers").select("*").eq("id", offerId).single();
  if (!offer) return { error: "Offer not found" };
  if (offer.seller_id !== user.id) return { error: "Not authorized" };
  if (counterAmount <= 0) return { error: "Invalid amount" };
  const { error } = await sb.from("offers").update({ status: "countered", counter_amount: counterAmount, updated_at: new Date().toISOString() }).eq("id", offerId);
  return { error: error?.message ?? null };
}

export async function withdrawOffer(sb: SupabaseClient, offerId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("offers").update({ status: "withdrawn", updated_at: new Date().toISOString() }).eq("id", offerId).eq("buyer_id", user.id).eq("status", "pending");
  return { error: error?.message ?? null };
}

export async function getMySentOffers(sb: SupabaseClient): Promise<Offer[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("offers").select("*, listings(title, images)").eq("buyer_id", user.id).order("created_at", { ascending: false });
  return (data as Offer[]) ?? [];
}

export async function getMyReceivedOffers(sb: SupabaseClient): Promise<Offer[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("offers").select("*, listings(title, images), profiles(full_name)").eq("seller_id", user.id).order("created_at", { ascending: false });
  return (data as Offer[]) ?? [];
}
