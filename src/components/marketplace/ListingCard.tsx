"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, TrendingUp, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types";
interface ListingCardProps { listing: Listing; showInvestmentScore?: boolean; onToggleWatchlist?: (id: string) => void; isWatchlisted?: boolean; }
const conditionLabels: Record<string, string> = { new_sealed: "New Sealed", new_open: "New Opened", used_complete: "Used Complete", used_incomplete: "Used Incomplete", parts_lot: "Parts Lot" };
export function ListingCard({ listing, showInvestmentScore = false, onToggleWatchlist, isWatchlisted = false }: ListingCardProps) {
  const mainImage = listing.images?.[0];
  const isAuction = listing.listing_type === "auction" || listing.listing_type === "buy_now_auction";
  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/product/${listing.id}`} className="block relative aspect-square bg-gray-100">
        {mainImage ? <Image src={mainImage} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>}
        {onToggleWatchlist && <button onClick={(e) => { e.preventDefault(); onToggleWatchlist(listing.id); }} className={cn("absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-sm", isWatchlisted ? "text-lego-red" : "text-gray-600")}><Heart className={cn("h-4 w-4", isWatchlisted && "fill-current")} /></button>}
        {isAuction && <div className="absolute top-2 left-2"><Badge variant="warning" className="flex items-center gap-1"><Gavel className="h-3 w-3" />Auction</Badge></div>}
      </Link>
      <div className="p-3">
        <Link href={`/product/${listing.id}`}><h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 hover:text-lego-red">{listing.title}</h3></Link>
        {listing.set_number && <p className="text-xs text-gray-500 mb-2">#{listing.set_number}</p>}
        <div className="flex items-center justify-between">
          <div><p className="text-lg font-bold text-lego-red">{formatCurrency(listing.price, listing.currency)}</p><p className="text-xs text-gray-500">{conditionLabels[listing.condition]}</p></div>
          {showInvestmentScore && listing.investment_score != null && <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md"><TrendingUp className="h-3 w-3 text-green-600" /><span className="text-xs font-semibold text-green-600">{listing.investment_score}</span></div>}
        </div>
        {listing.location && <p className="text-xs text-gray-400 mt-2 truncate">📍 {listing.location}</p>}
      </div>
    </div>
  );
}
