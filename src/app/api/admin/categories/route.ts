import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { getAllCategories, createCategory } from "@/lib/services/admin";
const createSchema = z.object({ name: z.string().min(2).max(100), slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/), parent_id: z.string().uuid().optional(), icon: z.string().max(50).optional() });
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") return unauthorized("Admin access required");
  return ok(await getAllCategories(sb));
}
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") return unauthorized("Admin access required");
  const parsed = await parseBody(req, createSchema);
  if ("error" in parsed) return parsed.error;
  const result = await createCategory(sb, parsed.data);
  if (result.error) return serverError(result.error);
  return created({ created: true });
}
