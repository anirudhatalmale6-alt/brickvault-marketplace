import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { suspendBidding } from "@/lib/services/admin";
const schema = z.object({ reason: z.string().min(3).max(500) });
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") return unauthorized("Admin access required");
  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const result = await suspendBidding(sb, id, parsed.data.reason);
  if (result.error) return serverError(result.error);
  return ok({ suspended: true });
}
