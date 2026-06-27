import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
import { getUnreadCount } from "@/lib/services/messages";
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok({ count: await getUnreadCount(sb) });
}
