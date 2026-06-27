import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePage } from "@/components/marketplace/BrowsePage";
export const metadata: Metadata = { title: "Category – BrickVault" };
export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <Suspense><BrowsePage title={`Category: ${params.slug}`} description="Browse listings in this category." /></Suspense>;
}
