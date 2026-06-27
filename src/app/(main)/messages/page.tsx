import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyConversations } from "@/lib/services/messages";
import { ConversationList } from "@/components/messages/ConversationList";
export default async function MessagesPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const conversations = await getMyConversations(sb).catch(() => []);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="bg-white border rounded-lg overflow-hidden"><ConversationList conversations={conversations as any} /></div>
    </div>
  );
}
