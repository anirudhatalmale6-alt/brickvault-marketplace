import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { Message, Conversation } from "@/types";

export async function getOrCreateConversation(sb: SupabaseClient, sellerId: string, listingId?: string): Promise<{ data: Conversation | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  if (user.id === sellerId) return { data: null, error: "Cannot message yourself" };
  let query = sb.from("conversations").select("*, listings(id, title, images)").eq("buyer_id", user.id).eq("seller_id", sellerId);
  if (listingId) query = query.eq("listing_id", listingId);
  else query = query.is("listing_id", null);
  const { data: existing } = await query.maybeSingle();
  if (existing) return { data: existing as Conversation, error: null };
  const { data, error } = await sb.from("conversations").insert({ buyer_id: user.id, seller_id: sellerId, listing_id: listingId ?? null }).select("*, listings(id, title, images)").single();
  if (error) return { data: null, error: error.message };
  return { data: data as Conversation, error: null };
}

export async function getMyConversations(sb: SupabaseClient) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("conversations").select("*, listings(id, title, images)").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order("created_at", { ascending: false });
  if (!data) return [];
  const enriched = await Promise.all(
    (data as Conversation[]).map(async (c) => {
      const { data: lastMsg } = await sb.from("messages").select("content, created_at, sender_id").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const { count } = await sb.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", c.id).eq("read", false).neq("sender_id", user.id);
      return { ...c, last_message: lastMsg ?? undefined, unread_count: count ?? 0 };
    })
  );
  return enriched;
}

export async function getMessages(sb: SupabaseClient, conversationId: string): Promise<Message[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data: conv } = await sb.from("conversations").select("buyer_id, seller_id").eq("id", conversationId).single();
  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) return [];
  const { data } = await sb.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  return (data as Message[]) ?? [];
}

export async function sendMessage(sb: SupabaseClient, conversationId: string, content: string): Promise<{ data: Message | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  if (!content.trim()) return { data: null, error: "Message cannot be empty" };
  const { data: conv } = await sb.from("conversations").select("buyer_id, seller_id").eq("id", conversationId).single();
  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) return { data: null, error: "Not authorized" };
  const { data, error } = await sb.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, content }).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Message, error: null };
}

export async function markAsRead(sb: SupabaseClient, conversationId: string): Promise<void> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("messages").update({ read: true }).eq("conversation_id", conversationId).neq("sender_id", user.id).eq("read", false);
}

export async function getUnreadCount(sb: SupabaseClient): Promise<number> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return 0;
  const { data: convs } = await sb.from("conversations").select("id").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
  if (!convs?.length) return 0;
  const { count } = await sb.from("messages").select("*", { count: "exact", head: true }).in("conversation_id", convs.map((c) => c.id)).eq("read", false).neq("sender_id", user.id);
  return count ?? 0;
}

export function subscribeToMessages(sb: SupabaseClient, conversationId: string, onMessage: (msg: Message) => void): RealtimeChannel {
  const channel = sb.channel(`messages:${conversationId}`).on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
    (payload) => onMessage(payload.new as Message)
  ).subscribe();
  return channel;
}

export function unsubscribeChannel(sb: SupabaseClient, channel: RealtimeChannel): void {
  sb.removeChannel(channel);
}
