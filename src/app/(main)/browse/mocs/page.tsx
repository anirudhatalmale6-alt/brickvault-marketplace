import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePage } from "@/components/marketplace/BrowsePage";
export const metadata: Metadata = { title: "MOCs & Customs – BrickVault" };
export default function Page() {
  return <Suspense><BrowsePage title="MOCs & Customs" description="Browse original creations by the community." /></Suspense>;
}
