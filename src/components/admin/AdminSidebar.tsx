"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, FolderTree, Flag, BarChart3, Gavel, MessageCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";
const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/bids", label: "Bids", icon: Gavel },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/whatsapp-logs", label: "WA Logs", icon: MessageCircle },
  { href: "/admin/actions", label: "Action Log", icon: History },
];
export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-gray-900 text-gray-100 min-h-screen">
      <div className="p-4 border-b border-gray-800"><p className="text-xs uppercase tracking-wider text-gray-400">Admin Panel</p></div>
      <nav className="p-3 space-y-1">
        {NAV.map((item) => { const active = item.exact ? pathname === item.href : pathname.startsWith(item.href); return (<Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium", active ? "bg-lego-red text-white" : "text-gray-300 hover:bg-gray-800")}><item.icon className="h-4 w-4" />{item.label}</Link>); })}
      </nav>
    </aside>
  );
}
