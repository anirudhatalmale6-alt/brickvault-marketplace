import type { SupabaseClient } from "@supabase/supabase-js";

export type CollectionItem = {
  id: string; user_id: string; set_number: string | null; name: string;
  purchase_price: number | null; current_estimated_value: number | null;
  condition: string | null; quantity: number; purchase_date: string | null;
  notes: string | null; created_at: string;
};

export type PortfolioSnapshot = {
  id: string; user_id: string; total_value: number; total_cost: number;
  gain_loss: number; snapshot_date: string; created_at: string;
};

export type PortfolioSummary = {
  total_value: number; total_cost: number; gain_loss: number; gain_loss_pct: number;
  item_count: number; theme_breakdown: Array<{ theme: string; value: number; count: number }>;
  top_performers: CollectionItem[];
};

export async function addToCollection(sb: SupabaseClient, input: Omit<CollectionItem, "id" | "user_id" | "created_at">): Promise<{ data: CollectionItem | null; error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };
  const { data, error } = await sb.from("collection_items").insert({ ...input, user_id: user.id }).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as CollectionItem, error: null };
}

export async function updateCollectionItem(sb: SupabaseClient, id: string, updates: Partial<CollectionItem>): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("collection_items").update(updates).eq("id", id).eq("user_id", user.id);
  return { error: error?.message ?? null };
}

export async function removeFromCollection(sb: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("collection_items").delete().eq("id", id).eq("user_id", user.id);
  return { error: error?.message ?? null };
}

export async function getMyCollection(sb: SupabaseClient): Promise<CollectionItem[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("collection_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return (data as CollectionItem[]) ?? [];
}

export async function getPortfolioSummary(sb: SupabaseClient): Promise<PortfolioSummary> {
  const items = await getMyCollection(sb);
  const totalValue = items.reduce((sum, i) => sum + (Number(i.current_estimated_value ?? 0) * i.quantity), 0);
  const totalCost = items.reduce((sum, i) => sum + (Number(i.purchase_price ?? 0) * i.quantity), 0);
  const gainLoss = totalValue - totalCost;
  const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  const themeMap = new Map<string, { value: number; count: number }>();
  for (const item of items) {
    const theme = item.set_number?.split("-")[0] ?? "Other";
    const existing = themeMap.get(theme) ?? { value: 0, count: 0 };
    existing.value += Number(item.current_estimated_value ?? 0) * item.quantity;
    existing.count += item.quantity;
    themeMap.set(theme, existing);
  }
  const themeBreakdown = Array.from(themeMap.entries()).map(([theme, v]) => ({ theme, value: v.value, count: v.count }));
  const topPerformers = [...items]
    .map((i) => ({ ...i, _gain: (Number(i.current_estimated_value ?? 0) - Number(i.purchase_price ?? 0)) * i.quantity }))
    .sort((a, b) => b._gain - a._gain)
    .slice(0, 5)
    .map(({ _gain: _g, ...rest }) => rest);
  return {
    total_value: totalValue, total_cost: totalCost, gain_loss: gainLoss, gain_loss_pct: gainLossPct,
    item_count: items.reduce((s, i) => s + i.quantity, 0),
    theme_breakdown: themeBreakdown, top_performers: topPerformers,
  };
}

export async function savePortfolioSnapshot(sb: SupabaseClient): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const summary = await getPortfolioSummary(sb);
  const { error } = await sb.from("portfolio_snapshots").insert({
    user_id: user.id, total_value: summary.total_value, total_cost: summary.total_cost,
    gain_loss: summary.gain_loss, snapshot_date: new Date().toISOString().slice(0, 10),
  });
  return { error: error?.message ?? null };
}

export async function getPortfolioHistory(sb: SupabaseClient, days = 30): Promise<PortfolioSnapshot[]> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await sb.from("portfolio_snapshots").select("*").eq("user_id", user.id).gte("snapshot_date", since.toISOString().slice(0, 10)).order("snapshot_date", { ascending: true });
  return (data as PortfolioSnapshot[]) ?? [];
}

export async function addToWantedList(sb: SupabaseClient, input: { set_number?: string; name?: string; max_price?: number; condition_preference?: string; notify_on_match?: boolean }): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("wanted_list").insert({ ...input, user_id: user.id });
  return { error: error?.message ?? null };
}

export async function getWantedList(sb: SupabaseClient) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from("wanted_list").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return data ?? [];
}

export async function removeFromWantedList(sb: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await sb.from("wanted_list").delete().eq("id", id).eq("user_id", user.id);
  return { error: error?.message ?? null };
}
