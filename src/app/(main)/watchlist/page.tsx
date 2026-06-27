"use client";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heart } from "lucide-react";
export default function WatchlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/watchlist").then(r => r.json()).then(j => { if (j.success) setItems(j.data.map((i: any) => i.listings).filter(Boolean)); }).finally(() => setLoading(false)); }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Watchlist</h1>
      {!loading && items.length === 0 ? <EmptyState icon={Heart} title="No saved listings" description="Save listings you want to watch." /> : <ProductGrid listings={items} loading={loading} />}
    </div>
  );
}
