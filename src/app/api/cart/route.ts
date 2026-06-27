import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getCart, addToCart, clearCart } from "@/lib/services/cart";
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getCart(sb));
}
const addSchema = z.object({ listing_id: z.string().uuid(), quantity: z.number().int().positive().default(1) });
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, addSchema);
  if ("error" in parsed) return parsed.error;
  const result = await addToCart(sb, parsed.data.listing_id, parsed.data.quantity);
  if (result.error) return serverError(result.error);
  return ok({ added: true });
}
export async function DELETE() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const result = await clearCart(sb);
  if (result.error) return serverError(result.error);
  return ok({ cleared: true });
}
