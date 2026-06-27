import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { savePortfolioSnapshot } from "@/lib/services/collection";
export async function POST() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const result = await savePortfolioSnapshot(sb);
  if (result.error) return serverError(result.error);
  return created({ saved: true });
}
