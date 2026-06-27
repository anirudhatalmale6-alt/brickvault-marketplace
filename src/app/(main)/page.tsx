import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Star, Shield, Zap, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFeaturedListings } from "@/lib/services/listings";

const CATEGORIES = [
  { label: "Sets", href: "/browse/sets", emoji: "🏗️" },
  { label: "Minifigures", href: "/browse/minifigures", emoji: "🧑" },
  { label: "Parts", href: "/browse/parts", emoji: "🔩" },
  { label: "MOCs", href: "/browse/mocs", emoji: "🎨" },
];

const FEATURES = [
  { icon: Zap, title: "AI Price Estimator", desc: "Get instant fair-value suggestions powered by market data." },
  { icon: TrendingUp, title: "Portfolio Tracker", desc: "Track your collection's value over time." },
  { icon: Shield, title: "Trusted Marketplace", desc: "Verified sellers and secure transactions." },
  { icon: Star, title: "WhatsApp Alerts", desc: "Instant bid and offer notifications on your phone." },
];

export default async function HomePage() {
  const sb = await createClient();
  const featured = await getFeaturedListings(sb, 8).catch(() => []);
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-lego-red to-red-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="default" className="mb-4 bg-white/20 text-white border-0">South Africa's LEGO Marketplace</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Buy &amp; Sell LEGO<br />The Smart Way</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">AI-powered pricing, live auctions, and portfolio tracking — all in one place.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse/sets"><Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white hover:text-lego-red">Browse Listings <ArrowRight className="h-5 w-5" /></Button></Link>
            <Link href="/register"><Button size="lg" className="bg-white text-lego-red hover:bg-gray-100 shadow-lg">Start Selling Free</Button></Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.href} href={c.href} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md hover:border-lego-red/30 transition-all group">
              <span className="text-4xl block mb-3">{c.emoji}</span>
              <span className="font-semibold text-gray-900 group-hover:text-lego-red">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Listings</h2>
            <Link href="/featured" className="text-lego-red font-medium flex items-center gap-1 hover:underline">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((l: any) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Why BrickVault?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 text-center shadow-sm border">
                <div className="w-12 h-12 bg-lego-red/10 rounded-full flex items-center justify-center mx-auto mb-4"><f.icon className="h-6 w-6 text-lego-red" /></div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
