import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import shellyHappy from "@/assets/shelly-happy.png";
import { useToast } from "@/hooks/use-toast";
import { ShellyStreamError, streamShellyResponse } from "@/lib/shelly-stream";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "panda-chat-history";
const MAX_HISTORY = 50;

const loadHistory = (): Msg[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveHistory = (messages: Msg[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  } catch {}
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Persist messages whenever they change
  useEffect(() => {
    if (messages.length > 0) saveHistory(messages);
  }, [messages]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "Chat cleared", description: "Previous conversations have been removed." });
  };

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg].slice(-MAX_HISTORY);

    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      await streamShellyResponse({
        messages: allMessages,
        onDelta: (content) => {
          assistantSoFar += content;
          setMessages((prev) => {
            const last = prev[prev.length - 1];

            if (last?.role === "assistant") {
              return prev.map((message, index) =>
                index === prev.length - 1 ? { ...message, content: assistantSoFar } : message,
              );
            }

            return [...prev, { role: "assistant", content: assistantSoFar }];
          });
        },
      });

      if (!assistantSoFar.trim()) {
        throw new ShellyStreamError("Shelly could not finish the reply.");
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof ShellyStreamError ? e.message : "Could not reach Shelly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-6">
          <img src={shellyHappy} alt="Shelly" className="h-10 w-10 sm:h-12 sm:w-12" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground sm:text-xl">Shelly Chat</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Support for emotions, stress, and mental wellbeing</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline"
            >
              Clear chat
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="mb-4 max-h-[58vh] flex-1 space-y-4 overflow-y-auto rounded-[2rem] border border-border bg-card/40 p-3 pr-2 sm:mb-5 sm:max-h-[60vh] sm:p-4"
        >
          {messages.length === 0 && (
            <div className="space-y-4 py-16 text-center sm:py-20">
              <img src={shellyHappy} alt="Shelly" className="mx-auto w-24 sm:w-28" />
              <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                Hi, I&apos;m Shelly — tell me what you&apos;re feeling, what&apos;s weighing on you, or where you need support today.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm sm:max-w-[80%] sm:px-4 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card text-card-foreground shadow-sm border border-border rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none break-words text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-card rounded-2xl px-4 py-3 border border-border shadow-sm">
                <span className="animate-pulse text-muted-foreground text-sm">Shelly is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask Shelly about stress, emotions, or self-care..."
            className="h-12 rounded-full px-4 text-sm sm:text-base"
            disabled={isLoading}
          />
          <Button onClick={send} disabled={isLoading} size="icon" className="h-12 w-12 rounded-full shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatPage;
