"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
export function PortfolioChart({ days = 30 }: { days?: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/collection/portfolio/history?days=${days}`).then(r => r.json()).then(j => { if (j.success) setData(j.data.map((s: any) => ({ date: s.snapshot_date, value: s.total_value }))); setLoading(false); });
  }, [days]);
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return <Card><CardContent className="p-8 text-center text-gray-500">No portfolio history yet.</CardContent></Card>;
  return (
    <Card><CardHeader><CardTitle>Portfolio Value</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{fontSize:12}} tickFormatter={(v) => v.slice(5)} /><YAxis tick={{fontSize:12}} /><Tooltip formatter={(v: number) => formatCurrency(v)} /><Line type="monotone" dataKey="value" stroke="#E3000B" strokeWidth={2} /></LineChart></ResponsiveContainer></div></CardContent></Card>
  );
}
