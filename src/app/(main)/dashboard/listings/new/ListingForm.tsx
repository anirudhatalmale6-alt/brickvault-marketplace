"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BiddingSettingsForm } from "@/components/bidding/BiddingSettingsForm";
import { PriceEstimator } from "@/components/ai/PriceEstimator";
import { Package } from "lucide-react";

const schema = z.object({ title: z.string().min(3).max(200), description: z.string().max(5000).optional().default(""), set_number: z.string().max(20).optional(), piece_count: z.coerce.number().int().positive().optional(), year_released: z.coerce.number().int().min(1950).optional(), condition: z.enum(["new_sealed","new_open","used_complete","used_incomplete","parts_lot"]), price: z.coerce.number().positive(), location: z.string().min(2) });
const CONDITIONS = [{value:"new_sealed",label:"New Sealed"},{value:"new_open",label:"New Opened"},{value:"used_complete",label:"Used Complete"},{value:"used_incomplete",label:"Used Incomplete"},{value:"parts_lot",label:"Parts Lot"}];

export function ListingForm({ categories, themes }: { categories: any[]; themes: any[] }) {
  const router = useRouter();
  const [biddingSettings, setBiddingSettings] = useState<any>({ listing_type: "fixed" });
  const [error, setError] = useState<string|null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { condition: "used_complete", location: "South Africa" } });
  const watchedSetNumber = watch("set_number"); const watchedCondition = watch("condition"); const watchedPieces = watch("piece_count");

  async function onSubmit(v: any) {
    setError(null);
    const res = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, ...biddingSettings, category_id: categories[0]?.id, status: "pending" }) });
    const j = await res.json();
    if (!j.success) { setError(j.error); return; }
    router.push("/dashboard/listings");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-lego-red" />Basic Info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Input label="Title" placeholder="e.g. LEGO Creator Modular 10297" error={errors.title?.message} {...register("title")} /></div>
          <Input label="Set Number" placeholder="e.g. 10297" {...register("set_number")} />
          <Input label="Piece Count" type="number" {...register("piece_count")} />
          <Input label="Year Released" type="number" {...register("year_released")} />
          <Select label="Condition" options={CONDITIONS} error={errors.condition?.message} {...register("condition")} />
          <div className="md:col-span-2"><Textarea label="Description" rows={4} {...register("description")} /></div>
          <Input label="Price (ZAR)" type="number" step="0.01" error={errors.price?.message} {...register("price")} />
          <Input label="Location" error={errors.location?.message} {...register("location")} />
        </CardContent>
      </Card>
      <BiddingSettingsForm onChange={(v) => setBiddingSettings((p: any) => ({ ...p, ...v }))} />
      <PriceEstimator setNumber={watchedSetNumber} condition={watchedCondition} pieceCount={watchedPieces ? Number(watchedPieces) : undefined} />
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/listings")}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Create Listing</Button>
      </div>
    </form>
  );
}
