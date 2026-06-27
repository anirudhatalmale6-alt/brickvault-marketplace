"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { X } from "lucide-react";
const CONDITIONS = [{ value: "new_sealed", label: "New Sealed" }, { value: "new_open", label: "New Opened" }, { value: "used_complete", label: "Used Complete" }, { value: "used_incomplete", label: "Used Incomplete" }, { value: "parts_lot", label: "Parts Lot" }];
const LISTING_TYPES = [{ value: "fixed", label: "Fixed Price" }, { value: "offers", label: "Accepts Offers" }, { value: "auction", label: "Auction" }, { value: "buy_now_auction", label: "Buy Now + Auction" }];
export function FilterSidebar({ categories, themes }: { categories: Array<{ id: string; name: string }>; themes: Array<{ id: string; name: string }> }) {
  const router = useRouter(); const searchParams = useSearchParams();
  const get = useCallback((key: string) => searchParams.get(key) ?? "", [searchParams]);
  function update(params: Record<string, string | null>) { const sp = new URLSearchParams(searchParams.toString()); Object.entries(params).forEach(([k, v]) => { if (v == null || v === "") sp.delete(k); else sp.set(k, v); }); sp.delete("page"); router.push(`?${sp.toString()}`); }
  function clearAll() { router.push(window.location.pathname); }
  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== "page" && k !== "sort");
  return (
    <aside className="space-y-4">
      <Card>
        <div className="p-4 border-b flex items-center justify-between"><h3 className="font-semibold">Filters</h3>{hasFilters && <Button variant="ghost" size="sm" onClick={clearAll}><X className="h-3 w-3 mr-1" /> Clear</Button>}</div>
        <div className="p-4 space-y-4">
          <Input label="Set Number" placeholder="e.g. 10297" value={get("set_number")} onChange={(e) => update({ set_number: e.target.value })} />
          <Input label="Location" placeholder="City" value={get("location")} onChange={(e) => update({ location: e.target.value })} />
          <Select label="Category" placeholder="All categories" value={get("category_id")} onChange={(e) => update({ category_id: e.target.value })} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <Select label="Theme" placeholder="All themes" value={get("theme_id")} onChange={(e) => update({ theme_id: e.target.value })} options={themes.map((t) => ({ value: t.id, label: t.name }))} />
          <Select label="Condition" placeholder="Any" value={get("condition")} onChange={(e) => update({ condition: e.target.value })} options={CONDITIONS} />
          <Select label="Listing Type" placeholder="Any" value={get("listing_type")} onChange={(e) => update({ listing_type: e.target.value })} options={LISTING_TYPES} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Min Price" type="number" placeholder="0" value={get("min_price")} onChange={(e) => update({ min_price: e.target.value })} />
            <Input label="Max Price" type="number" placeholder="Any" value={get("max_price")} onChange={(e) => update({ max_price: e.target.value })} />
          </div>
        </div>
      </Card>
    </aside>
  );
}
