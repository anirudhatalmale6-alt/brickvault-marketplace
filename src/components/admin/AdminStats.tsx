"use client";
import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";
export function AdminStats() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/stats").then(r => r.json()).then(j => { if (j.success) setS(j.data); }); }, []);
  if (!s) return null;
  return (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"><StatsCard label="Users" value={s.total_users} icon={Users} /><StatsCard label="Sellers" value={s.total_sellers} icon={Users} /><StatsCard label="Active" value={s.active_listings} icon={Package} /><StatsCard label="Pending" value={s.pending_listings} icon={Package} /><StatsCard label="Orders" value={s.total_orders} icon={ShoppingBag} /><StatsCard label="Revenue" value={`R ${s.total_revenue.toLocaleString()}`} icon={DollarSign} /></div>);
}
