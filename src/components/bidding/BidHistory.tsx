"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
export function BidHistory({ listingId }: { listingId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() { const res = await fetch(`/api/bids/history/${listingId}`); const json = await res.json(); if (json.success) setHistory(json.data); setLoading(false); }
    load();
  }, [listingId]);
  return (
    <Card><CardHeader><CardTitle className="text-base">Bid History</CardTitle></CardHeader>
    <CardContent>{loading ? <div className="space-y-2">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}</div> : history.length === 0 ? <p className="text-sm text-gray-500 italic">No bids yet.</p> : <ul className="space-y-2">{history.map((b,i) => <li key={i} className="flex justify-between text-sm py-1.5 border-b last:border-0"><span className="font-semibold">{formatCurrency(b.amount)}</span><span className="text-gray-500 text-xs">{formatDate(b.time)}</span></li>)}</ul>}
    </CardContent></Card>
  );
}
