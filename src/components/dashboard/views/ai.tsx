"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Copy,
  Wand2,
  Lightbulb,
  CalendarDays,
  PenLine,
  Hash,
  Loader2,
  Bot,
  PanelLeft,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader, Avatar } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PlatformBadge } from "@/components/brand/platform-icon";
import { PLATFORM_LIST } from "@/lib/brand";
import { useApp } from "@/lib/store";
import { useAiChat, useGenerateCaptions } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

const STORAGE_KEY = "cadence.ai.chat";

const SUGGESTIONS = [
  { icon: PenLine, label: "Draft 3 Instagram captions about a product launch", prompt: "Draft 3 Instagram captions about a product launch for a coffee brand. Keep each under 200 characters and include emojis and hashtags." },
  { icon: CalendarDays, label: "Suggest a content calendar for a SaaS startup", prompt: "Suggest a one-week content calendar for a SaaS startup posting on LinkedIn and X. Include topic, format, and best posting time for each day." },
  { icon: Wand2, label: "Rewrite this caption to be more engaging", prompt: "Rewrite this caption to be more engaging and punchy, keeping it under 150 characters: 'Our new scheduler is now available. Try it today.'" },
  { icon: Hash, label: "What's the best time to post on LinkedIn?", prompt: "What's the best time to post on LinkedIn for a B2B audience, and why? Give me 3 specific time windows with reasoning." },
];

const MOCK_HISTORY = [
  { id: "c1", title: "Spring launch captions", updatedAt: "2d ago" },
  { id: "c2", title: "Weekly content plan", updatedAt: "5d ago" },
  { id: "c3", title: "LinkedIn hook ideas", updatedAt: "1w ago" },
];

