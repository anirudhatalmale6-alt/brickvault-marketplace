import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (<div className="flex min-h-[calc(100vh-4rem)]"><DashboardSidebar /><main className="flex-1 p-6 bg-gray-50">{children}</main></div>);
}
