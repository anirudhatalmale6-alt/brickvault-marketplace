import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { withdrawOffer } from "@/lib/services/offers";
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const result = await withdrawOffer(sb, id);
  if (result.error) return serverError(result.error);
  return ok({ withdrawn: true });
}
