"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Gavel } from "lucide-react";
const schema = z.object({ listing_type: z.enum(["fixed","offers","auction","buy_now_auction"]), minimum_bid: z.number().positive().optional(), bid_increment: z.number().positive().optional(), auction_end_at: z.string().optional(), reserve_price: z.number().positive().optional(), auto_accept_price: z.number().positive().optional(), whatsapp_notifications: z.boolean().default(true) });
const LT = [{ value: "fixed", label: "Fixed Price Only" }, { value: "offers", label: "Accept Offers" }, { value: "auction", label: "Auction" }, { value: "buy_now_auction", label: "Buy Now + Auction" }];
export function BiddingSettingsForm({ defaultValues, onChange }: { defaultValues?: any; onChange: (v: any) => void }) {
  const { control, watch } = useForm({ resolver: zodResolver(schema), defaultValues: { listing_type: "fixed", bid_increment: 10, whatsapp_notifications: true, ...defaultValues } });
  const isAuction = watch("listing_type") === "auction" || watch("listing_type") === "buy_now_auction";
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-lego-red" /> Pricing & Bidding</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Controller name="listing_type" control={control} render={({ field }) => (<Select label="Listing Type" value={field.value} onChange={(e) => { field.onChange(e.target.value); onChange({ listing_type: e.target.value }); }} options={LT} />)} />
        {isAuction && (
          <>
            <Controller name="minimum_bid" control={control} render={({ field }) => (<Input label="Starting Bid" type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const v = e.target.value ? parseFloat(e.target.value) : undefined; field.onChange(v); onChange({ minimum_bid: v }); }} />)} />
            <Controller name="bid_increment" control={control} render={({ field }) => (<Input label="Bid Increment" type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const v = e.target.value ? parseFloat(e.target.value) : undefined; field.onChange(v); onChange({ bid_increment: v }); }} />)} />
            <Controller name="auction_end_at" control={control} render={({ field }) => (<Input label="Auction End" type="datetime-local" value={field.value ?? ""} onChange={(e) => { field.onChange(e.target.value); onChange({ auction_end_at: e.target.value }); }} />)} />
            <Controller name="reserve_price" control={control} render={({ field }) => (<Input label="Reserve Price" type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const v = e.target.value ? parseFloat(e.target.value) : undefined; field.onChange(v); onChange({ reserve_price: v }); }} />)} />
            <Controller name="auto_accept_price" control={control} render={({ field }) => (<Input label="Auto-Accept Price" type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const v = e.target.value ? parseFloat(e.target.value) : undefined; field.onChange(v); onChange({ auto_accept_price: v }); }} />)} />
          </>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={watch("whatsapp_notifications")} onChange={(e) => onChange({ whatsapp_notifications: e.target.checked })} />
          <span className="text-sm text-gray-700">WhatsApp bid notifications</span>
        </label>
      </CardContent>
    </Card>
  );
}
