"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, User, Menu, X, Heart, MessageCircle, LayoutDashboard, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { href: "/browse/sets", label: "Sets" }, { href: "/browse/minifigures", label: "Minifigures" },
  { href: "/browse/parts", label: "Parts" }, { href: "/browse/mocs", label: "MOCs" },
  { href: "/categories", label: "Categories" }, { href: "/featured", label: "Featured" },
];

export function Header() {
  const pathname = usePathname();
  const sb = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await sb.auth.getUser();
      setUser(user);
      if (user) {
        const { count: c } = await sb.from("cart_items").select("*", { count: "exact", head: true }).eq("user_id", user.id);
        setCartCount(c ?? 0);
        const { data: convs } = await sb.from("conversations").select("id").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
        if (convs?.length) {
          const { count: u } = await sb.from("messages").select("*", { count: "exact", head: true }).in("conversation_id", convs.map(c => c.id)).eq("read", false).neq("sender_id", user.id);
          setUnreadCount(u ?? 0);
        }
      }
    }
    load();
  }, [pathname]);

  async function handleLogout() { await sb.auth.signOut(); window.location.href = "/login"; }
  function handleSearch(e: React.FormEvent) { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/browse/sets?search=${encodeURIComponent(searchQuery)}`; }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-lego-red rounded-md flex items-center justify-center"><Package className="h-5 w-5 text-white" /></div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">BrickVault</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={cn("px-3 py-2 text-sm font-medium rounded-md transition-colors", pathname.startsWith(item.href) ? "text-lego-red bg-red-50" : "text-gray-700 hover:bg-gray-100")}>{item.label}</Link>
            ))}
          </nav>
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input type="search" placeholder="Search sets, minifigs, parts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
          </form>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/watchlist" className="hidden sm:flex p-2 rounded-md hover:bg-gray-100"><Heart className="h-5 w-5 text-gray-700" /></Link>
                <Link href="/messages" className="relative hidden sm:flex p-2 rounded-md hover:bg-gray-100">
                  <MessageCircle className="h-5 w-5 text-gray-700" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-lego-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </Link>
                <Link href="/cart" className="relative p-2 rounded-md hover:bg-gray-100">
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                  {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-lego-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{cartCount > 9 ? "9+" : cartCount}</span>}
                </Link>
                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setUserMenuOpen(!userMenuOpen)}><User className="h-5 w-5" /></Button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-20 py-1">
                        <div className="px-4 py-2 border-b"><p className="text-sm font-medium truncate">{user.email}</p></div>
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                        <Link href="/dashboard/listings/new" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Package className="h-4 w-4" /> Post Listing</Link>
                        <div className="border-t my-1" />
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
                <Link href="/register"><Button size="sm">Register</Button></Link>
              </>
            )}
            <button className="lg:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden py-3 border-t">
            <form onSubmit={handleSearch} className="mb-3 md:hidden">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
            </form>
            <nav className="flex flex-col gap-1">
              {MAIN_NAV.map((item) => (<Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">{item.label}</Link>))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
