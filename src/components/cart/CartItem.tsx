"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
export function CartItem({ item, onUpdateQuantity, onRemove }: { item: any; onUpdateQuantity: (id: string, q: number) => void; onRemove: (id: string) => void }) {
  const l = item.listings; if (!l) return null; const unavail = l.status !== "active";
  return (
    <div className="flex gap-4 p-4 border border-gray-200 rounded-lg">
      <Link href={`/product/${l.id}`} className="shrink-0">
        <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden">{l.images?.[0] ? <Image src={l.images[0]} alt={l.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>}</div>
      </Link>
      <div className="flex-1">
        <Link href={`/product/${l.id}`}><h4 className="font-medium text-gray-900 hover:text-lego-red line-clamp-1">{l.title}</h4></Link>
        {unavail && <p className="text-xs text-red-600 mt-1">Unavailable</p>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => onUpdateQuantity(item.id, item.quantity-1)} disabled={unavail}><Minus className="h-3 w-3" /></Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button variant="outline" size="icon" onClick={() => onUpdateQuantity(item.id, item.quantity+1)} disabled={unavail}><Plus className="h-3 w-3" /></Button>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-bold text-lego-red">{formatCurrency(l.price * item.quantity)}</p>
            <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}><Trash2 className="h-4 w-4 text-gray-500" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
