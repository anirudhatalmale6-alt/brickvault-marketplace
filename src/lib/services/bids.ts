import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBidNotification, sendAuctionWonMessage, sendBidAcceptedMessage } from "./whatsapp";

export type Bid = {
  id: string; listing_id: string; bidder_id: string; amount: number;
  status: "active" | "outbid" | "winning" | "accepted" | "rejected" | "withdrawn";
  is_auto_accept: boolean; created_at: string;
  profiles?: { full_name: string } | null;
};

export type AuctionInfo = {
  listing_id: string; current_bid: number | null; bid_count: number;
  highest_bidder_id: string | null; highest_bidder_name: string | null;
  reserve_met: boolean; ends_at: string | null; seconds_remaining: number;
  minimum_next_bid: number; is_ended: boolean;
};

export async function placeBid(sb: SupabaseClient, listingId: string, amount: number): Promise<{ data: Bid | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  const { data: listing } = await sb.from("listings").select("*").eq("id", listingId).single();
  if (!listing) return { data: null, error: "Listing not found" };
  if (listing.seller_id === user.id) return { data: null, error: "Cannot bid on own listing" };
  if (listing.listing_type !== "auction" && listing.listing_type !== "buy_now_auction") return { data: null, error: "Bidding not enabled" };
  if (listing.status !== "active") return { data: null, error: "Listing not active" };
  if (listing.auction_end_at && new Date(listing.auction_end_at) < new Date()) return { data: null, error: "Auction has ended" };
  const { data: highest } = await sb.from("bids").select("amount").eq("listing_id", listingId).in("status", ["active", "winning"]).order("amount", { ascending: false }).limit(1).maybeSingle();
  const currentBid = highest?.amount ?? listing.minimum_bid ?? 0;
  const increment = listing.bid_increment ?? 10;
  const minNext = currentBid + increment;
  if (amount < minNext) return { data: null, error: `Bid must be at least ${minNext}` };
  await sb.from("bids").update({ status: "outbid" }).eq("listing_id", listingId).in("status", ["active", "winning"]);
  const isAutoAccept = !!(listing.auto_accept_price && amount >= listing.auto_accept_price);
  const initialStatus = isAutoAccept ? "accepted" : "winning";
  const { data: bid, error } = await sb.from("bids").insert({
    listing_id: listingId, bidder_id: user.id, amount, status: initialStatus, is_auto_accept: isAutoAccept,
  }).select().single();
  if (error || !bid) return { data: null, error: error?.message ?? "Bid failed" };
  await sb.from("bid_events").insert({ bid_id: bid.id, event_type: "bid_placed", actor_id: user.id, metadata: { amount, auto_accept: isAutoAccept } });
  if (isAutoAccept) {
    await sb.from("listings").update({ status: "sold" }).eq("id", listingId);
    sendAuctionWonMessage(sb, bid.id).catch(() => {});
  } else {
    sendBidNotification(sb, bid.id).catch(() => {});
  }
  return { data: bid as Bid, error: null };
}

export async function getBidsForListing(sb: SupabaseClient, listingId: string): Promise<Bid[]> {
  const { data } = await sb.from("bids").select("*, profiles(full_name)").eq("listing_id", listingId).order("created_at", { ascending: false });
  return (data as Bid[]) ?? [];
}

export async function getBidHistory(sb: SupabaseClient, listingId: string): Promise<Array<{ amount: number; time: string }>> {
  const { data } = await sb.from("bids").select("amount, created_at").eq("listing_id", listingId).order("created_at", { ascending: false });
  return (data ?? []).map((b: any) => ({ amount: b.amount, time: b.created_at }));
}

export async function getHighestBid(sb: SupabaseClient, listingId: string): Promise<Bid | null> {
  const { data } = await sb.from("bids").select("*").eq("listing_id", listingId).in("status", ["active", "winning"]).order("amount", { ascending: false }).limit(1).maybeSingle();
  return (data as Bid) ?? null;
}

