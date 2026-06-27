import type { SupabaseClient } from "@supabase/supabase-js";

export type WhatsAppMessageType = "new_bid" | "bid_accepted" | "counter_offer" | "auction_ending_soon" | "auction_won" | "general";

export type WhatsAppNotification = {
  id: string; recipient_id: string; recipient_phone: string; message_type: WhatsAppMessageType;
  payload: Record<string, unknown>; status: "pending" | "sent" | "delivered" | "failed";
  provider_message_id: string | null; error_message: string | null; created_at: string;
};

export type SellerWhatsAppSettings = {
  id: string; seller_id: string; phone_number: string | null; verified: boolean;
  notify_new_bid: boolean; notify_bid_accepted: boolean; notify_auction_ending: boolean;
  notify_messages: boolean; auto_reply_enabled: boolean; auto_reply_message: string | null;
};

async function sendViaWhatsApp(to: string, template: string, params: Record<string, unknown>): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log("[WhatsApp Mock]", { to, template, params });
  const success = Math.random() > 0.1;
  if (success) return { success: true, messageId: `mock_${Date.now()}` };
  return { success: false, error: "Mock delivery failure" };
}

async function recordNotification(sb: SupabaseClient, input: {
  recipient_id: string; recipient_phone: string; message_type: WhatsAppMessageType;
  payload: Record<string, unknown>; status: "sent" | "failed";
  provider_message_id?: string; error_message?: string;
}): Promise<void> {
  await sb.from("whatsapp_notifications").insert({
    recipient_id: input.recipient_id, recipient_phone: input.recipient_phone,
    message_type: input.message_type, payload: input.payload, status: input.status,
    provider_message_id: input.provider_message_id ?? null, error_message: input.error_message ?? null,
  });
}

async function getSellerSettings(sb: SupabaseClient, sellerId: string): Promise<SellerWhatsAppSettings | null> {
  const { data } = await sb.from("seller_whatsapp_settings").select("*").eq("seller_id", sellerId).maybeSingle();
  return (data as SellerWhatsAppSettings) ?? null;
}

async function dispatch(sb: SupabaseClient, sellerId: string, messageType: WhatsAppMessageType, payload: Record<string, unknown>, template: string): Promise<void> {
  const settings = await getSellerSettings(sb, sellerId);
  if (!settings?.phone_number || !settings.verified) return;
  const shouldNotify =
    (messageType === "new_bid" && settings.notify_new_bid) ||
    (messageType === "bid_accepted" && settings.notify_bid_accepted) ||
    (messageType === "auction_ending_soon" && settings.notify_auction_ending) ||
    (messageType === "general" && settings.notify_messages) ||
    messageType === "auction_won" || messageType === "counter_offer";
  if (!shouldNotify) return;
  const result = await sendViaWhatsApp(settings.phone_number, template, payload);
  await recordNotification(sb, {
    recipient_id: sellerId, recipient_phone: settings.phone_number, message_type: messageType,
    payload, status: result.success ? "sent" : "failed",
    provider_message_id: result.messageId, error_message: result.error,
  });
}

export async function sendBidNotification(sb: SupabaseClient, bidId: string): Promise<void> {
  const { data: bid } = await sb.from("bids").select("*, listings!inner(id, title, seller_id), profiles(full_name)").eq("id", bidId).single();
  if (!bid) return;
  await dispatch(sb, (bid as any).listings.seller_id, "new_bid", {
    listing_id: (bid as any).listing_id, listing_title: (bid as any).listings.title,
    bidder_name: (bid as any).profiles?.full_name ?? "A buyer", amount: bid.amount, bid_id: bid.id,
    action_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bids`,
  }, "new_bid_template");
}

export async function sendBidAcceptedMessage(sb: SupabaseClient, bidId: string): Promise<void> {
  const { data: bid } = await sb.from("bids").select("*, listings!inner(id, title, seller_id)").eq("id", bidId).single();
  if (!bid) return;
  await dispatch(sb, bid.bidder_id, "bid_accepted", {
    listing_id: (bid as any).listing_id, listing_title: (bid as any).listings.title,
    amount: bid.amount, action_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/purchases`,
  }, "bid_accepted_template");
}

export async function sendCounterOfferMessage(sb: SupabaseClient, bidId: string, counterAmount: number): Promise<void> {
  const { data: bid } = await sb.from("bids").select("*, listings!inner(id, title)").eq("id", bidId).single();
  if (!bid) return;
  await dispatch(sb, bid.bidder_id, "counter_offer", {
    listing_id: (bid as any).listing_id, listing_title: (bid as any).listings.title,
    original_amount: bid.amount, counter_amount: counterAmount,
    action_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bids`,
  }, "counter_offer_template");
}

export async function sendAuctionWonMessage(sb: SupabaseClient, bidId: string): Promise<void> {
  const { data: bid } = await sb.from("bids").select("*, listings!inner(id, title, seller_id)").eq("id", bidId).single();
  if (!bid) return;
  await dispatch(sb, bid.bidder_id, "auction_won", {
    listing_id: (bid as any).listing_id, listing_title: (bid as any).listings.title,
    amount: bid.amount, action_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/purchases`,
  }, "auction_won_template");
}

export async function getWhatsAppNotificationLogs(sb: SupabaseClient, limit = 100): Promise<WhatsAppNotification[]> {
  const { data } = await sb.from("whatsapp_notifications").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data as WhatsAppNotification[]) ?? [];
}

export async function getSellerWhatsAppSettings(sb: SupabaseClient): Promise<SellerWhatsAppSettings | null> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  return getSellerSettings(sb, user.id);
}

export async function updateSellerWhatsAppSettings(sb: SupabaseClient, updates: Partial<Omit<SellerWhatsAppSettings, "id" | "seller_id">>): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("seller_whatsapp_settings").upsert({ ...updates, seller_id: user.id }).eq("seller_id", user.id);
  return { error: error?.message ?? null };
}

export async function verifyWhatsAppPhone(sb: SupabaseClient, phoneNumber: string, code: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (code !== "123456") return { error: "Invalid code" };
  const { error } = await sb.from("seller_whatsapp_settings").update({ phone_number: phoneNumber, verified: true }).eq("seller_id", user.id);
  return { error: error?.message ?? null };
}
