import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/services/messages";
import { MessageThread } from "@/components/messages/MessageThread";
export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const messages = await getMessages(sb, id).catch(() => null);
  if (messages === null) notFound();
  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="bg-white border rounded-lg overflow-hidden" style={{ height: "calc(100vh - 10rem)" }}>
        <MessageThread conversationId={id} currentUserId={user.id} initialMessages={messages as any} />
      </div>
    </div>
  );
}
