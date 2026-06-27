"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Heart, Target, TrendingUp, MessageCircle, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "My Listings", icon: Package },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/dashboard/sales", label: "Sales", icon: DollarSign },
  { href: "/dashboard/bids", label: "Bids", icon: Gavel },
  { href: "/dashboard/wanted-list", label: "Wanted List", icon: Target },
  { href: "/dashboard/collection", label: "Collection", icon: Heart },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: TrendingUp },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];
export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)] hidden md:block">
      <nav className="p-3 space-y-1">
        {NAV.map((item) => { const active = item.exact ? pathname === item.href : pathname.startsWith(item.href); return (<Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium", active ? "bg-lego-red/10 text-lego-red" : "text-gray-700 hover:bg-gray-100")}><item.icon className="h-4 w-4" />{item.label}</Link>); })}
      </nav>
    </aside>
  );
}
