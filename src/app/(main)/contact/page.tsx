import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, MessageCircle } from "lucide-react";
export const metadata: Metadata = { title: "Contact – BrickVault" };
export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="space-y-4">
        <Card><CardContent className="p-6 flex items-center gap-4"><Mail className="h-8 w-8 text-lego-red" /><div><p className="font-semibold">Email</p><p className="text-gray-600">support@brickvault.co.za</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><MessageCircle className="h-8 w-8 text-lego-red" /><div><p className="font-semibold">WhatsApp</p><p className="text-gray-600">Available for verified sellers</p></div></CardContent></Card>
      </div>
    </div>
  );
}
