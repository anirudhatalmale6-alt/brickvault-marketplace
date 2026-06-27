"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";
export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", icon: "" });
  const load = () => fetch("/api/admin/categories").then(r => r.json()).then(j => { if (j.success) setCats(j.data); });
  useEffect(() => { load(); }, []);
  async function add(e: React.FormEvent) { e.preventDefault(); await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setOpen(false); setForm({ name: "", slug: "", icon: "" }); load(); }
  async function del(id: string) { await fetch(`/api/admin/categories/${id}`, { method: "DELETE" }); load(); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Categories</h1><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add</Button></div>
      <div className="space-y-2">{cats.map(c => (<Card key={c.id} className="p-4 flex justify-between items-center"><div><p className="font-medium">{c.name}</p><p className="text-sm text-gray-500">{c.slug}</p></div><Button variant="ghost" size="icon" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-gray-500" /></Button></Card>))}</div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Category">
        <form onSubmit={add} className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
          <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} />
          <Button type="submit" className="w-full">Create</Button>
        </form>
      </Modal>
    </div>
  );
}
