import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { updateCategory, deleteCategory } from "@/lib/services/admin";
const updateSchema = z.object({ name: z.string().min(2).max(100).optional(), slug: z.string().regex(/^[a-z0-9-]+$/).optional(), icon: z.string().max(50).optional() });
async function checkAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { sb, ok: false };
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  return { sb, ok: p?.role === "admin" };
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await checkAdmin();
  if (!auth.ok) return unauthorized("Admin access required");
  const parsed = await parseBody(req, updateSchema);
  if ("error" in parsed) return parsed.error;
  const result = await updateCategory(auth.sb, id, parsed.data);
  if (result.error) return serverError(result.error);
  return ok({ updated: true });
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await checkAdmin();
  if (!auth.ok) return unauthorized("Admin access required");
  const result = await deleteCategory(auth.sb, id);
  if (result.error) return serverError(result.error);
  return ok({ deleted: true });
}