export function AiView() {
  const [conversations, setConversations] = React.useState<Conversation[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Conversation[]) : [];
    } catch {
      return [];
    }
  });
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState("");
  const [mobileSidebar, setMobileSidebar] = React.useState(false);

  const chat = useAiChat();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  // Persist
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch { /* ignore */ }
  }, [conversations]);

  // Autoscroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages, chat.isPending]);

  const newChat = () => {
    const c: Conversation = {
      id: `c_${Date.now()}`,
      title: "New conversation",
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setConversations((s) => [c, ...s]);
    setActiveId(c.id);
    setMobileSidebar(false);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;

    const userMsg: ChatMessage = { id: `m_${Date.now()}`, role: "user", content: trimmed };
    let convId = activeId;
    let history: { role: "user" | "assistant"; content: string }[] = [];

    setConversations((s) => {
      let list = s;
      if (!convId) {
        const c: Conversation = {
          id: `c_${Date.now()}`,
          title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : ""),
          messages: [userMsg],
          updatedAt: new Date().toISOString(),
        };
        convId = c.id;
        setActiveId(c.id);
        list = [c, ...s];
      } else {
        list = s.map((c) =>
          c.id === convId
            ? {
                ...c,
                title: c.messages.length === 0 ? trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : "") : c.title,
                messages: [...c.messages, userMsg],
                updatedAt: new Date().toISOString(),
              }
            : c
        );
      }
      const target = list.find((c) => c.id === convId);
      if (target) {
        history = target.messages
          .filter((m) => m.role !== "assistant" || m.content)
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content }));
      }
      return list;
    });

    setInput("");

    chat.mutate(
      { message: trimmed, history },
      {
        onSuccess: (res) => {
          const aiMsg: ChatMessage = {
            id: `m_${Date.now()}_ai`,
            role: "assistant",
            content: res.reply || "I couldn't generate a response. Please try again.",
          };
          setConversations((s) =>
            s.map((c) =>
              c.id === convId
                ? { ...c, messages: [...c.messages, aiMsg], updatedAt: new Date().toISOString() }
                : c
            )
          );
        },
        onError: () => {
          const aiMsg: ChatMessage = {
            id: `m_${Date.now()}_ai`,
            role: "assistant",
            content: "I had trouble reaching the model. Please try again in a moment.",
          };
          setConversations((s) =>
            s.map((c) =>
              c.id === convId ? { ...c, messages: [...c.messages, aiMsg] } : c
            )
          );
        },
      }
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((s) => s.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden lg:h-[calc(100vh-4rem)]">
      {/* Sidebar - desktop */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border/70 bg-card/50 lg:flex">
        <AiSidebar
          conversations={conversations}
          mockHistory={MOCK_HISTORY}
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
          onNew={newChat}
          onDelete={deleteConversation}
        />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Sheet open={mobileSidebar} onOpenChange={setMobileSidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 lg:hidden" aria-label="Conversations">
                  <PanelLeft className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <AiSidebar
                  conversations={conversations}
                  mockHistory={MOCK_HISTORY}
                  activeId={activeId}
                  onSelect={(id) => { setActiveId(id); setMobileSidebar(false); }}
                  onNew={() => { newChat(); setMobileSidebar(false); }}
                  onDelete={deleteConversation}
                />
              </SheetContent>
            </Sheet>
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-mint to-coral text-white">
              <Bot className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">Cadence AI</h1>
              <p className="text-[10px] text-muted-foreground">Your content strategist</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={newChat}>
            <Plus className="size-4" /> New chat
          </Button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-cadence">
          {!active || active.messages.length === 0 ? (
            <EmptyChat onPick={send} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
              {active.messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {chat.isPending && (
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-mint to-coral text-white">
                    <Bot className="size-4" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/70 bg-card/50 p-3">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-xl border border-border/70 bg-background focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask Cadence AI anything about your content…"
                rows={1}
                className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent pr-12 focus-visible:ring-0"
                aria-label="Message Cadence AI"
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2 size-8"
                onClick={() => send(input)}
                disabled={!input.trim() || chat.isPending}
                aria-label="Send message"
              >
                {chat.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Cadence AI can make mistakes. Verify important info. Enter to send · Shift+Enter for newline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiSidebar({
  conversations,
  mockHistory,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  mockHistory: { id: string; title: string; updatedAt: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button onClick={onNew} className="w-full justify-start">
          <Plus className="size-4" /> New conversation
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-cadence px-2 pb-3">
        {conversations.length > 0 && (
          <div className="mb-3">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Recent</p>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                  activeId === c.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <button onClick={() => onSelect(c.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <MessageSquare className="size-3.5 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {conversations.length === 0 && (
          <div className="mb-3">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sample chats</p>
            {mockHistory.map((h) => (
              <div key={h.id} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground">
                <MessageSquare className="size-3.5 shrink-0" />
                <span className="truncate">{h.title}</span>
                <span className="ml-auto text-[10px]">{h.updatedAt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-border/60 p-3">
        <CaptionTool />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const openComposer = useApp((s) => s.openComposer);
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {isUser ? (
        <Avatar name="Maya Okafor" color="from-primary to-mint" size="sm" />
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-mint to-coral text-white">
          <Bot className="size-4" />
        </div>
      )}
      <div className={cn("group relative max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted text-foreground"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => { navigator.clipboard?.writeText(message.content).catch(() => {}); toast.success("Copied to clipboard"); }}
            >
              <Copy className="size-3" /> Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => { openComposer(); toast.success("Added to composer"); }}
            >
              <PenLine className="size-3" /> Use in composer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChat({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <div className="relative mb-5">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-mint to-coral text-white shadow-lg">
          <Sparkles className="size-7" />
        </div>
        <span className="absolute -right-1 -top-1 size-4 animate-pulse-ring rounded-full bg-mint" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">How can I help you create today?</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        I can draft captions, plan your content calendar, brainstorm ideas, and optimize posts for every platform.
      </p>
      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onPick(s.prompt)}
            className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <s.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug">{s.label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CaptionTool() {
  const openComposer = useApp((s) => s.openComposer);
  const gen = useGenerateCaptions();
  const [topic, setTopic] = React.useState("");
  const [tone, setTone] = React.useState("friendly");
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(["instagram"]);
  const [captions, setCaptions] = React.useState<string[]>([]);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    gen.mutate(
      { topic, platforms: selectedPlatforms as never, tone, count: 3 },
      {
        onSuccess: (res) => setCaptions(res.captions),
        onError: () => toast.error("Couldn't generate captions"),
      }
    );
  };

  return (
    <div className="rounded-xl border border-border/70 bg-background p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Wand2 className="size-3.5 text-primary" />
        <span className="text-xs font-semibold">Caption generator</span>
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Topic…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-8 text-xs"
        />
        <div className="flex gap-1.5">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
              <SelectItem value="inspirational">Inspirational</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 px-2 text-xs" onClick={handleGenerate} disabled={!topic.trim() || gen.isPending}>
            {gen.isPending ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
            Generate
          </Button>
        </div>
        {captions.length > 0 && (
          <div className="max-h-48 space-y-1.5 overflow-y-auto scrollbar-cadence">
            {captions.map((c, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs">{c}</p>
                <div className="mt-1 flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => { navigator.clipboard?.writeText(c).catch(() => {}); toast.success("Copied"); }}>
                    <Copy className="size-3" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => { openComposer(); toast.success("Added to composer"); }}>
                    <PenLine className="size-3" /> Use
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
