import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePage } from "@/components/marketplace/BrowsePage";
export const metadata: Metadata = { title: "Parts & Elements – BrickVault" };
export default function Page() {
  return <Suspense><BrowsePage title="Parts & Elements" description="Individual pieces, bulk lots, and custom parts." /></Suspense>;
}
