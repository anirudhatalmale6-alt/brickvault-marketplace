import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
export function StatsCard({ label, value, icon: Icon, trend, className }: { label: string; value: string|number; icon: LucideIcon; trend?: { value: number; positive: boolean }; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div><p className="text-sm text-gray-500 mb-1">{label}</p><p className="text-2xl font-bold text-gray-900">{value}</p>{trend && <p className={cn("text-xs mt-1 font-medium", trend.positive ? "text-green-600" : "text-red-600")}>{trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%</p>}</div>
          <div className="p-2 bg-lego-red/10 rounded-lg"><Icon className="h-5 w-5 text-lego-red" /></div>
        </div>
      </CardContent>
    </Card>
  );
}
