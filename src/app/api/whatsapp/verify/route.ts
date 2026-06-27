import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/app/api/_helpers/response";
import { parseBody } from "@/app/api/_helpers/validate";
import { verifyWhatsAppPhone } from "@/lib/services/whatsapp";
const verifySchema = z.object({ phone_number: z.string().min(8), code: z.string().min(4) });
export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, verifySchema);
  if ("error" in parsed) return parsed.error;
  const result = await verifyWhatsAppPhone(sb, parsed.data.phone_number, parsed.data.code);
  if (result.error) return serverError(result.error);
  return ok({ verified: true });
}
