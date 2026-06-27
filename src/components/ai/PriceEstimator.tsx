"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Brain, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
const CONDS = [{value:"new_sealed",label:"New / Sealed"},{value:"new_open",label:"New / Opened"},{value:"used_complete",label:"Used / Complete"},{value:"used_incomplete",label:"Used / Incomplete"},{value:"parts_lot",label:"Parts Lot"}];
export function PriceEstimator({ setNumber, condition: ic = "used_complete", pieceCount, yearReleased }: { setNumber?: string; condition?: string; pieceCount?: number; yearReleased?: number }) {
  const [condition, setCondition] = useState(ic);
  const [est, setEst] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  async function run() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/estimate-price", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ set_number: setNumber, condition, piece_count: pieceCount, year_released: yearReleased }) });
      const j = await res.json();
      if (j.success) setEst(j.data); else setError(j.error);
    } catch { setError("Failed"); }
    setLoading(false);
  }
  useEffect(() => { if (setNumber || pieceCount) run(); }, []);
  const iScore = est?.investment_score ?? 50;
  const II = iScore >= 65 ? TrendingUp : iScore <= 35 ? TrendingDown : Minus;
  const iColor = iScore >= 65 ? "text-green-600" : iScore <= 35 ? "text-red-600" : "text-gray-700";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2"><Brain className="h-5 w-5 text-lego-red" /><CardTitle className="flex-1">AI Price Estimator</CardTitle>{est && <Badge variant="outline">{est.confidence_score}% confidence</Badge>}</CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-end"><div className="flex-1"><Select label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} options={CONDS} /></div><Button onClick={run} loading={loading}>Recalculate</Button></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {est && (
          <>
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-4"><p className="text-xs text-gray-600 uppercase">Estimated Fair Value</p><p className="text-3xl font-bold text-lego-red">{formatCurrency(est.suggested_price)}</p><p className="text-xs text-gray-600 mt-1">Range: {formatCurrency(est.low_range)} - {formatCurrency(est.high_range)}</p></div>
            <div className="grid grid-cols-2 gap-3"><div className="p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-1 mb-1"><II className={`h-4 w-4 ${iColor}`} /><span className={`text-xs font-semibold ${iColor}`}>Investment</span></div><p className={`text-2xl font-bold ${iColor}`}>{est.investment_score}/100</p></div><div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-semibold text-gray-600">Data Points</p><p className="text-2xl font-bold">{est.market_data.data_points}</p></div></div>
            <div className="border-t pt-3"><div className="flex items-center gap-1 mb-2"><Info className="h-3.5 w-3.5 text-gray-500" /><p className="text-xs font-semibold text-gray-600">Analysis</p></div><ul className="space-y-1">{est.explanation.map((l: string, i: number) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-lego-red">&bull;</span><span>{l}</span></li>)}</ul></div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
