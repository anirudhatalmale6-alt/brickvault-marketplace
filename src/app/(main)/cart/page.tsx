"use client";
import { useEffect, useState } from "react";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ShoppingCart } from "lucide-react";
export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => fetch("/api/cart").then(r => r.json()).then(j => { if (j.success) setItems(j.data); }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  async function updateQty(id: string, q: number) {
    if (q < 1) return remove(id);
    await fetch(`/api/cart/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity: q }) }); load();
  }
  async function remove(id: string) { await fetch(`/api/cart/${id}`, { method: "DELETE" }); load(); }
  const subtotal = items.reduce((s, i) => s + (i.listings?.price ?? 0) * i.quantity, 0);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {loading ? <div className="space-y-4">{Array.from({length:2}).map((_,i) => <Skeleton key={i} className="h-24 w-full" />)}</div> : items.length === 0 ? <EmptyState icon={ShoppingCart} title="Your cart is empty" action={{ label: "Browse Listings", onClick: () => window.location.href = "/browse/sets" }} /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">{items.map(i => <CartItem key={i.id} item={i} onUpdateQuantity={updateQty} onRemove={remove} />)}</div>
          <CartSummary subtotal={subtotal} itemCount={items.length} />
        </div>
      )}
    </div>
  );
}
