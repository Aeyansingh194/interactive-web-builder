import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GiMeditation, GiLotus, GiSoundWaves } from "react-icons/gi";
import { MdSelfImprovement } from "react-icons/md";
import { IoLeafOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MeditationPage = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!isBreathing) return;
    let phase = 0;
    const phases = [
      { name: "inhale" as const, duration: 4000 },
      { name: "hold" as const, duration: 4000 },
      { name: "exhale" as const, duration: 4000 },
    ];

    const cycle = () => {
      setBreathPhase(phases[phase % 3].name);
      phase++;
    };

    cycle();
    const id = setInterval(cycle, 4000);
    const timerId = setInterval(() => setTimer((t) => t + 1), 1000);

    return () => {
      clearInterval(id);
      clearInterval(timerId);
    };
  }, [isBreathing]);

  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false);
      setTimer(0);
      setBreathPhase("inhale");
    } else {
      setIsBreathing(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground sm:text-4xl">Meditation Hub</h1>
        <p className="mb-10 max-w-xl text-center text-sm leading-7 text-muted-foreground sm:mb-12 sm:text-base">
          Find calm through guided breathing and relaxation.
        </p>

        {/* Breathing Circle */}
        <div className="relative mb-8">
          <motion.div
            className="flex h-40 w-40 items-center justify-center rounded-full bg-calm-lavender sm:h-48 sm:w-48"
            animate={isBreathing ? {
              scale: breathPhase === "inhale" ? 1.3 : breathPhase === "hold" ? 1.3 : 1,
            } : { scale: 1 }}
            transition={{ duration: 4, ease: "easeInOut" }}
          >
            <motion.div
              className="flex h-28 w-28 items-center justify-center rounded-full bg-soft-blue sm:h-32 sm:w-32"
              animate={isBreathing ? {
                scale: breathPhase === "inhale" ? 1.2 : breathPhase === "hold" ? 1.2 : 1,
              } : { scale: 1 }}
              transition={{ duration: 4, ease: "easeInOut" }}
            >
              <div className="text-center">
                {isBreathing ? (
                  <>
                    <p className="text-lg font-semibold text-foreground capitalize">{breathPhase}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(timer)}</p>
                  </>
                ) : (
                  <IoLeafOutline className="w-8 h-8 text-foreground mx-auto" />
                )}
              </div>
            </motion.div>
          </motion.div>
          {isBreathing && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </div>

        <Button onClick={toggleBreathing} size="lg" className="mb-12 w-full max-w-sm gap-2 rounded-full px-8 sm:w-auto">
          {isBreathing ? (
            <MdSelfImprovement className="w-5 h-5" />
          ) : (
            <GiMeditation className="w-5 h-5" />
          )}
          {isBreathing ? "Stop" : "Start Breathing Exercise"}
        </Button>

        {/* Wellness Tools */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Deep Relaxation", duration: "3 min", icon: <GiLotus className="w-6 h-6" />, bg: "bg-mint-green" },
            { title: "Calm Me Down", duration: "6 min", icon: <MdSelfImprovement className="w-6 h-6" />, bg: "bg-soft-yellow" },
            { title: "Binaural Beats", duration: "10 min", icon: <GiSoundWaves className="w-6 h-6" />, bg: "bg-peach" },
          ].map((tool) => (
            <motion.div
              key={tool.title}
              className={`${tool.bg} cursor-pointer rounded-2xl p-5 transition-shadow hover:shadow-md sm:p-6`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                {tool.icon}
                <span className="text-xs text-muted-foreground">{tool.duration}</span>
              </div>
              <p className="font-medium text-sm text-foreground">{tool.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MeditationPage;
