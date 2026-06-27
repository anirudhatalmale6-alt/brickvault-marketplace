import { NextRequest } from "next/server";
import { z, ZodSchema } from "zod";
import { fail } from "./response";
export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<{ data: T } | { error: ReturnType<typeof fail> }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { error: fail(message, 400, "VALIDATION_ERROR") };
    }
    return { data: result.data };
  } catch { return { error: fail("Invalid JSON body", 400, "INVALID_JSON") }; }
}
export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(50) });
