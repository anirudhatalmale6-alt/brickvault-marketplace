import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { updateUserRole, suspendUser } from "@/lib/services/admin";
const roleSchema = z.object({ role: z.enum(["buyer", "seller", "admin"]) });
async function checkAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { sb, ok: false };
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
  return { sb, ok: profile?.role === "admin" };
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await checkAdmin();
  if (!auth.ok) return unauthorized("Admin access required");
  const parsed = await parseBody(req, roleSchema);
  if ("error" in parsed) return parsed.error;
  const result = await updateUserRole(auth.sb, id, parsed.data.role);
  if (result.error) return serverError(result.error);
  return ok({ updated: true });
}
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await checkAdmin();
  if (!auth.ok) return unauthorized("Admin access required");
  const result = await suspendUser(auth.sb, id);
  if (result.error) return serverError(result.error);
  return ok({ suspended: true });
}
