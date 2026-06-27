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
