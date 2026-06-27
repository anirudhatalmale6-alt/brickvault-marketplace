"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, MessageCircle, Gavel, DollarSign } from "lucide-react";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { AuctionPanel } from "@/components/bidding/AuctionPanel";
import { BidHistory } from "@/components/bidding/BidHistory";
import { PriceEstimator } from "@/components/ai/PriceEstimator";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types";

const COND_LABELS: Record<string, string> = { new_sealed: "New Sealed", new_open: "New Opened", used_complete: "Used Complete", used_incomplete: "Used Incomplete", parts_lot: "Parts Lot" };

export function ProductDetailClient({ listing, currentUserId }: { listing: Listing; currentUserId: string | null }) {
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);

  const isOwn = currentUserId === listing.seller_id;
  const isAuction = listing.listing_type === "auction" || listing.listing_type === "buy_now_auction";
  const acceptsOffers = listing.listing_type === "offers" || listing.listing_type === "buy_now_auction";
  const canBuyNow = listing.listing_type === "fixed" || listing.listing_type === "offers" || listing.listing_type === "buy_now_auction";

  async function addToCart() {
    if (!currentUserId) { router.push("/login"); return; }
    setAddingToCart(true);
    await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listing_id: listing.id }) });
    setAddingToCart(false);
    router.push("/cart");
  }

  async function toggleWatchlist() {
    if (!currentUserId) { router.push("/login"); return; }
    setWatchlisted(!watchlisted);
    await fetch(`/api/watchlist/${listing.id}`, { method: watchlisted ? "DELETE" : "POST" });
  }

  async function submitOffer(e: React.FormEvent) {
    e.preventDefault(); setSubmittingOffer(true);
    const res = await fetch("/api/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listing_id: listing.id, amount: parseFloat(offerAmount), message: offerMessage }) });
    const j = await res.json();
    if (j.success) { setOfferOpen(false); setOfferAmount(""); setOfferMessage(""); }
    setSubmittingOffer(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Images */}
        <div><ImageGallery images={listing.images ?? []} alt={listing.title} /></div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            {listing.set_number && <p className="text-sm text-gray-500 mb-1">Set #{listing.set_number}</p>}
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{COND_LABELS[listing.condition] ?? listing.condition}</Badge>
              {listing.year_released && <Badge variant="default">Year: {listing.year_released}</Badge>}
              {listing.piece_count && <Badge variant="default">{listing.piece_count} pieces</Badge>}
            </div>
          </div>

          {canBuyNow && <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600 mb-1">Price</p><p className="text-4xl font-extrabold text-lego-red">{formatCurrency(listing.price, listing.currency)}</p></div>}

          {!isOwn && listing.status === "active" && (
            <div className="space-y-2">
              {canBuyNow && <Button className="w-full" size="lg" onClick={addToCart} loading={addingToCart}><ShoppingCart className="h-5 w-5" /> Add to Cart</Button>}
              {acceptsOffers && !isAuction && <Button variant="outline" className="w-full" onClick={() => { if (!currentUserId) { router.push("/login"); return; } setOfferOpen(true); }}><DollarSign className="h-5 w-5" /> Make an Offer</Button>}
            </div>
          )}
          {isOwn && <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">This is your listing. <a href={`/dashboard/listings/${listing.id}/edit`} className="underline font-medium">Edit it</a></div>}

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleWatchlist}><Heart className={watchlisted ? "fill-lego-red text-lego-red h-5 w-5" : "h-5 w-5"} /></Button>
            <Button variant="ghost" size="icon" onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}><Share2 className="h-5 w-5" /></Button>
            {!isOwn && <Button variant="ghost" onClick={() => { if (!currentUserId) { router.push("/login"); return; } router.push(`/messages?seller=${listing.seller_id}&listing=${listing.id}`); }}><MessageCircle className="h-4 w-4 mr-2" /> Message Seller</Button>}
          </div>

          {listing.description && <div className="pt-4 border-t"><h3 className="font-semibold mb-2">Description</h3><p className="text-gray-700 whitespace-pre-wrap text-sm">{listing.description}</p></div>}
          {listing.location && <p className="text-sm text-gray-500">📍 {listing.location}</p>}
        </div>
      </div>

      {/* Auction + AI panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isAuction && <AuctionPanel listingId={listing.id} sellerId={listing.seller_id} buyNowPrice={listing.listing_type === "buy_now_auction" ? listing.price : undefined} isOwnListing={isOwn} />}
          {isAuction && <BidHistory listingId={listing.id} />}
          <PriceEstimator setNumber={listing.set_number} condition={listing.condition} pieceCount={listing.piece_count ?? undefined} yearReleased={listing.year_released ?? undefined} />
        </div>
      </div>

      <Modal open={offerOpen} onClose={() => setOfferOpen(false)} title="Make an Offer">
        <form onSubmit={submitOffer} className="space-y-4">
          <Input label="Your Offer (ZAR)" type="number" step="0.01" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} required />
          <Textarea label="Message (optional)" value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} placeholder="Include any relevant details..." />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => setOfferOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submittingOffer}><Gavel className="h-4 w-4" /> Send Offer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
