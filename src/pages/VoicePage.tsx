import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import shellyIdle from "@/assets/shelly-idle.png";
import shellyHappy from "@/assets/shelly-happy.png";
import shellySleeping from "@/assets/shelly-sleeping.png";
import shellyMascot from "@/assets/shelly-mascot.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Vapi from "@vapi-ai/web";

const VoicePage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shellyState, setShellyState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState<string[]>([]);
  const vapiRef = useRef<Vapi | null>(null);
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  const startCall = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("vapi-token");
      if (error || !data?.publicKey || !data?.assistantId) {
        throw new Error("Could not get voice credentials");
      }

      const vapi = new Vapi(data.publicKey);
      vapiRef.current = vapi;

      // Set up event listeners
      vapi.on("call-start", () => {
        setIsConnected(true);
        setIsConnecting(false);
        setShellyState("listening");
        setTranscript([]);
      });

      vapi.on("call-end", () => {
        setIsConnected(false);
        setShellyState("idle");
        vapiRef.current = null;
      });

      vapi.on("speech-start", () => {
        setShellyState("speaking");
      });

      vapi.on("speech-end", () => {
        setShellyState("listening");
      });

      vapi.on("message", (msg: any) => {
        if (msg.type === "transcript" && msg.transcript) {
          const prefix = msg.role === "user" ? "You" : "Shelly";
          if (msg.transcriptType === "final") {
            setTranscript((prev) => [...prev.slice(-19), `${prefix}: ${msg.transcript}`]);
          }
        }
      });

      vapi.on("error", (err: any) => {
        console.error("Vapi error:", err);
        toast({ variant: "destructive", title: "Voice Error", description: "Something went wrong with the voice call." });
      });

      await vapi.start(data.assistantId);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Could not start voice session. Please try again." });
      setIsConnecting(false);
    }
  }, [toast]);

  const endCall = useCallback(() => {
    vapiRef.current?.stop();
    setIsConnected(false);
    setShellyState("idle");
    setIsMuted(false);
    toast({ title: "Call ended", description: "Voice session has ended." });
  }, [toast]);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
        {/* Shelly Avatar */}
        <motion.div
          className="relative mb-8"
          animate={shellyState === "listening" ? { scale: [1, 1.05, 1] } : shellyState === "speaking" ? { rotate: [0, 2, -2, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className={`flex h-40 w-40 items-center justify-center rounded-full sm:h-48 sm:w-48 ${
            shellyState === "listening" ? "bg-mint-green" : shellyState === "speaking" ? "bg-soft-yellow" : "bg-muted"
          } transition-colors duration-500`}>
            <img src={shellyState === "listening" ? shellyMascot : shellyState === "speaking" ? shellyHappy : shellyState === "thinking" ? shellySleeping : shellyIdle} alt="Shelly" className="h-28 w-28 sm:h-32 sm:w-32" />
          </div>
          {isConnected && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-card border border-border shadow-sm text-foreground capitalize">
                {shellyState}
              </span>
            </div>
          )}
        </motion.div>

        <h1 className="mb-2 text-center text-3xl font-bold text-foreground sm:text-4xl">Voice with Shelly</h1>
        <p className="mb-8 max-w-xl text-center text-sm leading-7 text-muted-foreground sm:text-base">
          Talk to Shelly using your voice. Shelly will listen, understand, and respond naturally.
        </p>

        {/* Controls */}
        <div className="mb-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          {!isConnected ? (
            <Button
              onClick={startCall}
              disabled={isConnecting}
              size="lg"
              className="w-full max-w-sm gap-2 rounded-full px-8 sm:w-auto"
            >
              <Phone className="w-5 h-5" />
              {isConnecting ? "Connecting..." : "Start Voice Call"}
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-6"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="gap-2 rounded-full px-8"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </Button>
            </>
          )}
        </div>

        {/* Live Transcript */}
        {isConnected && transcript.length > 0 && (
          <div className="max-h-72 w-full rounded-2xl border border-border bg-card p-4 overflow-y-auto">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Live Transcript</h3>
            <div className="space-y-1">
              {transcript.map((line, i) => (
                <p key={i} className={`text-sm ${line.startsWith("You:") ? "text-foreground" : "text-primary"}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="mt-4 max-w-md text-center text-sm text-muted-foreground">
            <p>Press "Start Voice Call" to begin talking with Shelly.</p>
            <p className="mt-1">The conversation happens right here — no redirects.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VoicePage;
