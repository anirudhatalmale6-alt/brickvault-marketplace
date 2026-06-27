import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  return ok({ user, profile });
}
