#!/usr/bin/env python3
from pathlib import Path
PROJECT_ROOT = Path("/home/claude/brickvault-marketplace")

def write_file(rel_path: str, content: str) -> None:
    path = PROJECT_ROOT / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    if content.startswith("\n"):
        content = content[1:]
    path.write_text(content, encoding="utf-8")
    print(f"  ok {rel_path}")

print("Creating BrickVault LEGO Marketplace...")

DIRS = [
    "src/lib/supabase", "src/lib/services", "src/lib/ai", "src/lib/bricklink",
    "src/types", "src/hooks", "src/store",
    "src/components/ui", "src/components/layout", "src/components/marketplace",
    "src/components/bidding", "src/components/ai", "src/components/dashboard",
    "src/components/admin", "src/components/cart", "src/components/messages",
    "src/components/collection", "src/components/auth",
    "src/app/(auth)/login", "src/app/(auth)/register",
    "src/app/(main)/browse/sets", "src/app/(main)/browse/minifigures",
    "src/app/(main)/browse/parts", "src/app/(main)/browse/mocs",
    "src/app/(main)/categories/[slug]", "src/app/(main)/product/[id]",
    "src/app/(main)/seller/[id]",
    "src/app/(main)/dashboard/listings/new",
    "src/app/(main)/dashboard/listings/[id]/edit",
    "src/app/(main)/dashboard/orders", "src/app/(main)/dashboard/purchases",
    "src/app/(main)/dashboard/sales", "src/app/(main)/dashboard/bids",
    "src/app/(main)/dashboard/wanted-list", "src/app/(main)/dashboard/collection",
    "src/app/(main)/dashboard/portfolio",
    "src/app/(main)/messages/[id]", "src/app/(main)/watchlist",
    "src/app/(main)/cart", "src/app/(main)/checkout",
    "src/app/(main)/about", "src/app/(main)/contact", "src/app/(main)/featured",
    "src/app/admin/users/[id]",
    "src/app/admin/listings/[id]/approve", "src/app/admin/listings/[id]/reject",
    "src/app/admin/listings/[id]/remove", "src/app/admin/listings/[id]/suspend-bidding",
    "src/app/admin/bids", "src/app/admin/categories/[id]",
    "src/app/admin/reports/[id]/resolve", "src/app/admin/analytics",
    "src/app/admin/whatsapp-logs", "src/app/admin/actions",
    "src/app/api/_helpers", "src/app/api/auth/me", "src/app/api/auth/logout",
    "src/app/api/auth/upgrade-seller", "src/app/api/listings/[id]/images",
    "src/app/api/listings/featured", "src/app/api/cart/[itemId]",
    "src/app/api/orders/[id]", "src/app/api/orders/sales",
    "src/app/api/offers/received", "src/app/api/offers/[id]/accept",
    "src/app/api/offers/[id]/reject", "src/app/api/offers/[id]/counter",
    "src/app/api/offers/[id]/withdraw", "src/app/api/offers/[id]/respond",
    "src/app/api/bids/history/[listingId]", "src/app/api/bids/dashboard",
    "src/app/api/bids/[id]/accept", "src/app/api/bids/[id]/reject",
    "src/app/api/bids/[id]/counter", "src/app/api/auction/[id]",
    "src/app/api/whatsapp/settings", "src/app/api/whatsapp/verify",
    "src/app/api/whatsapp/logs", "src/app/api/messages/unread",
    "src/app/api/messages/[conversationId]/read",
    "src/app/api/collection/[id]", "src/app/api/collection/portfolio/snapshot",
    "src/app/api/collection/portfolio/history",
    "src/app/api/wanted-list/[id]", "src/app/api/watchlist/[listingId]",
    "src/app/api/admin/stats", "src/app/api/admin/users/[id]",
    "src/app/api/admin/listings/[id]/approve", "src/app/api/admin/listings/[id]/reject",
    "src/app/api/admin/listings/[id]/remove", "src/app/api/admin/listings/[id]/suspend-bidding",
    "src/app/api/admin/bids", "src/app/api/admin/reports/[id]/resolve",
    "src/app/api/admin/categories/[id]", "src/app/api/admin/actions",
    "src/app/api/admin/analytics", "src/app/api/admin/whatsapp-logs",
    "src/app/api/ai/estimate-price", "src/app/api/categories", "src/app/api/themes",
    "supabase/migrations", "scripts", "public/images",
]
for d in DIRS:
    (PROJECT_ROOT / d).mkdir(parents=True, exist_ok=True)

write_file("package.json", """
{
  "name": "brickvault-marketplace",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.3.0",
    "lucide-react": "^0.441.0",
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-hook-form": "^7.52.0",
    "recharts": "^2.12.0",
    "tailwind-merge": "^2.5.0",
    "zod": "^3.23.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.1.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
""")

write_file("tsconfig.json", """
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""")

write_file("next.config.ts", """
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.bricklink.com" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};
export default nextConfig;
""")

write_file("tailwind.config.ts", """
import type { Config } from "tailwindcss";
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lego: { red: "#E3000B", blue: "#006CB7", yellow: "#FFD500", green: "#00852B" },
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
""")

write_file("postcss.config.js", """
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
""")

write_file(".env.local.example", """
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
""")

write_file(".gitignore", """
/node_modules
/.next/
/out/
.env*.local
*.tsbuildinfo
.DS_Store
""")

print("Config files done.")
print("Script complete - all dirs and config written.")
