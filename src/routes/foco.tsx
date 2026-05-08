import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useFocus } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/foco")({
  component: FocusPage,
  head: () => ({
    meta: [
      { title: "HabitBolt — Foco" },
      { name: "description", content: "Sessões de foco estilo Pomodoro." },
    ],
  }),
});

const PRESETS = [15, 25, 45] as const;

function FocusPage() {
  const { sessions, log } = useFocus();
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          log(minutes);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, minutes, log]);

  const setPreset = (m: number) => {
    setMinutes(m);
    setRemaining(m * 60);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(minutes * 60);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = 1 - remaining / (minutes * 60);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMin = sessions.filter((s) => s.date.slice(0, 10) === todayKey).reduce((s, x) => s + x.minutes, 0);
  const total = sessions.reduce((s, x) => s + x.minutes, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <AppHeader title="Foco" subtitle="Concentre-se no que importa" />

      <section className="rounded-3xl border border-border bg-[image:var(--gradient-card)] p-6 shadow-[var(--shadow-card)] flex flex-col items-center">
        <div className="relative size-56 mb-6">
          <svg viewBox="0 0 100 100" className="-rotate-90 size-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--secondary)" strokeWidth="6" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - pct) }}
              transition={{ duration: 0.8 }}
              style={{ filter: "drop-shadow(0 0 12px var(--primary))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold tabular-nums">
              {mm}:{ss}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{minutes} min</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setPreset(m)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-sm font-medium transition",
                minutes === m
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "bg-secondary text-foreground",
              )}
            >
              {m} min
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="lg" onClick={() => setRunning((r) => !r)} className="rounded-2xl px-8">
            {running ? <Pause className="size-5" /> : <Play className="size-5" />}
            {running ? "Pausar" : "Iniciar"}
          </Button>
          <Button size="lg" variant="secondary" onClick={reset} className="rounded-2xl">
            <RotateCcw className="size-5" />
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="size-3.5 text-primary" /> Hoje
          </div>
          <p className="text-2xl font-bold tabular-nums mt-2">{todayMin} min</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="size-3.5 text-primary" /> Total
          </div>
          <p className="text-2xl font-bold tabular-nums mt-2">{total} min</p>
        </div>
      </section>
    </main>
  );
}
