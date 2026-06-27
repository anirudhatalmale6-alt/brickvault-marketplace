import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
import { getWhatsAppNotificationLogs } from "@/lib/services/whatsapp";
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getWhatsAppNotificationLogs(sb));
}
