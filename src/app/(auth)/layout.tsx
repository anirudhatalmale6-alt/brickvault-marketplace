import type { ReactNode } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8"><div className="w-10 h-10 bg-lego-red rounded-lg flex items-center justify-center"><Package className="h-6 w-6 text-white" /></div><span className="font-bold text-2xl text-gray-900">BrickVault</span></Link>
      {children}
    </div>
  );
}
