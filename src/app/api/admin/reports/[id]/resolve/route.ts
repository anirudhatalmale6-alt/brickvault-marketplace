import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { resolveReport } from "@/lib/services/admin";
const schema = z.object({ resolution: z.string().min(3).max(1000) });
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") return unauthorized("Admin access required");
  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const result = await resolveReport(sb, id, parsed.data.resolution);
  if (result.error) return serverError(result.error);
  return ok({ resolved: true });
}
