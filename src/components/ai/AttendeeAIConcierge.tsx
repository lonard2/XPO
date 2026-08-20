"use client";

import * as React from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  RotateCcw,
  Navigation,
  Clock,
  MapPin,
  Ticket,
  Maximize2,
  Minimize2,
  ChevronDown,
} from "lucide-react";
import { useSettings } from "@/components/settings/SettingsProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

interface AttendeeAIConciergeProps {
  locale?: string;
  eventContext?: {
    title?: string;
    slug?: string;
    venueName?: string;
    venueCity?: string;
    transitInfo?: string;
    halls?: string[];
  };
}

const SUGGESTED_QUESTIONS = [
  { label: "How to get to the venue?", prompt: "How do I reach the venue by public transit or shuttle?", icon: Navigation },
  { label: "Where is Hall A1?", prompt: "Where is Hall A1 and how do I navigate there?", icon: MapPin },
  { label: "Keynote schedule", prompt: "What time does the opening plenary keynote start today?", icon: Clock },
  { label: "Pass & Check-in", prompt: "How does the digital QR pass fast-track check-in work?", icon: Ticket },
];

export function AttendeeAIConcierge({ locale = "en", eventContext }: AttendeeAIConciergeProps) {
  const { aiConciergeEnabled, isMounted } = useSettings();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        `**Hello! I am your XPO Attendee Concierge.**\n\n` +
        `I can help you navigate exhibition halls, check keynote timetables, locate booths, ` +
        `and provide public transit directions to the venue.\n\n` +
        `Select a quick topic below or type your question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // If disabled in settings or not mounted yet, do not render
  if (!isMounted || !aiConciergeEnabled) {
    return null;
  }

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputValue).trim();
    if (!textToSend || isStreaming) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setInputValue("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          eventContext: eventContext || {
            title: "XPO MICE Exhibition 2026",
            venueName: "JIExpo Kemayoran, Jakarta",
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to AI concierge service");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedResponse += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedResponse }
              : msg
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "I apologize, but I encountered a temporary connection issue. Please check your network and try again.",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Chat history cleared. How else may I assist your exhibition visit today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const renderFormattedMarkdown = (text: string) => {
    // Clean lightweight markdown parser for bold, lists, and paragraphs
    const paragraphs = text.split("\n\n");
    return (
      <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
        {paragraphs.map((para, pIdx) => {
          if (para.startsWith("* ") || para.startsWith("- ")) {
            const items = para.split("\n");
            return (
              <ul key={pIdx} className="space-y-1 my-1 list-disc list-inside pl-1 text-muted-foreground">
                {items.map((item, iIdx) => {
                  const cleanItem = item.replace(/^[*\-]\s+/, "");
                  return (
                    <li key={iIdx} className="text-foreground">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: cleanItem
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>'),
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            );
          }

          return (
            <p
              key={pIdx}
              dangerouslySetInnerHTML={{
                __html: para
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                  .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">$1</code>'),
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <aside
          aria-label="Floating AI Concierge Launcher"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Attendee AI Concierge"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-primary/20"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="h-5 w-5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
            </div>
            <span className="text-xs font-semibold tracking-wide pr-0.5 hidden xs:inline">
              AI Concierge
            </span>
          </button>
        </aside>
      )}

      {/* Expandable Chat Modal */}
      {isOpen && (
        <section
          role="dialog"
          aria-label="Attendee AI Concierge Chat Dialog"
          aria-modal="true"
          className={cn(
            "fixed z-50 bottom-20 md:bottom-6 right-3 sm:right-6 flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all duration-300 animate-fade-in",
            isExpanded
              ? "w-[94vw] sm:w-[580px] h-[88vh] max-h-[750px]"
              : "w-[92vw] sm:w-[400px] h-[80vh] max-h-[560px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Attendee AI Concierge
                  </h3>
                  <Badge variant="success" className="text-[9px] px-1 py-0 h-4">
                    Online
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Gemini 3.5 Flash Lite
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearHistory}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Clear chat history"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hidden sm:flex"
                title={isExpanded ? "Collapse dialog" : "Expand dialog"}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Close concierge"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 transition-all",
                      isAssistant
                        ? "bg-card border border-border text-foreground rounded-tl-sm shadow-xs"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    {isAssistant ? (
                      <div>
                        {msg.content ? (
                          renderFormattedMarkdown(msg.content)
                        ) : (
                          <div className="flex items-center gap-1.5 py-1 text-muted-foreground text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-75" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150" />
                            <span className="ml-1 text-[11px]">Synthesizing schedule & transit...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 border-t border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTED_QUESTIONS.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border bg-card hover:bg-accent text-foreground transition-all disabled:opacity-50"
                >
                  <Icon className="h-3 w-3 text-primary" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-border bg-card flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about schedule, transit, halls..."
              disabled={isStreaming}
              className="flex-1 bg-muted/60 border border-input rounded-xl px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || isStreaming}
              isLoading={isStreaming}
              className="h-9 px-3 rounded-xl shrink-0 gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only text-xs">Send</span>
            </Button>
          </form>
        </section>
      )}
    </>
  );
}
