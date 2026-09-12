"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  escalated?: boolean;
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi! Ask me about our services, facilities, location, or membership." },
  ]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as { reply: string; escalated: boolean };
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply, escalated: data.escalated }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong — please try again or call 013 891 2413." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Goodlife Assistant</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <p
                  className={
                    m.role === "user"
                      ? "inline-block rounded-2xl bg-lime-400 px-3 py-2 text-sm text-neutral-950"
                      : "inline-block rounded-2xl bg-white/10 px-3 py-2 text-sm text-neutral-200"
                  }
                >
                  {m.text}
                </p>
                {m.escalated && (
                  <p className="mt-1 text-xs text-neutral-500">Flagged for our team to follow up.</p>
                )}
              </div>
            ))}
            {sending && <p className="text-xs text-neutral-500">Typing...</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-lime-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              aria-label="Send"
              className="flex shrink-0 items-center justify-center rounded-full bg-lime-400 p-2 text-neutral-950 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-neutral-950 shadow-xl hover:bg-lime-300"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
