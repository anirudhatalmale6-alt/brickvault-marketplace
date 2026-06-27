import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, notFound, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getOrderById, updateOrderStatus, cancelOrder } from "@/lib/services/orders";
const statusSchema = z.object({ status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "disputed"]) });
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const order = await getOrderById(sb, id);
  if (!order) return notFound();
  return ok(order);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, statusSchema);
  if ("error" in parsed) return parsed.error;
  const result = await updateOrderStatus(sb, id, parsed.data.status);
  if (result.error) return serverError(result.error);
  return ok({ updated: true });
}
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const result = await cancelOrder(sb, id);
  if (result.error) return serverError(result.error);
  return ok({ cancelled: true });
}
