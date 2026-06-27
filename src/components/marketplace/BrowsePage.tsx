"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FilterSidebar } from "./FilterSidebar";
import { ProductGrid } from "./ProductGrid";
import { SortBar } from "./SortBar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Listing } from "@/types";
export function BrowsePage({ title, description, defaultListingType }: { title: string; description: string; defaultCategorySlug?: string; defaultListingType?: string }) {
  const router = useRouter(); const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [watchlistedIds, setWatchlistedIds] = useState<Set<string>>(new Set());
  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams(searchParams.toString());
    if (defaultListingType && !sp.has("listing_type")) sp.set("listing_type", defaultListingType);
    try {
      const res = await fetch(`/api/listings?${sp.toString()}`);
      const json = await res.json();
      if (json.success) { setListings(json.data.data); setTotalCount(json.data.count); }
    } finally { setLoading(false); }
  }, [searchParams, defaultListingType]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    async function loadMeta() {
      try {
        const [c, t] = await Promise.all([fetch("/api/categories"), fetch("/api/themes")]);
        const cj = await c.json(); const tj = await t.json();
        if (cj.success) setCategories(cj.data);
        if (tj.success) setThemes(tj.data);
      } catch {}
    }
    loadMeta();
  }, []);
  async function toggleWatchlist(id: string) {
    const w = watchlistedIds.has(id);
    setWatchlistedIds((p) => { const n = new Set(p); if (w) n.delete(id); else n.add(id); return n; });
    await fetch(`/api/watchlist/${id}`, { method: w ? "DELETE" : "POST" });
  }
  const page = Number(searchParams.get("page") ?? 1);
  const totalPages = Math.max(1, Math.ceil(totalCount / 24));
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6"><h1 className="text-3xl font-bold">{title}</h1><p className="text-gray-600 mt-1">{description}</p></div>
      <div className="flex gap-6">
        <div className="hidden lg:block w-64 shrink-0"><FilterSidebar categories={categories} themes={themes} /></div>
        <div className="flex-1 min-w-0">
          <div className="lg:hidden mb-4"><Button variant="outline" onClick={() => setMobileFiltersOpen(true)} className="w-full">Filters</Button></div>
          <SortBar totalCount={totalCount} />
          <ProductGrid listings={listings} loading={loading} showInvestmentScore onToggleWatchlist={toggleWatchlist} watchlistedIds={watchlistedIds} />
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" disabled={page <= 1} onClick={() => { const sp = new URLSearchParams(searchParams.toString()); sp.set("page", String(page - 1)); router.push(`?${sp.toString()}`); }}>Previous</Button>
              <span className="flex items-center px-4 text-sm text-gray-600">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => { const sp = new URLSearchParams(searchParams.toString()); sp.set("page", String(page + 1)); router.push(`?${sp.toString()}`); }}>Next</Button>
            </div>
          )}
        </div>
      </div>
      <Modal open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filters" size="md">
        <FilterSidebar categories={categories} themes={themes} />
        <div className="mt-4 flex justify-end"><Button onClick={() => setMobileFiltersOpen(false)}>Done</Button></div>
      </Modal>
    </div>
  );
}
