"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
const SORT_OPTIONS = [{ value: "newest", label: "Newest first" }, { value: "price_asc", label: "Price: Low to High" }, { value: "price_desc", label: "Price: High to Low" }, { value: "popular", label: "Most Popular" }, { value: "investment", label: "Investment Score" }];
export function SortBar({ totalCount }: { totalCount: number }) {
  const router = useRouter(); const searchParams = useSearchParams(); const currentSort = searchParams.get("sort") ?? "newest";
  function handleSort(value: string) { const sp = new URLSearchParams(searchParams.toString()); sp.set("sort", value); sp.delete("page"); router.push(`?${sp.toString()}`); }
  return (<div className="flex items-center justify-between mb-4 flex-wrap gap-2"><p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span> listings found</p><div className="w-48"><Select value={currentSort} onChange={(e) => handleSort(e.target.value)} options={SORT_OPTIONS} /></div></div>);
}
