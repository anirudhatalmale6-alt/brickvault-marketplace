import Link from "next/link";
import { Package } from "lucide-react";
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-lego-red rounded-md flex items-center justify-center"><Package className="h-5 w-5 text-white" /></div><span className="font-bold text-xl text-white">BrickVault</span></div>
            <p className="text-sm text-gray-400">The smartest LEGO marketplace. Buy, sell, and track your collection with AI-powered tools.</p>
          </div>
          <div><h4 className="font-semibold text-white mb-3">Marketplace</h4><ul className="space-y-2 text-sm"><li><Link href="/browse/sets" className="hover:text-white">Browse Sets</Link></li><li><Link href="/browse/minifigures" className="hover:text-white">Minifigures</Link></li><li><Link href="/browse/parts" className="hover:text-white">Parts</Link></li><li><Link href="/featured" className="hover:text-white">Featured</Link></li></ul></div>
          <div><h4 className="font-semibold text-white mb-3">Company</h4><ul className="space-y-2 text-sm"><li><Link href="/about" className="hover:text-white">About</Link></li><li><Link href="/contact" className="hover:text-white">Contact</Link></li></ul></div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500"><p>&copy; {new Date().getFullYear()} BrickVault. Not affiliated with The LEGO Group.</p></div>
      </div>
    </footer>
  );
}
