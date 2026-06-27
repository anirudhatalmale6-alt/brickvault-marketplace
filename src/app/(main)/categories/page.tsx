import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/services/listings";
import { Card, CardContent } from "@/components/ui/Card";
export const metadata: Metadata = { title: "Categories – BrickVault" };
export default async function CategoriesPage() {
  const sb = await createClient();
  const cats = await getCategories(sb).catch(() => []);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cats.map((c: any) => (
          <Link key={c.id} href={`/categories/${c.slug}`}>
            <Card className="hover:shadow-md hover:border-lego-red/30 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                {c.icon && <span className="text-3xl block mb-2">{c.icon}</span>}
                <p className="font-semibold">{c.name}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
