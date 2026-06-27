"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gavel, Clock, ShieldCheck, ShieldAlert, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
function fmtCd(s: number): string { if (s <= 0) return "Ended"; const d = Math.floor(s/86400); const h = Math.floor((s%86400)/3600); const m = Math.floor((s%3600)/60); const sec = s%60; if (d > 0) return `${d}d ${h}h`; if (h > 0) return `${h}h ${m}m`; return `${m}m ${sec}s`; }
export function AuctionPanel({ listingId, sellerPhone, buyNowPrice, isOwnListing = false }: { listingId: string; sellerId: string; sellerPhone?: string; buyNowPrice?: number; isOwnListing?: boolean }) {
  const router = useRouter();
  const [info, setInfo] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  async function load() { const res = await fetch(`/api/auction/${listingId}`); const json = await res.json(); if (json.success) setInfo(json.data); }
  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, [listingId]);
  async function handleBid(e: React.FormEvent) {
    e.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) { setError("Enter a valid amount"); setLoading(false); return; }
    const res = await fetch("/api/bids", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listing_id: listingId, amount }) });
    const json = await res.json(); setLoading(false);
    if (!json.success) { setError(json.error); return; }
    setSuccess("Bid placed!"); setBidAmount(""); await load(); router.refresh();
  }
  if (!info) return null;
  const waUrl = sellerPhone ? `https://wa.me/${sellerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, interested in listing ${listingId}`)}` : null;
  return (
    <Card className="border-lego-red/30">
      <div className="p-4 border-b bg-gradient-to-r from-red-50 to-yellow-50">
        <div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-lego-red" /><h3 className="font-bold">Live Auction</h3>{info.is_ended ? <Badge variant="danger">Ended</Badge> : info.seconds_remaining < 3600 ? <Badge variant="warning">Ending soon</Badge> : <Badge variant="success">Active</Badge>}</div>
      </div>
      <CardContent className="space-y-4">
        <div><p className="text-xs text-gray-500 uppercase">Current Bid</p><p className="text-3xl font-bold text-lego-red">{info.current_bid != null ? `R ${info.current_bid.toLocaleString()}` : "No bids yet"}</p><p className="text-sm text-gray-600">{info.bid_count} bids</p></div>
        {!info.is_ended && info.ends_at && <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"><Clock className="h-4 w-4 text-gray-600" /><div><p className="text-xs text-gray-500">Ends in</p><p className="font-semibold">{fmtCd(info.seconds_remaining)}</p></div></div>}
        {info.reserve_met !== undefined && <div className="flex items-center gap-2">{info.reserve_met ? <><ShieldCheck className="h-4 w-4 text-green-600" /><span className="text-sm text-green-600 font-medium">Reserve met</span></> : <><ShieldAlert className="h-4 w-4 text-orange-600" /><span className="text-sm text-orange-600 font-medium">Reserve not met</span></>}</div>}
        {!info.is_ended && !isOwnListing && (
          <form onSubmit={handleBid} className="space-y-2">
            <Input type="number" step="0.01" placeholder={`Min R ${info.minimum_next_bid}`} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} error={error ?? undefined} />
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" className="w-full" loading={loading}><Gavel className="h-4 w-4" /> Place Bid</Button>
          </form>
        )}
        {isOwnListing && <p className="text-sm text-gray-500 italic">You cannot bid on your own listing.</p>}
        {buyNowPrice != null && !info.is_ended && <div className="pt-2 border-t"><div className="flex justify-between mb-2"><span className="text-sm text-gray-600">Buy Now</span><span className="font-bold">R {buyNowPrice.toLocaleString()}</span></div><Button variant="secondary" className="w-full">Buy Now</Button></div>}
        {waUrl && <Button variant="outline" className="w-full" onClick={() => window.open(waUrl, "_blank")}><MessageCircle className="h-4 w-4" /> WhatsApp</Button>}
      </CardContent>
    </Card>
  );
}
