"use client";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { subscribeToMessages, unsubscribeChannel } from "@/lib/services/messages";
import { cn, formatDate } from "@/lib/utils";
export function MessageThread({ conversationId, currentUserId, initialMessages }: { conversationId: string; currentUserId: string; initialMessages: any[] }) {
  const sb = createClient();
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ch = subscribeToMessages(sb, conversationId, (msg) => setMessages((p) => p.some((m: any) => m.id === msg.id) ? p : [...p, msg]));
    return () => unsubscribeChannel(sb, ch);
  }, [conversationId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { fetch(`/api/messages/${conversationId}/read`, { method: "POST" }); }, [conversationId]);
  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); if (!content.trim() || sending) return; setSending(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: content.trim() }) });
      const json = await res.json();
      if (json.success) { setMessages((p) => p.some((m: any) => m.id === json.data.id) ? p : [...p, json.data]); setContent(""); }
    } finally { setSending(false); }
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: any) => (
          <div key={msg.id} className={cn("flex", msg.sender_id === currentUserId ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[75%] px-3 py-2 rounded-2xl", msg.sender_id === currentUserId ? "bg-lego-red text-white rounded-br-sm" : "bg-gray-100 rounded-bl-sm")}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] mt-1 opacity-70">{formatDate(msg.created_at, "time")}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 border-t flex items-center gap-2">
        <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message..." className="flex-1 h-10 px-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lego-red text-sm" />
        <Button type="submit" size="icon" loading={sending} disabled={!content.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
