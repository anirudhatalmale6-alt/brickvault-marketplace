import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listListings } from "@/lib/services/listings";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { User } from "lucide-react";
export const metadata: Metadata = { title: "Seller – BrickVault" };
export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: profile } = await sb.from("profiles").select("*").eq("id", id).single();
  if (!profile) notFound();
  const { data: listings } = await listListings(sb, {}, "newest", 1, 24);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8 p-6 bg-white rounded-lg border">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><User className="h-8 w-8 text-gray-400" /></div>
        <div><h1 className="text-2xl font-bold">{profile.full_name}</h1><p className="text-gray-600 capitalize">{profile.role}</p></div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Listings</h2>
      <ProductGrid listings={listings as any} />
    </div>
  );
}
