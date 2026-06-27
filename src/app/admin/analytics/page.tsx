"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { fetch("/api/admin/analytics").then(r => r.json()).then(j => { if (j.success) setData(j.data); }); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <Card><CardHeader><CardTitle>Revenue (30 days)</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={v => v.slice(5)} /><YAxis /><Tooltip formatter={(v: number) => formatCurrency(v)} /><Line type="monotone" dataKey="revenue" stroke="#E3000B" strokeWidth={2} /></LineChart></ResponsiveContainer></div></CardContent></Card>
    </div>
  );
}
