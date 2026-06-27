import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
import { getWhatsAppNotificationLogs } from "@/lib/services/whatsapp";
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") return unauthorized("Admin access required");
  return ok(await getWhatsAppNotificationLogs(sb, 200));
}
