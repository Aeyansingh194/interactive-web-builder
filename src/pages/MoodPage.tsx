import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const emotions = ["Joy", "Calm", "Anxiety", "Stress", "Tired", "Energetic"];
const emotionColors: Record<string, string> = {
  Joy: "bg-emerald-500", Calm: "bg-sky-500", Anxiety: "bg-amber-500",
  Stress: "bg-rose-500", Tired: "bg-purple-500", Energetic: "bg-cyan-500",
};

const moodLevels = [
  { label: "Very Low", color: "bg-rose-500" },
  { label: "Low", color: "bg-orange-500" },
  { label: "Moderate", color: "bg-amber-500" },
  { label: "Good", color: "bg-emerald-500" },
  { label: "Excellent", color: "bg-blue-500" },
];

const factors = ["Sleep quality", "Exercise", "Social interaction", "Work stress", "Diet quality"];

type MoodEntry = {
  mood: number; stress: number; energy: number;
  emotions: string[]; timestamp: Date; note: string;
};

const MoodPage = () => {
  const [moodVal, setMoodVal] = useState(7);
  const [stressVal, setStressVal] = useState(3);
  const [energyVal, setEnergyVal] = useState(6);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [activeChart, setActiveChart] = useState<"Mood" | "Stress" | "Energy">("Mood");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const toggleEmotion = (e: string) =>
    setSelectedEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  const logMood = () => {
    setEntries((prev) => [
      { mood: moodVal, stress: stressVal, energy: energyVal, emotions: [...selectedEmotions], timestamp: new Date(), note },
      ...prev,
    ]);
    setNote("");
    setSelectedEmotions([]);
    toast({ title: "Mood logged ✅", description: `Mood: ${moodVal}/10, Stress: ${stressVal}/10, Energy: ${energyVal}/10` });
  };

  // Chart data from entries
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d, i) => {
      const dayEntries = entries.filter((e) => e.timestamp.getDay() === (i + 1) % 7);
      return {
        name: d,
        Mood: dayEntries.length ? Math.round(dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length) : null,
        Stress: dayEntries.length ? Math.round(dayEntries.reduce((s, e) => s + e.stress, 0) / dayEntries.length) : null,
        Energy: dayEntries.length ? Math.round(dayEntries.reduce((s, e) => s + e.energy, 0) / dayEntries.length) : null,
      };
    });
  }, [entries]);

  const weeklyBarData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d, i) => {
      const dayEntries = entries.filter((e) => e.timestamp.getDay() === (i + 1) % 7);
      return { name: d, mood: dayEntries.length ? +(dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length).toFixed(1) : 0, stress: dayEntries.length ? +(dayEntries.reduce((s, e) => s + e.stress, 0) / dayEntries.length).toFixed(1) : 0 };
    });
  }, [entries]);

  // Emotion distribution
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => e.emotions.forEach((em) => { counts[em] = (counts[em] || 0) + 1; }));
    return counts;
  }, [entries]);
  const totalEmotions = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
  const positivePercent = totalEmotions ? Math.round(((emotionCounts["Joy"] || 0) + (emotionCounts["Calm"] || 0) + (emotionCounts["Energetic"] || 0)) / totalEmotions * 100) : 64;

  // Monthly overview
  const avgMood = entries.length ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1) : "—";
  const avgStress = entries.length ? (entries.reduce((s, e) => s + e.stress, 0) / entries.length).toFixed(1) : "—";
  const avgEnergy = entries.length ? (entries.reduce((s, e) => s + e.energy, 0) / entries.length).toFixed(1) : "—";

  // Factor scores (simulated from entries)
  const factorScores = useMemo(() => factors.map((f) => ({ name: f, score: entries.length ? Math.round(3 + Math.random() * 5) : 0 })), [entries.length]);

  // AI recommendations
  const recommendations = [
    "Try a 10-minute mindfulness meditation in the morning",
    "Incorporate a 30-minute walk outside each day",
    "Limit screen time before bed to improve sleep quality",
    "Practice gratitude journaling before bedtime",
    "Schedule regular social interactions to boost mood",
  ];

  const analyzePatterns = async () => {
    if (entries.length < 2) {
      toast({ description: "Log at least 2 moods to analyze patterns." });
      return;
    }
    setIsAnalyzing(true);
    try {
      const summary = entries
        .map((e) => `mood:${e.mood}/10, stress:${e.stress}/10, energy:${e.energy}/10, emotions:${e.emotions.join(",")}${e.note ? `, note: ${e.note}` : ""}`)
        .join("; ");
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/panda-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Analyze my mood data and give brief personalized wellness advice: ${summary}` }],
        }),
      });
      let result = "";
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) result += c; } catch {}
          }
        }
      }
      setAnalysis(result || "Unable to analyze at this time.");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not analyze moods." });
    } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">📊 Mood Tracking</h1>
          <p className="text-muted-foreground">Monitor your emotional wellbeing and receive AI-powered insights to improve mental health.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Mood Tracker with Chart */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-foreground">📈 Mood Tracker</h2>
                  <p className="text-xs text-muted-foreground">Track your emotional well-being over time</p>
                </div>
                <span className="text-lg">📅</span>
              </div>
              {/* Chart tabs */}
              <div className="flex gap-2 my-4">
                {(["Mood", "Stress", "Energy"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveChart(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeChart === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey={activeChart} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Mood level legend */}
              <div className="flex justify-between mt-4">
                {moodLevels.map((l) => (
                  <div key={l.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-5">How are you feeling right now?</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Mood</span>
                    <span className="text-primary font-bold">{moodVal}/10</span>
                  </div>
                  <Slider value={[moodVal]} onValueChange={([v]) => setMoodVal(v)} min={1} max={10} step={1} className="[&_[role=slider]]:bg-primary" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Stress Level</span>
                    <span className="text-rose-500 font-bold">{stressVal}/10</span>
                  </div>
                  <Slider value={[stressVal]} onValueChange={([v]) => setStressVal(v)} min={1} max={10} step={1} className="[&_[role=slider]]:bg-rose-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Energy Level</span>
                    <span className="text-emerald-600 font-bold">{energyVal}/10</span>
                  </div>
                  <Slider value={[energyVal]} onValueChange={([v]) => setEnergyVal(v)} min={1} max={10} step={1} className="[&_[role=slider]]:bg-emerald-500" />
                </div>
              </div>

              {/* Emotion tags */}
              <div className="mt-5">
                <p className="text-sm font-medium text-foreground mb-3">Select your emotions:</p>
                <div className="flex flex-wrap gap-2">
                  {emotions.map((e) => (
                    <button
                      key={e}
                      onClick={() => toggleEmotion(e)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        selectedEmotions.includes(e)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any notes? (optional)"
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm resize-none h-20 mt-5 focus:outline-none"
              />

              <Button onClick={logMood} className="w-full mt-4 rounded-xl py-5 gap-2">
                Save Mood Entry 💾
              </Button>
            </div>

            {/* AI Insight */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>🤖</span>
                <h3 className="font-semibold text-foreground">AI Insight</h3>
              </div>
              {analysis ? (
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{analysis}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {entries.length < 2
                    ? "Log at least 2 mood entries to receive personalized AI insights."
                    : "Click below to get AI-powered insights based on your mood data."}
                </p>
              )}
              {entries.length >= 2 && (
                <Button onClick={analyzePatterns} variant="outline" disabled={isAnalyzing} className="mt-3 rounded-full text-xs">
                  {isAnalyzing ? "Analyzing..." : "🔍 Analyze Patterns"}
                </Button>
              )}
            </div>

            {/* Bottom row: Factor Analysis + Weekly Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">📊 Emotional Factor Analysis</h3>
                <div className="space-y-3">
                  {factorScores.map((f) => (
                    <div key={f.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground">{f.name}</span>
                        <span className="text-muted-foreground">{f.score}/10</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${f.score * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">🌊 Weekly Emotional Trends</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyBarData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                      <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="stress" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-5">
            {/* Monthly Overview */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">📅 Monthly Overview</h3>
              <div className="space-y-3">
                {[
                  { label: "Average mood", value: `${avgMood}/10`, color: "bg-primary", pct: entries.length ? +avgMood * 10 : 0 },
                  { label: "Stress levels", value: `${avgStress}/10`, color: "bg-rose-500", pct: entries.length ? +avgStress * 10 : 0 },
                  { label: "Energy levels", value: `${avgEnergy}/10`, color: "bg-emerald-500", pct: entries.length ? +avgEnergy * 10 : 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{item.label}</span>
                      <span className="font-bold text-primary">{item.value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotion Distribution */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">😊 Emotion Distribution</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(emotionCounts).map(([emotion, count]) => (
                  <span key={emotion} className="px-2 py-1 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                    {emotion} ({count})
                  </span>
                ))}
                {Object.keys(emotionCounts).length === 0 && (
                  <span className="text-xs text-muted-foreground">No data yet</span>
                )}
              </div>
              {/* Donut visualization */}
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                      strokeDasharray={`${positivePercent} ${100 - positivePercent}`}
                      strokeDashoffset="25" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{positivePercent}%</span>
                    <span className="text-[9px] text-muted-foreground">Positive</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">💡 AI Recommendations</h3>
              <div className="space-y-3">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-primary mt-0.5">{i + 1}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Timeline */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">🕐 Recent Entries</h3>
              {entries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No moods logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {entries.slice(0, 5).map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${e.mood >= 7 ? "bg-emerald-500" : e.mood >= 4 ? "bg-amber-500" : "bg-rose-500"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {e.timestamp.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Mood: {e.mood}/10 · Stress: {e.stress}/10</p>
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

export default MoodPage;
