import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { counterBid } from "@/lib/services/bids";
const counterSchema = z.object({ amount: z.number().positive() });
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, counterSchema);
  if ("error" in parsed) return parsed.error;
  const result = await counterBid(sb, id, parsed.data.amount);
  if (result.error) return serverError(result.error);
  return ok({ countered: true });
}
