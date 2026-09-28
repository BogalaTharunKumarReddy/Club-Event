import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { assistantService } from '@/lib/services';
import { errorMessage } from '@/lib/utils';
import type { AssistantTurn } from '@/types';

/**
 * Floating help assistant for signed-in users.
 *
 * It first asks the backend whether the assistant is configured
 * ({@code GET /assistant/status}); if not, it renders nothing — so a deployment
 * without an AI key never shows a broken button. Chat turns are kept only in
 * local component state and posted to {@code /assistant/chat}, which proxies to
 * the provider server-side. No provider key ever reaches the browser.
 */
export function AssistantWidget() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Probe availability once. Any failure simply keeps the widget hidden.
  useEffect(() => {
    let active = true;
    assistantService
      .status()
      .then((s) => {
        if (active) setEnabled(s.enabled);
      })
      .catch(() => {
        if (active) setEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Keep the transcript pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading, open]);

  // Focus the composer when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!enabled) return null;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    // Recent turns give the model context; the server trims/sanitises further.
    const history = messages.slice(-12);
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setError(null);
    setLoading(true);
    try {
      const res = await assistantService.chat({ message: text, history });
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      setError(
        errorMessage(e, 'The assistant is unavailable right now. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <div
          role="dialog"
          aria-label="CampusConnect help assistant"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          className="flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-brand-600 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Campus Assistant</p>
                <p className="text-[11px] text-white/80">Here to help you get around</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Transcript */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950/40"
            aria-live="polite"
          >
            {/* Static greeting — not part of the sent history. */}
            <Bubble role="assistant">
              Hi! I'm your CampusConnect helper. Ask me how to register for events,
              join clubs, find your certificates, check in with a QR ticket, and more.
            </Bubble>

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.content}
              </Bubble>
            ))}

            {loading && (
              <Bubble role="assistant">
                <span className="inline-flex items-center gap-1">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                </span>
              </Bubble>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={2000}
                placeholder="Ask a question…"
                className="max-h-28 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-slate-400">
              Answers may be imperfect. For account-specific details, check the
              relevant page.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          aria-label="Open help assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

/** A single chat bubble, aligned by role. */
function Bubble({
  role,
  children,
}: {
  role: 'user' | 'assistant';
  children: ReactNode;
}) {
  const isUser = role === 'user';
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isUser
            ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white'
            : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
        }
      >
        {children}
      </div>
    </div>
  );
}

/** One animated typing dot. */
function Dot({ delay = '0ms' }: { delay?: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: delay }}
    />
  );
}
