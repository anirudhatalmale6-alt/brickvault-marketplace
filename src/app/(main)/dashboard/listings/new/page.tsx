import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getThemes } from "@/lib/services/listings";
import { ListingForm } from "./ListingForm";
export const metadata: Metadata = { title: "New Listing – BrickVault" };
export default async function NewListingPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [categories, themes] = await Promise.all([getCategories(sb).catch(() => []), getThemes(sb).catch(() => [])]);
  return (<div className="space-y-6"><h1 className="text-2xl font-bold">Create Listing</h1><ListingForm categories={categories} themes={themes} /></div>);
}
