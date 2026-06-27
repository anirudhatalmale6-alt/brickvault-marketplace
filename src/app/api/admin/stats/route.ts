import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
import { getAdminStats } from "@/lib/services/admin";
export async function GET() {
  const sb = await createClient();
  const stats = await getAdminStats(sb);
  if (!stats) return unauthorized("Admin access required");
  return ok(stats);
}
