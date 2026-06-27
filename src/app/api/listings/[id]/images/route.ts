import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, forbidden, notFound, fail, serverError } from "@/app/api/_helpers/response";
import { uploadListingImages } from "@/lib/services/listings";
const MAX_FILES = 10; const MAX_SIZE = 5 * 1024 * 1024;
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return unauthorized();
  const { data: listing } = await sb.from("listings").select("seller_id").eq("id", id).single();
  if (!listing) return notFound();
  if (listing.seller_id !== user.id) return forbidden();
  const formData = await req.formData();
  const files = formData.getAll("images").filter((f): f is File => f instanceof File);
  if (!files.length) return fail("No images uploaded");
  if (files.length > MAX_FILES) return fail(`Max ${MAX_FILES} images`);
  for (const file of files) {
    if (file.size > MAX_SIZE) return fail(`File ${file.name} exceeds 5MB`);
    if (!file.type.startsWith("image/")) return fail(`File ${file.name} is not an image`);
  }
  const result = await uploadListingImages(sb, id, files);
  if (result.error) return serverError(result.error);
  return ok({ urls: result.urls });
}
