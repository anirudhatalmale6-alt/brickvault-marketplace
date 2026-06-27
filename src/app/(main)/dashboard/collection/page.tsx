"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { Heart, Plus, Trash2 } from "lucide-react";
export default function CollectionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", set_number: "", purchase_price: "", current_estimated_value: "", quantity: "1" });
  const load = () => fetch("/api/collection").then(r => r.json()).then(j => { if (j.success) setItems(j.data); });
  useEffect(() => { load(); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/collection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null, current_estimated_value: form.current_estimated_value ? parseFloat(form.current_estimated_value) : null, quantity: parseInt(form.quantity) }) });
    setOpen(false); setForm({ name: "", set_number: "", purchase_price: "", current_estimated_value: "", quantity: "1" }); load();
  }
  async function remove(id: string) { await fetch(`/api/collection/${id}`, { method: "DELETE" }); load(); }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">My Collection</h1><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Item</Button></div>
      {items.length === 0 ? <EmptyState /> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{items.map((item) => (<Card key={item.id}><CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="font-medium">{item.name}</p>{item.set_number && <p className="text-xs text-gray-500">#{item.set_number}</p>}<p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>{item.purchase_price && <p className="text-sm text-gray-600">Paid: {formatCurrency(item.purchase_price)}</p>}{item.current_estimated_value && <p className="text-sm font-semibold text-green-700">Est: {formatCurrency(item.current_estimated_value)}</p>}</div><Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-gray-400" /></Button></div></CardContent></Card>))}</div>}
      <Modal open={open} onClose={() => setOpen(false)} title="Add to Collection">
        <form onSubmit={add} className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Set Number" value={form.set_number} onChange={e => setForm(p => ({ ...p, set_number: e.target.value }))} />
          <Input label="Purchase Price" type="number" value={form.purchase_price} onChange={e => setForm(p => ({ ...p, purchase_price: e.target.value }))} />
          <Input label="Estimated Value" type="number" value={form.current_estimated_value} onChange={e => setForm(p => ({ ...p, current_estimated_value: e.target.value }))} />
          <Input label="Quantity" type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Add</Button></div>
        </form>
      </Modal>
    </div>
  );
}
