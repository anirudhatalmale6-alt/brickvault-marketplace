import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getWantedList, addToWantedList } from "@/lib/services/collection";
const addSchema = z.object({ set_number: z.string().max(20).optional(), name: z.string().max(200).optional(), max_price: z.number().positive().optional(), condition_preference: z.string().max(50).optional(), notify_on_match: z.boolean().default(true) });
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getWantedList(sb));
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, addSchema);
  if ("error" in parsed) return parsed.error;
  const result = await addToWantedList(sb, parsed.data);
  if (result.error) return serverError(result.error);
  return created({ added: true });
}
