import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePage } from "@/components/marketplace/BrowsePage";
export const metadata: Metadata = { title: "LEGO Sets – BrickVault" };
export default function Page() {
  return <Suspense><BrowsePage title="LEGO Sets" description="Browse complete sets — new, used, and retired." /></Suspense>;
}
