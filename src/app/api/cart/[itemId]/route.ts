import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { updateCartQuantity, removeFromCart } from "@/lib/services/cart";
const updateSchema = z.object({ quantity: z.number().int().positive() });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, updateSchema);
  if ("error" in parsed) return parsed.error;
  const result = await updateCartQuantity(sb, itemId, parsed.data.quantity);
  if (result.error) return serverError(result.error);
  return ok({ updated: true });
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const result = await removeFromCart(sb, itemId);
  if (result.error) return serverError(result.error);
  return ok({ removed: true });
}
