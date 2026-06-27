import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { updateCollectionItem, removeFromCollection } from "@/lib/services/collection";
const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(), purchase_price: z.number().nonnegative().optional(),
  current_estimated_value: z.number().nonnegative().optional(), condition: z.string().max(50).optional(),
  quantity: z.number().int().positive().optional(), purchase_date: z.string().date().optional(),
  notes: z.string().max(1000).optional(),
});
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, updateSchema);
  if ("error" in parsed) return parsed.error;
  const result = await updateCollectionItem(sb, id, parsed.data as any);
  if (result.error) return serverError(result.error);
  return ok({ updated: true });
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const result = await removeFromCollection(sb, id);
  if (result.error) return serverError(result.error);
  return ok({ removed: true });
}