export async function getAuctionInfo(sb: SupabaseClient, listingId: string): Promise<AuctionInfo | null> {
  const { data: listing } = await sb.from("listings").select("minimum_bid, bid_increment, auction_end_at, reserve_price").eq("id", listingId).single();
  if (!listing) return null;
  const highest = await getHighestBid(sb, listingId);
  const { count } = await sb.from("bids").select("*", { count: "exact", head: true }).eq("listing_id", listingId);
  const currentBid = highest?.amount ?? null;
  const base = listing.minimum_bid ?? 0;
  const minimumNext = currentBid != null ? currentBid + (listing.bid_increment ?? 10) : base;
  const endsAt = listing.auction_end_at;
  const isEnded = endsAt ? new Date(endsAt) < new Date() : false;
  const secondsRemaining = endsAt ? Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000)) : 0;
  const reserveMet = listing.reserve_price == null ? true : (currentBid ?? 0) >= listing.reserve_price;
  return {
    listing_id: listingId, current_bid: currentBid, bid_count: count ?? 0,
    highest_bidder_id: highest?.bidder_id ?? null,
    highest_bidder_name: (highest as any)?.profiles?.full_name ?? null,
    reserve_met: reserveMet, ends_at: endsAt, seconds_remaining: secondsRemaining,
    minimum_next_bid: minimumNext, is_ended: isEnded,
  };
}

export async function acceptBid(sb: SupabaseClient, bidId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: bid } = await sb.from("bids").select("*, listings!inner(seller_id)").eq("id", bidId).single();
  if (!bid) return { error: "Bid not found" };
  if ((bid as any).listings.seller_id !== user.id) return { error: "Not authorized" };
  await sb.from("bids").update({ status: "accepted" }).eq("id", bidId);
  await sb.from("bids").update({ status: "outbid" }).eq("listing_id", (bid as any).listing_id).neq("id", bidId);
  await sb.from("listings").update({ status: "sold" }).eq("id", (bid as any).listing_id);
  await sb.from("bid_events").insert({ bid_id: bidId, event_type: "accepted", actor_id: user.id, metadata: {} });
  sendBidAcceptedMessage(sb, bidId).catch(() => {});
  return { error: null };
}

export async function rejectBid(sb: SupabaseClient, bidId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: bid } = await sb.from("bids").select("*, listings!inner(seller_id)").eq("id", bidId).single();
  if (!bid) return { error: "Bid not found" };
  if ((bid as any).listings.seller_id !== user.id) return { error: "Not authorized" };
  await sb.from("bids").update({ status: "rejected" }).eq("id", bidId);
  await sb.from("bid_events").insert({ bid_id: bidId, event_type: "rejected", actor_id: user.id, metadata: {} });
  return { error: null };
}

export async function counterBid(sb: SupabaseClient, bidId: string, counterAmount: number): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: bid } = await sb.from("bids").select("*, listings!inner(seller_id)").eq("id", bidId).single();
  if (!bid) return { error: "Bid not found" };
  if ((bid as any).listings.seller_id !== user.id) return { error: "Not authorized" };
  await sb.from("bids").update({ status: "rejected" }).eq("id", bidId);
  await sb.from("bids").insert({
    listing_id: (bid as any).listing_id, bidder_id: (bid as any).bidder_id,
    amount: counterAmount, status: "active", is_auto_accept: false,
  });
  return { error: null };
}

export async function getSellerBids(sb: SupabaseClient, status?: Bid["status"]): Promise<Bid[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  let query = sb.from("bids").select("*, listings!inner(seller_id, title), profiles(full_name)").eq("listings.seller_id", user.id).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;
  return (data as Bid[]) ?? [];
}

export async function getBuyerBids(sb: SupabaseClient): Promise<Bid[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("bids").select("*, listings!inner(title, status), profiles(full_name)").eq("bidder_id", user.id).order("created_at", { ascending: false });
  return (data as Bid[]) ?? [];
}
