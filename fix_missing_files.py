#!/usr/bin/env python3
"""
Run this AFTER generate_brickvault_all.py AND generate_brickvault_patch.py
Adds the 9 files that neither script generates but the project needs to build.
"""
from pathlib import Path
PROJECT_ROOT = Path("brickvault-marketplace")

def write_file(rel_path: str, content: str) -> None:
    path = PROJECT_ROOT / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    if content.startswith("\n"):
        content = content[1:]
    path.write_text(content, encoding="utf-8")
    print(f"  ok {rel_path}")

print("Adding missing files...")

# 1. src/lib/utils.ts
write_file("src/lib/utils.ts", """
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string, format: "default" | "time" = "default"): string {
  const date = new Date(dateString);
  if (format === "time") {
    return date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
""")

# 2. src/types/index.ts
write_file("src/types/index.ts", """
export type Profile = {
  id: string; email: string; full_name: string | null; phone: string | null;
  avatar_url: string | null; role: "buyer" | "seller" | "admin"; created_at: string;
};

export type Listing = {
  id: string; seller_id: string; title: string; description: string;
  category_id: string; theme_id: string | null; set_number: string | null;
  piece_count: number | null; year_released: number | null;
  condition: "new_sealed" | "new_open" | "used_complete" | "used_incomplete" | "parts_lot";
  price: number; currency: string; location: string; images: string[] | null;
  status: "draft" | "pending" | "active" | "sold" | "removed";
  listing_type: "fixed" | "offers" | "auction" | "buy_now_auction";
  minimum_bid: number | null; bid_increment: number | null; auction_end_at: string | null;
  reserve_price: number | null; auto_accept_price: number | null;
  investment_score: number | null; views: number; whatsapp_notifications: boolean;
  created_at: string; updated_at: string;
};

export type Order = {
  id: string; buyer_id: string; seller_id: string; total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "disputed";
  shipping_address: Record<string, string> | null; created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string; order_id: string; listing_id: string; quantity: number; price: number;
  listings?: Partial<Listing>;
};

export type CartItem = {
  id: string; user_id: string; listing_id: string; quantity: number; created_at: string;
  listings?: Partial<Listing>;
};

export type Offer = {
  id: string; listing_id: string; buyer_id: string; seller_id: string;
  amount: number; counter_amount: number | null;
  status: "pending" | "accepted" | "rejected" | "countered" | "withdrawn";
  message: string | null; created_at: string; updated_at: string;
  listings?: Partial<Listing>; profiles?: Partial<Profile>;
};

export type Message = {
  id: string; conversation_id: string; sender_id: string; content: string;
  read: boolean; created_at: string;
};

export type Conversation = {
  id: string; buyer_id: string; seller_id: string; listing_id: string | null;
  created_at: string; listings?: Partial<Listing> | null;
  last_message?: Partial<Message>; unread_count?: number;
};
""")

# 3. src/lib/supabase/client.ts
write_file("src/lib/supabase/client.ts", """
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
""")

# 4. src/lib/supabase/server.ts
write_file("src/lib/supabase/server.ts", """
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
""")

# 5. src/lib/services/auth.ts
write_file("src/lib/services/auth.ts", """
import type { SupabaseClient } from "@supabase/supabase-js";

export async function upgradeToSeller(sb: SupabaseClient): Promise<{ success: boolean; error: string }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  const { error } = await sb.from("profiles").update({ role: "seller" }).eq("id", user.id);
  if (error) return { success: false, error: error.message };
  await sb.from("seller_whatsapp_settings").upsert({ seller_id: user.id }, { onConflict: "seller_id" });
  return { success: true, error: "" };
}

export async function getProfile(sb: SupabaseClient) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("*").eq("id", user.id).single();
  return data;
}
""")

# 6. src/lib/services/cart.ts
write_file("src/lib/services/cart.ts", """
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/types";

export async function getCart(sb: SupabaseClient): Promise<CartItem[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("cart_items")
    .select("*, listings(id, title, price, images, status, condition, seller_id, currency)")
    .eq("user_id", user.id).order("created_at", { ascending: false });
  return (data as CartItem[]) ?? [];
}

export async function addToCart(sb: SupabaseClient, listingId: string, quantity = 1): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: listing } = await sb.from("listings").select("id, status, seller_id").eq("id", listingId).single();
  if (!listing) return { error: "Listing not found" };
  if (listing.status !== "active") return { error: "Listing not available" };
  if (listing.seller_id === user.id) return { error: "Cannot add own listing to cart" };
  const { data: existing } = await sb.from("cart_items").select("id, quantity").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle();
  if (existing) {
    const { error } = await sb.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
    return { error: error?.message ?? null };
  }
  const { error } = await sb.from("cart_items").insert({ user_id: user.id, listing_id: listingId, quantity });
  return { error: error?.message ?? null };
}

export async function updateCartQuantity(sb: SupabaseClient, itemId: string, quantity: number): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (quantity < 1) return removeFromCart(sb, itemId);
  const { error } = await sb.from("cart_items").update({ quantity }).eq("id", itemId).eq("user_id", user.id);
  return { error: error?.message ?? null };
}

export async function removeFromCart(sb: SupabaseClient, itemId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("cart_items").delete().eq("id", itemId).eq("user_id", user.id);
  return { error: error?.message ?? null };
}

export async function clearCart(sb: SupabaseClient): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("cart_items").delete().eq("user_id", user.id);
  return { error: error?.message ?? null };
}
""")

# 7. src/lib/services/orders.ts
write_file("src/lib/services/orders.ts", """
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
""")

# 8. src/app/globals.css
write_file("src/app/globals.css", """
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-inter: "Inter", system-ui, sans-serif;
}

* { box-sizing: border-box; }
body { font-family: var(--font-inter); }
""")

# 9. src/app/layout.tsx
write_file("src/app/layout.tsx", """
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BrickVault - LEGO Marketplace", template: "%s | BrickVault" },
  description: "Buy, sell and invest in LEGO with AI-powered price estimates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
""")

print("\nAll 9 missing files written successfully!")
print("\nFull run order:")
print("  1. python generate_brickvault_all.py")
print("  2. python generate_brickvault_patch.py")
print("  3. python fix_missing_files.py")
print("  4. cd brickvault-marketplace")
print("  5. npm install && npm install -D @eslint/eslintrc")
print("  6. cp .env.local.example .env.local  # add Supabase creds")
print("  7. npm run build")
