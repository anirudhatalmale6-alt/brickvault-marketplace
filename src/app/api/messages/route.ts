import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getMyConversations, getOrCreateConversation, sendMessage } from "@/lib/services/messages";
const startSchema = z.object({ seller_id: z.string().uuid(), listing_id: z.string().uuid().optional(), content: z.string().min(1).max(2000).optional() });
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getMyConversations(sb));
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, startSchema);
  if ("error" in parsed) return parsed.error;
  const convResult = await getOrCreateConversation(sb, parsed.data.seller_id, parsed.data.listing_id);
  if (convResult.error || !convResult.data) return serverError(convResult.error ?? "Failed");
  if (parsed.data.content) await sendMessage(sb, convResult.data.id, parsed.data.content);
  return created(convResult.data);
}
