import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePage } from "@/components/marketplace/BrowsePage";
export const metadata: Metadata = { title: "Minifigures – BrickVault" };
export default function Page() {
  return <Suspense><BrowsePage title="Minifigures" description="Individual and bulk minifigure listings." /></Suspense>;
}
