import type { Metadata } from "next";
export const metadata: Metadata = { title: "About – BrickVault" };
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">About BrickVault</h1>
      <div className="prose prose-lg text-gray-700 space-y-4">
        <p>BrickVault is South Africa's smartest LEGO marketplace, built for collectors, investors, and enthusiasts.</p>
        <p>We combine a full-featured marketplace with AI-powered price estimation and portfolio tracking tools — so you always know the true value of your bricks.</p>
        <h2 className="text-2xl font-bold mt-8">Our Mission</h2>
        <p>To make buying and selling LEGO fair, transparent, and enjoyable for everyone in the community.</p>
      </div>
    </div>
  );
}
