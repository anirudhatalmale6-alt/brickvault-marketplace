"use client";
import { useEffect, useState } from "react";
import { PortfolioChart } from "@/components/collection/PortfolioChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Package } from "lucide-react";
export default function PortfolioPage() {
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => { fetch("/api/collection/portfolio").then(r => r.json()).then(j => { if (j.success) setSummary(j.data); }); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Portfolio</h1>
      {summary && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Value" value={formatCurrency(summary.total_value)} icon={DollarSign} />
        <StatsCard label="Total Cost" value={formatCurrency(summary.total_cost)} icon={Package} />
        <StatsCard label="Gain/Loss" value={formatCurrency(Math.abs(summary.gain_loss))} icon={summary.gain_loss >= 0 ? TrendingUp : TrendingDown} />
        <StatsCard label="Items" value={summary.item_count} icon={Package} />
      </div>}
      <PortfolioChart />
    </div>
  );
}
