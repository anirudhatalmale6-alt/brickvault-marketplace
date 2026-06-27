import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/types";

export async function createOrder(sb: SupabaseClient, input: { cartItemIds: string[]; shippingAddress: Record<string, string> }): Promise<{ data: Order | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  const { data: cartItems } = await sb.from("cart_items").select("*, listings(id, price, seller_id, status)").in("id", input.cartItemIds).eq("user_id", user.id);
  if (!cartItems?.length) return { data: null, error: "No valid cart items" };
  const active = cartItems.filter((i: any) => i.listings?.status === "active");
  if (!active.length) return { data: null, error: "No active listings in cart" };
  const total = active.reduce((s: number, i: any) => s + Number(i.listings?.price ?? 0) * i.quantity, 0);
  const sellerId = (active[0] as any).listings?.seller_id;
  const { data: order, error } = await sb.from("orders").insert({ buyer_id: user.id, seller_id: sellerId, total, status: "pending", shipping_address: input.shippingAddress }).select().single();
  if (error || !order) return { data: null, error: error?.message ?? "Order failed" };
  await sb.from("order_items").insert(active.map((i: any) => ({ order_id: order.id, listing_id: i.listing_id, quantity: i.quantity, price: i.listings?.price ?? 0 })));
  await sb.from("cart_items").delete().in("id", input.cartItemIds);
  return { data: order as Order, error: null };
}

export async function getMyPurchases(sb: SupabaseClient): Promise<Order[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("orders").select("*, order_items(*, listings(title, images))").eq("buyer_id", user.id).order("created_at", { ascending: false });
  return (data as Order[]) ?? [];
}

export async function getMySales(sb: SupabaseClient): Promise<Order[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("orders").select("*, order_items(*, listings(title, images))").eq("seller_id", user.id).order("created_at", { ascending: false });
  return (data as Order[]) ?? [];
}

export async function getOrderById(sb: SupabaseClient, id: string): Promise<Order | null> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("orders").select("*, order_items(*, listings(title, images))").eq("id", id).single();
  return (data as Order) ?? null;
}

export async function updateOrderStatus(sb: SupabaseClient, id: string, status: Order["status"]): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("orders").update({ status }).eq("id", id);
  return { error: error?.message ?? null };
}

export async function cancelOrder(sb: SupabaseClient, id: string): Promise<{ error: string | null }> {
  return updateOrderStatus(sb, id, "cancelled");
}
