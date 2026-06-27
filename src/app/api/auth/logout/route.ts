import { createClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/app/api/_helpers/response";
export async function POST() {
  const sb = await createClient();
  const { error } = await sb.auth.signOut();
  if (error) return serverError(error.message);
  return ok({ loggedOut: true });
}
