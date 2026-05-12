"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

/* ------------------------------------------------------------------ */
/*  Markdown-lite renderer                                             */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string) {
  // Split into lines, process bold / list items, rejoin with <br/>
  const lines = text.split("\n");
  const html = lines
    .map((line) => {
      // Bold: **text**
      let processed = line.replace(
        /\*\*(.+?)\*\*/g,
        '<strong class="font-semibold">$1</strong>'
      );
      // Unordered list items: - item or * item
      if (/^\s*[-*]\s+/.test(processed)) {
        processed = processed.replace(
          /^\s*[-*]\s+/,
          '<span class="mr-2">•</span>'
        );
        return `<div class="flex items-start pl-2">${processed}</div>`;
      }
      // Numbered list items: 1. item
      const numberedMatch = processed.match(/^\s*(\d+)\.\s+/);
      if (numberedMatch) {
        processed = processed.replace(
          /^\s*\d+\.\s+/,
          `<span class="mr-2 font-medium">${numberedMatch[1]}.</span>`
        );
        return `<div class="flex items-start pl-2">${processed}</div>`;
      }
      return processed;
    })
    .join("<br/>");

  return html;
}

/* ------------------------------------------------------------------ */
/*  Starter questions                                                  */
/* ------------------------------------------------------------------ */

const starterQuestions = [
  "What are my top customers?",
  "Show me leads ready for outreach",
  "Which customers are overdue for reorder?",
  "Give me a daily summary",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Auto-scroll to bottom ---- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  /* ---- Send message ---- */
  async function handleSend(text?: string) {
    const messageText = (text ?? input).trim();
    if (!messageText || sending) return;

    setError(null);
    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      const history = updatedMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await fetch("/api/admin/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to get response");

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: json.response,
        timestamp: json.timestamp ?? new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get response";
      setError(msg);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* ---- Header ---- */}
      <div className="shrink-0 space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/ai"
            className="text-sm text-[#4b5563] hover:underline"
          >
            AI Growth Center
          </Link>
          <span className="text-sm text-[#4b5563]">/</span>
          <h1 className="text-2xl font-bold text-[#1d4b43]">Sales Copilot</h1>
        </div>
        <p className="text-sm text-[#4b5563]">
          Ask questions about your business data, customers, leads, and sales
          performance.
        </p>
      </div>

      {/* ---- Chat area ---- */}
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#e7e4dc] bg-white shadow-sm">
        {/* ---- Messages ---- */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {messages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-2 text-4xl">💬</div>
              <h3 className="text-lg font-semibold text-[#1d4b43]">
                How can I help?
              </h3>
              <p className="mt-1 text-center text-sm text-[#4b5563]">
                Ask me anything about your customers, leads, orders, or sales
                data.
              </p>

              {/* ---- Starter chips ---- */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {starterQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-[#e7e4dc] bg-[#f7f7fb] px-4 py-2 text-sm text-[#4b5563] transition hover:border-[#1d4b43] hover:text-[#1d4b43]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#1d4b43] text-white"
                    : "border border-[#e7e4dc] bg-white text-[#1d4b43]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(msg.content),
                    }}
                  />
                ) : (
                  <span>{msg.content}</span>
                )}
                {msg.timestamp && (
                  <div
                    className={`mt-1.5 text-[10px] ${
                      msg.role === "user"
                        ? "text-white/60"
                        : "text-[#4b5563]/60"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ---- Typing indicator ---- */}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl border border-[#e7e4dc] bg-white px-4 py-3">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#1d4b43]/40 [animation-delay:0ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#1d4b43]/40 [animation-delay:150ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#1d4b43]/40 [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* ---- Error ---- */}
        {error && (
          <div className="mx-5 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* ---- Input area ---- */}
        <div className="shrink-0 border-t border-[#e7e4dc] p-4">
          {/* Starter chips when there are messages */}
          {messages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {starterQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={sending}
                  className="rounded-full border border-[#e7e4dc] bg-[#f7f7fb] px-3 py-1 text-xs text-[#4b5563] transition hover:border-[#1d4b43] hover:text-[#1d4b43] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your business data…"
              disabled={sending}
              className="flex-1 rounded-lg border border-[#e7e4dc] px-4 py-2.5 text-sm text-[#1d4b43] placeholder-[#4b5563]/50 focus:border-[#1d4b43] focus:outline-none disabled:bg-[#f7f7fb]"
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
