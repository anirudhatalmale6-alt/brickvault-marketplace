import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getSellerWhatsAppSettings, updateSellerWhatsAppSettings } from "@/lib/services/whatsapp";
const settingsSchema = z.object({
  notify_new_bid: z.boolean().optional(), notify_bid_accepted: z.boolean().optional(),
  notify_auction_ending: z.boolean().optional(), notify_messages: z.boolean().optional(),
  auto_reply_enabled: z.boolean().optional(), auto_reply_message: z.string().max(500).optional().nullable(),
});
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getSellerWhatsAppSettings(sb));
}
export async function PATCH(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, settingsSchema);
  if ("error" in parsed) return parsed.error;
  const result = await updateSellerWhatsAppSettings(sb, parsed.data);
  if (result.error) return serverError(result.error);
  return ok({ updated: true });
}
