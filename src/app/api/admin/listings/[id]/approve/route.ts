import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { approveListing } from "@/lib/services/admin";
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") return unauthorized("Admin access required");
  const result = await approveListing(sb, id);
  if (result.error) return serverError(result.error);
  return ok({ approved: true });
}
