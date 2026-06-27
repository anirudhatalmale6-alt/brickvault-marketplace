"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
const CONDITIONS = [{value:"new_sealed",label:"New Sealed"},{value:"new_open",label:"New Opened"},{value:"used_complete",label:"Used Complete"},{value:"used_incomplete",label:"Used Incomplete"},{value:"parts_lot",label:"Parts Lot"}];
export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch(`/api/listings/${params.id}`).then(r => r.json()).then(j => { if (j.success) setListing(j.data); }); }, [params.id]);
  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch(`/api/listings/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: listing.title, description: listing.description, price: listing.price, condition: listing.condition, location: listing.location }) });
    setSaving(false);
    if ((await res.json()).success) router.push("/dashboard/listings");
  }
  if (!listing) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Listing</h1>
      <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
        <Input label="Title" value={listing.title ?? ""} onChange={e => setListing({ ...listing, title: e.target.value })} />
        <Textarea label="Description" value={listing.description ?? ""} onChange={e => setListing({ ...listing, description: e.target.value })} />
        <Input label="Price" type="number" value={listing.price ?? ""} onChange={e => setListing({ ...listing, price: parseFloat(e.target.value) })} />
        <Select label="Condition" value={listing.condition} onChange={e => setListing({ ...listing, condition: e.target.value })} options={CONDITIONS} />
        <Input label="Location" value={listing.location ?? ""} onChange={e => setListing({ ...listing, location: e.target.value })} />
        <div className="flex gap-3"><Button variant="outline" type="button" onClick={() => router.push("/dashboard/listings")}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
      </form>
    </div>
  );
}
