import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { upgradeToSeller } from "@/lib/services/auth";
export async function POST() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const result = await upgradeToSeller(sb);
  if (!result.success) return serverError(result.error);
  return ok({ upgraded: true });
}
