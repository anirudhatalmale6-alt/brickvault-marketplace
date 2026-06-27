"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/whatsapp-logs").then(r => r.json()).then(j => { if (j.success) { const d = j.data; setItems(Array.isArray(d) ? d : (d?.data ?? [])); } }).finally(() => setLoading(false)); }, []);
  return (<div className="space-y-4"><h1 className="text-2xl font-bold">WhatsApp Logs</h1>{loading ? <div className="space-y-2">{Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : <div className="space-y-2">{items.map((item: any, i: number) => (<Card key={item.id ?? i} className="p-4"><div className="flex justify-between"><div><p className="font-medium">{item.full_name ?? item.title ?? item.email ?? `Item ${i+1}`}</p>{item.email && <p className="text-sm text-gray-500">{item.email}</p>}{item.status && <p className="text-sm text-gray-500 capitalize">Status: {item.status}</p>}</div>{item.role && <span className="text-sm text-gray-600 capitalize">{item.role}</span>}</div></Card>))}{items.length === 0 && <p className="text-gray-500 py-4 text-center">No items found.</p>}</div>}</div>);
}
