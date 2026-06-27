import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Package, ShoppingBag, DollarSign, Gavel, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
export const metadata: Metadata = { title: "Dashboard – BrickVault" };
export default async function DashboardPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [{ count: listingsCount }, { count: ordersCount }, { count: bidsCount }] = await Promise.all([
    sb.from("listings").select("*", { count: "exact", head: true }).eq("seller_id", user.id),
    sb.from("orders").select("*", { count: "exact", head: true }).eq("buyer_id", user.id),
    sb.from("bids").select("*", { count: "exact", head: true }).eq("bidder_id", user.id),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Overview</h1><Link href="/dashboard/listings/new"><Button><Package className="h-4 w-4" /> New Listing</Button></Link></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard label="My Listings" value={listingsCount ?? 0} icon={Package} />
        <StatsCard label="My Orders" value={ordersCount ?? 0} icon={ShoppingBag} />
        <StatsCard label="Active Bids" value={bidsCount ?? 0} icon={Gavel} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/listings" className="p-6 bg-white rounded-lg border hover:shadow-md flex items-center gap-3"><Package className="h-6 w-6 text-lego-red" /><div><p className="font-semibold">Manage Listings</p><p className="text-sm text-gray-500">Edit, draft, or remove</p></div></Link>
        <Link href="/dashboard/collection" className="p-6 bg-white rounded-lg border hover:shadow-md flex items-center gap-3"><Heart className="h-6 w-6 text-lego-red" /><div><p className="font-semibold">My Collection</p><p className="text-sm text-gray-500">Track what you own</p></div></Link>
        <Link href="/dashboard/portfolio" className="p-6 bg-white rounded-lg border hover:shadow-md flex items-center gap-3"><TrendingUp className="h-6 w-6 text-lego-red" /><div><p className="font-semibold">Portfolio</p><p className="text-sm text-gray-500">Value over time</p></div></Link>
      </div>
    </div>
  );
}
