import { createClient } from "@/lib/supabase/server";
import { ok } from "@/app/api/_helpers/response";
import { getThemes } from "@/lib/services/listings";
export const revalidate = 300;
export async function GET() {
  const sb = await createClient();
  return ok(await getThemes(sb));
}
