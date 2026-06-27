"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Plus, Edit } from "lucide-react";
const STATUS_VARIANT: Record<string, any> = { active: "success", pending: "warning", draft: "outline", sold: "info", removed: "danger" };
export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/listings?seller=me&pageSize=100").then(r => r.json()).then(j => { if (j.success) setListings(j.data.data ?? []); }).finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">My Listings</h1><Link href="/dashboard/listings/new"><Button><Plus className="h-4 w-4" /> New Listing</Button></Link></div>
      {loading ? <div className="space-y-3">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : listings.length === 0 ? <EmptyState icon={Package} title="No listings yet" action={{ label: "Create Listing", onClick: () => window.location.href = "/dashboard/listings/new" }} /> : (
        <div className="space-y-3">{listings.map((l) => (<Card key={l.id} className="flex items-center justify-between p-4"><div><h3 className="font-medium">{l.title}</h3><p className="text-sm text-gray-500">{formatCurrency(l.price)} · {formatDate(l.created_at)}</p></div><div className="flex items-center gap-2"><Badge variant={STATUS_VARIANT[l.status] ?? "default"}>{l.status}</Badge><Link href={`/dashboard/listings/${l.id}/edit`}><Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button></Link></div></Card>))}</div>
      )}
    </div>
  );
}
