import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { createOrder, getMyPurchases } from "@/lib/services/orders";
const checkoutSchema = z.object({
  cart_item_ids: z.array(z.string().uuid()).min(1),
  shipping_address: z.object({ full_name: z.string().min(2), address_line1: z.string().min(5), address_line2: z.string().optional(), city: z.string().min(2), postal_code: z.string().min(3), country: z.string().min(2), phone: z.string().min(6) }),
});
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getMyPurchases(sb));
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, checkoutSchema);
  if ("error" in parsed) return parsed.error;
  const result = await createOrder(sb, { cartItemIds: parsed.data.cart_item_ids, shippingAddress: parsed.data.shipping_address });
  if (result.error) return serverError(result.error);
  return created(result.data);
}
