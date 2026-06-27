import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
export function CartSummary({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-gray-600">Items ({itemCount})</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className="text-gray-500">At checkout</span></div>
        <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-bold text-lego-red">{formatCurrency(subtotal)}</span></div>
      </CardContent>
      <CardFooter><Link href="/checkout" className="w-full"><Button className="w-full" size="lg" disabled={itemCount===0}>Checkout</Button></Link></CardFooter>
    </Card>
  );
}
