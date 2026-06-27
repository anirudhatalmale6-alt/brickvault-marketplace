import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getMyCollection, addToCollection } from "@/lib/services/collection";
const addSchema = z.object({
  set_number: z.string().max(20).optional(), name: z.string().min(1).max(200),
  purchase_price: z.number().nonnegative().optional(), current_estimated_value: z.number().nonnegative().optional(),
  condition: z.string().max(50).optional(), quantity: z.number().int().positive().default(1),
  purchase_date: z.string().date().optional(), notes: z.string().max(1000).optional(),
});
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getMyCollection(sb));
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, addSchema);
  if ("error" in parsed) return parsed.error;
  const result = await addToCollection(sb, parsed.data as any);
  if (result.error) return serverError(result.error);
  return created(result.data);
}
