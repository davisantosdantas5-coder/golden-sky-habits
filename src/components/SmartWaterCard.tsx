import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Plus, Settings, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWater } from "@/lib/store";
import { useLocalStorage, lastNDays, todayKey } from "@/lib/storage";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MIN_GOAL = 500;
const MAX_GOAL = 10000;

const clampGoal = (n: number) =>
  Math.min(MAX_GOAL, Math.max(MIN_GOAL, Math.round(n)));

export function SmartWaterCard() {
  const { user } = useAuth();
  const water = useWater();
  const [goalMl, setGoalMlRaw] = useLocalStorage<number>(
    "habitbolt.water.goal",
    2400,
  );
  const [preferredMl, setPreferredMl] = useLocalStorage<number>(
    "habitbolt.water.preferred",
    250,
  );
  const [pulseKey, setPulseKey] = useState(0);
  const [customMl, setCustomMl] = useState<string>("");
  const [customOpen, setCustomOpen] = useState(false);

  const setGoalMl = (n: number) => setGoalMlRaw(clampGoal(n));

  // Build current calendar week Sun -> Sat (local time)
  const today = todayKey();
  const days = useMemo(() => {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay()); // back to Sunday
    const out: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      out.push(`${y}-${m}-${day}`);
    }
    return out;
  }, [today]);

  const { data: weekMap = {} } = useQuery({
    queryKey: ["water-week", user?.id, days[0], days[6], water.today],
    enabled: !!user?.id,
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("water_intake")
        .select("date, amount_ml")
        .gte("date", days[0])
        .lte("date", days[6]);
      if (error) throw error;
      const out: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        out[r.date] = r.amount_ml;
      });
      return out;
    },
  });

  const todayMl = water.today;
  const todayPct = Math.min(100, Math.round((todayMl / goalMl) * 100));

  const handleAdd = (ml: number) => {
    if (!ml || ml <= 0) return;
    water.add(ml);
    setPulseKey((k) => k + 1);
  };

  const submitCustom = () => {
    const n = Math.round(Number(customMl));
    if (Number.isFinite(n) && n > 0) {
      handleAdd(n);
      setCustomMl("");
      setCustomOpen(false);
    }
  };

  return (
    <section className="luxe-card relative overflow-hidden p-5">
      {/* Header */}
      <header className="flex items-start justify-between mb-4 relative">
        <div>
          <p className="caps-gold flex items-center gap-1.5">
            <Droplet className="size-3 gold-icon" fill="currentColor" /> Hidratação
          </p>
          <p className="font-mono text-3xl font-bold text-white tabular-nums tracking-tight mt-1">
            {todayMl}
            <span className="text-xs text-muted-foreground font-medium ml-1">ml</span>
            <span className="text-base text-muted-foreground font-medium mx-1.5">/</span>
            <span className="text-base text-[color:var(--gold)]">
              {(goalMl / 1000).toFixed(goalMl % 1000 === 0 ? 1 : 1)}L
            </span>
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              aria-label="Configurar meta"
              className="press rounded-full p-2 border border-[color:var(--gold)]/25 bg-white/[0.02] hover:bg-[color:var(--gold)]/10 transition-colors"
            >
              <Settings className="size-3.5 text-[color:var(--gold)] gold-icon" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 luxe-card p-4 border-0">
            <p className="caps-gold mb-2">Meta diária (ml)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={MIN_GOAL}
                max={MAX_GOAL}
                step={100}
                value={goalMl}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) setGoalMlRaw(v);
                }}
                onBlur={(e) => setGoalMl(Number(e.target.value) || MIN_GOAL)}
                className="w-full font-mono bg-black/40 border border-[color:var(--gold)]/30 rounded-lg px-2 py-1.5 text-white text-sm tabular-nums focus:outline-none focus:border-[color:var(--gold)]"
              />
              <span className="text-xs text-muted-foreground">ml</span>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-mono">
              min {MIN_GOAL} · max {MAX_GOAL}
            </p>
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {[2000, 2500, 2800, 3500].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoalMl(g)}
                  className={`py-1 rounded-md text-[10px] font-mono border transition-colors ${
                    goalMl === g
                      ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                      : "border-[color:var(--gold)]/20 text-muted-foreground hover:text-[color:var(--gold)] hover:border-[color:var(--gold)]/50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[color:var(--gold)]/10">
              <p className="caps-gold mb-2">Botão rápido (ml)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={2000}
                  step={10}
                  value={preferredMl}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) setPreferredMl(Math.max(10, Math.min(2000, v)));
                  }}
                  className="w-full font-mono bg-black/40 border border-[color:var(--gold)]/30 rounded-lg px-2 py-1.5 text-white text-sm tabular-nums focus:outline-none focus:border-[color:var(--gold)]"
                />
                <span className="text-xs text-muted-foreground">ml</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      {/* Body: weekly bars + action */}
      <div className="flex gap-4">
        {/* Left: weekday bars */}
        <ul className="flex-1 space-y-2">
          {days.map((iso) => {
            const ml = iso === today ? todayMl : weekMap[iso] ?? 0;
            const pct = Math.min(100, Math.round((ml / goalMl) * 100));
            const dow = new Date(iso + "T00:00:00").getDay();
            const label = WEEKDAYS_PT[dow];
            const isToday = iso === today;
            const completed = pct >= 100;

            return (
              <li
                key={iso}
                className={`flex items-center gap-3 transition-opacity ${
                  isToday ? "opacity-100" : "opacity-55"
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider w-7 ${
                    isToday
                      ? "text-[color:var(--gold)]"
                      : completed
                        ? "text-[color:var(--cyan)]"
                        : "text-muted-foreground/60"
                  }`}
                  style={
                    isToday
                      ? { textShadow: "0 0 8px rgb(255 215 0 / 0.55)" }
                      : completed
                        ? { textShadow: "0 0 6px rgb(56 189 248 / 0.6)" }
                        : undefined
                  }
                >
                  {label}
                </span>

                <div className="relative flex-1 h-1.5 rounded-full bg-white/[0.04] border border-white/[0.04] overflow-hidden">
                  <motion.div
                    key={isToday ? `today-${pulseKey}` : iso}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 110,
                      damping: 20,
                    }}
                    className="relative h-full rounded-full"
                    style={{
                      background: isToday
                        ? "linear-gradient(90deg, rgb(56 189 248 / 0.95), rgb(125 211 252 / 1))"
                        : "linear-gradient(90deg, rgb(56 189 248 / 0.45), rgb(125 211 252 / 0.6))",
                      boxShadow: isToday
                        ? "0 0 12px rgb(56 189 248 / 0.95), 0 0 22px rgb(56 189 248 / 0.45), inset 0 0 6px rgb(255 255 255 / 0.4)"
                        : completed
                          ? "0 0 6px rgb(56 189 248 / 0.5), inset 0 0 3px rgb(255 255 255 / 0.2)"
                          : "inset 0 0 3px rgb(255 255 255 / 0.1)",
                    }}
                  >
                    <AnimatePresence>
                      {isToday && pulseKey > 0 && (
                        <motion.span
                          key={`sweep-${pulseKey}`}
                          aria-hidden
                          initial={{ x: "-120%", opacity: 0.95 }}
                          animate={{ x: "220%", opacity: 0 }}
                          transition={{ duration: 1.1, ease: "easeOut" }}
                          className="absolute inset-y-0 w-1/3 rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgb(186 230 253 / 0.95), transparent)",
                            filter: "blur(2px)",
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <span
                  className={`font-mono text-[10px] tabular-nums w-8 text-right ${
                    isToday ? "text-[color:var(--gold)]" : "text-muted-foreground/70"
                  }`}
                >
                  {pct}%
                </span>
              </li>
            );
          })}
        </ul>

        {/* Right: primary + custom */}
        <div className="flex flex-col justify-center gap-2 w-24">
          <button
            onClick={() => handleAdd(preferredMl)}
            className="press group relative rounded-full px-3 py-3 bg-white/[0.03] backdrop-blur-md border border-[color:var(--gold)]/60 hover:border-[color:var(--gold)] transition-all"
            style={{
              boxShadow:
                "0 0 14px rgb(255 215 0 / 0.25), inset 0 0 10px rgb(255 215 0 / 0.07)",
            }}
          >
            <span className="flex items-center justify-center gap-1 text-[color:var(--gold)] font-mono text-sm font-bold">
              <Plus className="size-3.5" /> {preferredMl}
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/70 mt-0.5">
              ml
            </span>
          </button>

          <Popover open={customOpen} onOpenChange={setCustomOpen}>
            <PopoverTrigger asChild>
              <button
                className="press flex items-center justify-center gap-1 rounded-full px-2 py-1.5 bg-white/[0.02] backdrop-blur-md border border-[color:var(--cyan)]/30 hover:border-[color:var(--cyan)]/70 transition-all text-[color:var(--cyan)]/90 font-mono text-[10px] uppercase tracking-wider"
              >
                <SlidersHorizontal className="size-2.5" /> Custom
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 luxe-card p-3 border-0">
              <p className="caps-gold mb-2">Adicionar (ml)</p>
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={3000}
                  step={50}
                  value={customMl}
                  onChange={(e) => setCustomMl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitCustom();
                  }}
                  placeholder="ex: 350"
                  className="w-full font-mono bg-black/40 border border-[color:var(--gold)]/30 rounded-lg px-2 py-1.5 text-white text-sm tabular-nums focus:outline-none focus:border-[color:var(--gold)] placeholder:text-muted-foreground/40"
                />
                <button
                  onClick={submitCustom}
                  className="press rounded-md p-1.5 border border-[color:var(--gold)]/50 hover:border-[color:var(--gold)] text-[color:var(--gold)]"
                  aria-label="Adicionar"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Today's progress footer */}
      <div className="mt-4 pt-3 border-t border-[color:var(--gold)]/10 flex items-center justify-between">
        <span className="caps-mute">Hoje</span>
        <span className="font-mono text-sm text-[color:var(--gold)] tabular-nums">
          {todayPct}%
        </span>
      </div>
    </section>
  );
}
