import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getMessages, sendMessage } from "@/lib/services/messages";
const sendSchema = z.object({ content: z.string().min(1).max(2000) });
export async function GET(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  return ok(await getMessages(sb, conversationId));
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, sendSchema);
  if ("error" in parsed) return parsed.error;
  const result = await sendMessage(sb, conversationId, parsed.data.content);
  if (result.error) return serverError(result.error);
  return created(result.data);
}
