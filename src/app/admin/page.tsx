import type { Metadata } from "next";
import { AdminStats } from "@/components/admin/AdminStats";
export const metadata: Metadata = { title: "Admin – BrickVault" };
export default function AdminPage() { return (<div className="space-y-6"><h1 className="text-2xl font-bold">Admin Overview</h1><AdminStats /></div>); }
