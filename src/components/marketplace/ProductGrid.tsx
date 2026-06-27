import { ListingCard } from "./ListingCard";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";
import type { Listing } from "@/types";
interface ProductGridProps { listings: Listing[]; loading?: boolean; showInvestmentScore?: boolean; onToggleWatchlist?: (id: string) => void; watchlistedIds?: Set<string>; }
export function ProductGrid({ listings, loading = false, showInvestmentScore = false, onToggleWatchlist, watchlistedIds = new Set() }: ProductGridProps) {
  if (loading) return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}</div>;
  if (!listings.length) return <EmptyState icon={PackageSearch} title="No listings found" description="Try adjusting your filters or search terms." />;
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} showInvestmentScore={showInvestmentScore} onToggleWatchlist={onToggleWatchlist} isWatchlisted={watchlistedIds.has(listing.id)} />)}</div>;
}
