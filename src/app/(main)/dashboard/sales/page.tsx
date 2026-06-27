"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBag } from "lucide-react";
export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/orders/sales").then(r => r.json()).then(j => { if (j.success) setData(j.data); }).finally(() => setLoading(false)); }, []);
  const items = Array.isArray(data) ? data : (data?.buyer_bids ?? data?.seller_bids ?? []);
  return (<div className="space-y-4"><h1 className="text-2xl font-bold">Sales</h1>{loading ? <div className="space-y-3">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : items.length === 0 ? <EmptyState icon={ShoppingBag} title="No sales yet" /> : <div className="space-y-3">{items.map((item: any, i: number) => (<Card key={item.id ?? i} className="p-4"><div className="flex justify-between items-start"><div><p className="font-medium">{item.listings?.title ?? item.title ?? `Item ${i+1}`}</p><p className="text-sm text-gray-500">{formatDate(item.created_at)}</p></div><p className="font-bold text-lego-red">{formatCurrency(item.total ?? item.amount ?? item.price ?? 0)}</p></div></Card>))}  </div>}</div>);
}
