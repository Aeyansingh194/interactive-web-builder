import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

type Mood = "positive" | "neutral" | "negative";
type Entry = { text: string; title: string; date: Date; mood: Mood };

const prompts = [
  "Describe a moment when you felt proud of yourself.",
  "What made you smile today?",
  "Write about something you're grateful for.",
  "What's a challenge you overcame recently?",
  "Describe a place where you feel at peace.",
  "What would you tell your younger self?",
  "Write about someone who inspires you.",
];

const moodConfig: Record<Mood, { emoji: string; label: string; color: string; dot: string }> = {
  positive: { emoji: "😊", label: "Positive", color: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  neutral: { emoji: "😐", label: "Neutral", color: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning" },
  negative: { emoji: "😔", label: "Negative", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

const JournalPage = () => {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const { toast } = useToast();

  const prompt = useMemo(() => prompts[Math.floor(Math.random() * prompts.length)], []);

  const save = () => {
    if (!text.trim()) return;
    setEntries((prev) => [
      { text: text.trim(), title: title.trim() || `Entry - ${new Date().toLocaleDateString()}`, date: new Date(), mood: mood || "neutral" },
      ...prev,
    ]);
    setText("");
    setTitle("");
    setMood(null);
    toast({ title: "Entry saved 📝", description: "Your journal entry has been saved." });
  };

  const deleteEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    toast({ title: "Entry deleted", description: "Your journal entry has been removed." });
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Calendar logic
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const entryDates = new Set(entries.map((e) => `${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`));

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));
  const monthName = calendarMonth.toLocaleString("default", { month: "long" });

  // Stats
  const thisMonthEntries = entries.filter((e) => e.date.getMonth() === today.getMonth() && e.date.getFullYear() === today.getFullYear());
  const streak = (() => {
    let count = 0;
    const d = new Date(today);
    while (true) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (entryDates.has(key)) { count++; d.setDate(d.getDate() - 1); } else break;
    }
    return count;
  })();
  const moodTrend = (() => {
    if (thisMonthEntries.length < 2) return "Neutral";
    const recent = thisMonthEntries.slice(0, Math.ceil(thisMonthEntries.length / 2));
    const positiveCount = recent.filter((e) => e.mood === "positive").length;
    return positiveCount > recent.length / 2 ? "Improving" : "Steady";
  })();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground sm:text-3xl">📓 Reflection Journal</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Write about your thoughts and feelings to track your emotional wellbeing.
          </p>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
          {/* Left column - main content */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="mb-6 rounded-xl"
            />

            {/* Today's Journal */}
            <motion.div
              className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-foreground">Today's Journal</h2>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  📅 {today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {/* Writing Prompt */}
              <div className="bg-accent/50 rounded-xl p-4 mb-5 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Writing Prompt</p>
                  <p className="text-sm text-muted-foreground">{prompt}</p>
                </div>
              </div>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this entry a title..."
                className="mb-3 border-none bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:text-lg"
              />

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full bg-muted/30 rounded-xl p-4 text-sm resize-none min-h-[180px] focus:outline-none leading-relaxed text-foreground placeholder:text-muted-foreground/40 border border-border"
              />

              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>{wordCount} words</span>
                <span>⏱ ~{readTime} min read</span>
              </div>

              {/* Mood Selector */}
              <div className="mt-5">
                <p className="text-sm font-medium text-foreground mb-3">How are you feeling?</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(moodConfig) as Mood[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                        mood === m
                          ? `${moodConfig[m].color} ring-2 ring-ring/20 ring-offset-1`
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {moodConfig[m].emoji} {moodConfig[m].label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={save} disabled={!text.trim()} className="w-full mt-5 rounded-xl gap-2 py-6">
                💾 Save Entry
              </Button>
            </motion.div>

            {/* Past entries list */}
            {filteredEntries.length > 0 && (
              <AnimatePresence>
                {filteredEntries.map((e, i) => (
                  <motion.div
                    key={e.date.getTime()}
                    className="mb-3 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-sm sm:p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${moodConfig[e.mood].dot}`} />
                        <div className="min-w-0">
                          <h4 className="font-medium text-foreground text-sm">{e.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{e.text}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 shrink-0 sm:justify-end">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {e.date.toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => deleteEntry(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {entries.length === 0 && !searchQuery && (
              <div className="text-center py-16 text-muted-foreground">
                <span className="text-5xl block mb-4">📅</span>
                <p className="text-sm">Your journal is empty. Start writing your first entry above.</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-full shrink-0 space-y-5 xl:w-80">
            {/* Calendar */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">📅 Journal Calendar</h3>
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <span key={d} className="font-medium text-muted-foreground py-1">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDay }).map((_, i) => <span key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const hasEntry = entryDates.has(`${year}-${month}-${day}`);
                  return (
                    <span
                      key={day}
                      className={`py-1.5 rounded-lg font-medium ${
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : hasEntry
                          ? "text-primary font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <button onClick={prevMonth} className="rounded-full px-2 py-1 transition-colors hover:bg-muted hover:text-foreground">← {new Date(year, month - 1).toLocaleString("default", { month: "short" })}</button>
                <span className="font-medium text-foreground">{monthName} {year}</span>
                <button onClick={nextMonth} className="rounded-full px-2 py-1 transition-colors hover:bg-muted hover:text-foreground">{new Date(year, month + 1).toLocaleString("default", { month: "short" })} →</button>
              </div>
            </div>

            {/* Journal Stats */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">📊 Journal Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-primary font-medium">Entries this month</span>
                    <span className="font-bold">{thisMonthEntries.length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, thisMonthEntries.length * 3.3)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-warning">Current streak</span>
                    <span className="font-bold">{streak} days</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${Math.min(100, streak * 10)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-success">Mood trend</span>
                    <span className="font-bold text-success">{moodTrend}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-success" style={{ width: moodTrend === "Improving" ? "80%" : "50%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">🕐 Recent Entries</h3>
              {entries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {entries.slice(0, 5).map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${moodConfig[e.mood].dot}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">{e.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{e.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JournalPage;
