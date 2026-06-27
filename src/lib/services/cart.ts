import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/types";

export async function getCart(sb: SupabaseClient): Promise<CartItem[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from("cart_items")
    .select("*, listings(id, title, price, images, status, condition, seller_id, currency)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as CartItem[]) ?? [];
}

export async function addToCart(
  sb: SupabaseClient,
  listingId: string,
  quantity = 1
): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: listing } = await sb
    .from("listings")
    .select("id, status, seller_id")
    .eq("id", listingId)
    .single();

  if (!listing) return { error: "Listing not found" };
  if (listing.status !== "active") return { error: "Listing not available" };
  if (listing.seller_id === user.id) return { error: "Cannot add own listing to cart" };

  const { data: existing } = await sb
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await sb
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    return { error: error?.message ?? null };
  }

  const { error } = await sb
    .from("cart_items")
    .insert({ user_id: user.id, listing_id: listingId, quantity });
  return { error: error?.message ?? null };
}

export async function updateCartQuantity(
  sb: SupabaseClient,
  itemId: string,
  quantity: number
): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (quantity < 1) return removeFromCart(sb, itemId);
  const { error } = await sb
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)
    .eq("user_id", user.id);
  return { error: error?.message ?? null };
}

export async function removeFromCart(
  sb: SupabaseClient,
  itemId: string
): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);
  return { error: error?.message ?? null };
}

export async function clearCart(sb: SupabaseClient): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("cart_items").delete().eq("user_id", user.id);
  return { error: error?.message ?? null };
}
