"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatDate } from "@/lib/utils";
export function ConversationList({ conversations }: { conversations: any[] }) {
  const pathname = usePathname();
  if (!conversations.length) return <EmptyState icon={MessageCircle} title="No conversations" description="Message a seller to start." />;
  return (
    <div className="divide-y">
      {conversations.map((c) => (
        <Link key={c.id} href={`/messages/${c.id}`} className={cn("flex items-start gap-3 p-3 hover:bg-gray-50", pathname === `/messages/${c.id}` && "bg-red-50")}>
          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center"><MessageCircle className="h-5 w-5 text-gray-400" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{c.listings?.title ?? "Chat"}</p>
            {c.last_message && <p className="text-sm text-gray-600 truncate">{c.last_message.content}</p>}
          </div>
          {(c.unread_count ?? 0) > 0 && <span className="bg-lego-red text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">{c.unread_count}</span>}
        </Link>
      ))}
    </div>
  );
}
