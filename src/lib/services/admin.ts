import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminStats = {
  total_users: number; total_sellers: number; total_listings: number;
  active_listings: number; pending_listings: number; total_orders: number;
  total_revenue: number; open_reports: number; active_auctions: number;
};

async function requireAdmin(sb: SupabaseClient): Promise<string | null> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user.id;
}

async function logAction(sb: SupabaseClient, adminId: string, action: string, targetType: string, targetId: string, details: Record<string, unknown> = {}): Promise<void> {
  await sb.from("admin_actions").insert({ admin_id: adminId, action, target_type: targetType, target_id: targetId, details });
}

export async function getAdminStats(sb: SupabaseClient): Promise<AdminStats | null> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return null;
  const [users, sellers, listings, active, pending, orders, revenue, reports, auctions] = await Promise.all([
    sb.from("profiles").select("*", { count: "exact", head: true }),
    sb.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller"),
    sb.from("listings").select("*", { count: "exact", head: true }),
    sb.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    sb.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("orders").select("*", { count: "exact", head: true }),
    sb.from("orders").select("total").in("status", ["paid", "shipped", "delivered"]),
    sb.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("listings").select("*", { count: "exact", head: true }).in("listing_type", ["auction", "buy_now_auction"]).eq("status", "active"),
  ]);
  const totalRevenue = (revenue.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  return {
    total_users: users.count ?? 0, total_sellers: sellers.count ?? 0, total_listings: listings.count ?? 0,
    active_listings: active.count ?? 0, pending_listings: pending.count ?? 0, total_orders: orders.count ?? 0,
    total_revenue: totalRevenue, open_reports: reports.count ?? 0, active_auctions: auctions.count ?? 0,
  };
}

export async function getAllUsers(sb: SupabaseClient, page = 1, pageSize = 50) {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { data: [], count: 0 };
  const from = (page - 1) * pageSize;
  const { data, count } = await sb.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, from + pageSize - 1);
  return { data: data ?? [], count: count ?? 0 };
}

export async function updateUserRole(sb: SupabaseClient, userId: string, role: "buyer" | "seller" | "admin"): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
  if (!error) await logAction(sb, adminId, "update_role", "user", userId, { role });
  return { error: error?.message ?? null };
}

export async function suspendUser(sb: SupabaseClient, userId: string): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("profiles").update({ role: "suspended" as any }).eq("id", userId);
  if (!error) await logAction(sb, adminId, "suspend", "user", userId);
  return { error: error?.message ?? null };
}

export async function getAllListings(sb: SupabaseClient, status?: string, page = 1, pageSize = 50) {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { data: [], count: 0 };
  let query = sb.from("listings").select("*, profiles(full_name)", { count: "exact" });
  if (status) query = query.eq("status", status);
  const from = (page - 1) * pageSize;
  const { data, count } = await query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);
  return { data: data ?? [], count: count ?? 0 };
}

export async function approveListing(sb: SupabaseClient, listingId: string): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("listings").update({ status: "active" }).eq("id", listingId);
  if (!error) await logAction(sb, adminId, "approve", "listing", listingId);
  return { error: error?.message ?? null };
}

export async function rejectListing(sb: SupabaseClient, listingId: string, reason?: string): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("listings").update({ status: "removed" }).eq("id", listingId);
  if (!error) await logAction(sb, adminId, "reject", "listing", listingId, { reason });
  return { error: error?.message ?? null };
}

export async function removeListing(sb: SupabaseClient, listingId: string, reason: string): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("listings").update({ status: "removed" }).eq("id", listingId);
  if (!error) await logAction(sb, adminId, "remove", "listing", listingId, { reason });
  return { error: error?.message ?? null };
}

export async function suspendBidding(sb: SupabaseClient, listingId: string, reason: string): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("listings").update({ listing_type: "fixed", auction_end_at: null }).eq("id", listingId);
  if (!error) await logAction(sb, adminId, "suspend_bidding", "listing", listingId, { reason });
  return { error: error?.message ?? null };
}

export async function getAllCategories(sb: SupabaseClient) {
  const adminId = await requireAdmin(sb);
  if (!adminId) return [];
  const { data } = await sb.from("categories").select("*").order("name");
  return data ?? [];
}

export async function createCategory(sb: SupabaseClient, input: { name: string; slug: string; parent_id?: string; icon?: string }): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { data, error } = await sb.from("categories").insert(input).select().single();
  if (!error) await logAction(sb, adminId, "create", "category", data.id);
  return { error: error?.message ?? null };
}

export async function updateCategory(sb: SupabaseClient, id: string, updates: { name?: string; slug?: string; icon?: string }): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("categories").update(updates).eq("id", id);
  if (!error) await logAction(sb, adminId, "update", "category", id, updates);
  return { error: error?.message ?? null };
}

export async function deleteCategory(sb: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (!error) await logAction(sb, adminId, "delete", "category", id);
  return { error: error?.message ?? null };
}

export async function getReports(sb: SupabaseClient, status?: string) {
  const adminId = await requireAdmin(sb);
  if (!adminId) return [];
  let query = sb.from("reports").select("*, profiles(full_name)");
  if (status) query = query.eq("status", status);
  const { data } = await query.order("created_at", { ascending: false });
  return data ?? [];
}

export async function resolveReport(sb: SupabaseClient, reportId: string, resolution: string): Promise<{ error: string | null }> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return { error: "Not authorized" };
  const { error } = await sb.from("reports").update({ status: "resolved" }).eq("id", reportId);
  if (!error) await logAction(sb, adminId, "resolve", "report", reportId, { resolution });
  return { error: error?.message ?? null };
}

export async function getAllBids(sb: SupabaseClient, status?: string) {
  const adminId = await requireAdmin(sb);
  if (!adminId) return [];
  let query = sb.from("bids").select("*, listings(title), profiles(full_name)");
  if (status) query = query.eq("status", status);
  const { data } = await query.order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminActions(sb: SupabaseClient, limit = 100) {
  const adminId = await requireAdmin(sb);
  if (!adminId) return [];
  const { data } = await sb.from("admin_actions").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function getRevenueByDay(sb: SupabaseClient, days = 30): Promise<Array<{ date: string; revenue: number; orders: number }>> {
  const adminId = await requireAdmin(sb);
  if (!adminId) return [];
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await sb.from("orders").select("total, created_at").in("status", ["paid", "shipped", "delivered"]).gte("created_at", since.toISOString());
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of data ?? []) {
    const day = o.created_at.slice(0, 10);
    const existing = byDay.get(day) ?? { revenue: 0, orders: 0 };
    existing.revenue += Number(o.total); existing.orders += 1;
    byDay.set(day, existing);
  }
  return Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date));
}
