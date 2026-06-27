"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
export default function CheckoutPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", address_line1: "", address_line2: "", city: "", postal_code: "", country: "ZA", phone: "" });
  const [loading, setLoading] = useState(false);
  async function handleOrder(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const cartRes = await fetch("/api/cart"); const cart = await cartRes.json();
    if (!cart.success || !cart.data?.length) { setLoading(false); router.push("/cart"); return; }
    const orderRes = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart_item_ids: cart.data.map((i: any) => i.id), shipping_address: form }) });
    const order = await orderRes.json(); setLoading(false);
    if (order.success) router.push("/dashboard/orders");
  }
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <Card><CardHeader><CardTitle>Delivery Details</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleOrder} className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
          <Input label="Address" value={form.address_line1} onChange={e => setForm(p => ({ ...p, address_line1: e.target.value }))} required />
          <Input label="Address Line 2" value={form.address_line2} onChange={e => setForm(p => ({ ...p, address_line2: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
            <Input label="Postal Code" value={form.postal_code} onChange={e => setForm(p => ({ ...p, postal_code: e.target.value }))} required />
          </div>
          <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Place Order</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
