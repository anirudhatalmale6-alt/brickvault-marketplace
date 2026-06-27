import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (<div className="flex min-h-screen"><AdminSidebar /><main className="flex-1 p-6 bg-gray-50">{children}</main></div>);
}
