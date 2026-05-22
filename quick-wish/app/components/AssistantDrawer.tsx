"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string };

const STORAGE_KEY = "quickwish_assistant_messages";
const MAX_MESSAGES = 20;
const MAX_INPUT = 500;

export default function AssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setMessages(parsed.slice(-MAX_MESSAGES));
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || loading) return;
    if (content.length > MAX_INPUT) {
      setError("Message is too long.");
      return;
    }

    setError("");
    setInput("");
    const nextMessages = [...messages, { role: "user", content }].slice(-MAX_MESSAGES);
    setMessages(nextMessages);
    setLoading(true);

    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_BASE_URL) {
      setError("Assistant is unavailable. API URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: content,
          messages: token ? [] : nextMessages,
        }),
      });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };
      if (!response.ok) {
        throw new Error(data?.message || "Assistant unavailable.");
      }

      const reply = data?.reply || "Thanks for your note. How can I help?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }].slice(-MAX_MESSAGES));
    } catch (err: any) {
      const fallbackMessages: ChatMessage[] = [
        {
          role: "assistant",
          content: "Hello! I’m here to help you choose a thoughtful gift. Who is it for, and what’s the occasion?",
        },
        {
          role: "assistant",
          content: "If you share a budget and delivery date, I’ll curate a few perfect options for you.",
        },
      ];
      setMessages((prev) => [...prev, ...fallbackMessages].slice(-MAX_MESSAGES));
      setError("The assistant is temporarily unavailable. message on this what app number 9009917146.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[color:var(--wine)] text-[color:var(--ivory)] px-4 py-3 shadow-lg hover:bg-[#3b182f] transition-all"
      >
        <MessageCircle size={18} />
        Ask QuickWish
      </button>

      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[color:var(--ivory)] z-50 shadow-2xl transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--border)]">
          <div>
            <h3 className="text-lg font-semibold lux-serif text-[color:var(--plum)]">QuickWish Assistant</h3>
            <p className="text-xs text-[color:var(--muted)]">Gifting guidance for Indore</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-[color:var(--muted)] hover:text-[color:var(--wine)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-132px)] px-4 py-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="lux-card p-4 text-sm text-[color:var(--muted)]">
              Tell me who you are gifting for, the occasion, and your budget. I will curate options.
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={`${msg.role}-${idx}`}
              className={`max-w-[85%] mb-3 px-4 py-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-[color:var(--wine)] text-[color:var(--ivory)]"
                  : "mr-auto bg-white border border-[color:var(--border)] text-[color:var(--plum)]"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="mr-auto mb-3 px-4 py-3 rounded-2xl bg-white border border-[color:var(--border)] text-[color:var(--muted)] text-sm">
              Typing…
            </div>
          )}

          {error && (
            <div className="mr-auto mb-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[color:var(--border)] px-4 py-3 bg-[color:var(--ivory)]">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Type your message..."
              className="flex-1 resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--plum)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="rounded-xl bg-[color:var(--wine)] text-[color:var(--ivory)] p-3 hover:bg-[#3b182f] disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mt-2 text-xs text-[color:var(--muted)]">
            Same Day Delivery - ₹49 extra (Indore only)
          </div>
        </div>
      </aside>
    </>
  );
}
