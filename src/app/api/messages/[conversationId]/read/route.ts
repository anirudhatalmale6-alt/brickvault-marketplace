import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/app/api/_helpers/response";
import { markAsRead } from "@/lib/services/messages";
export async function POST(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  await markAsRead(sb, conversationId);
  return ok({ marked: true });
}
