import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePage } from "@/components/marketplace/BrowsePage";
export const metadata: Metadata = { title: "Featured Listings – BrickVault" };
export default function FeaturedPage() {
  return <Suspense><BrowsePage title="Featured Listings" description="Hand-picked and top-rated listings." /></Suspense>;
}
