import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingById } from "@/lib/services/listings";
import { ProductDetailClient } from "./ProductDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const sb = await createClient();
  const l = await getListingById(sb, id).catch(() => null);
  return { title: l ? `${l.title} – BrickVault` : "Listing – BrickVault" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const [listing, { data: { user } }] = await Promise.all([getListingById(sb, id), sb.auth.getUser()]);
  if (!listing) notFound();
  return <ProductDetailClient listing={listing as any} currentUserId={user?.id ?? null} />;
}
