import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Plus, Settings } from "lucide-react";
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

export function SmartWaterCard() {
  const { user } = useAuth();
  const water = useWater();
  const [goalMl, setGoalMl] = useLocalStorage<number>("habitbolt.water.goal", 2400);
  const [pulseKey, setPulseKey] = useState(0);

  const days = useMemo(() => lastNDays(7), []);
  const today = todayKey();

  const { data: weekMap = {} } = useQuery({
    queryKey: ["water-week", user?.id, days[0], today, water.today],
    enabled: !!user?.id,
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("water_intake")
        .select("date, amount_ml")
        .gte("date", days[0])
        .lte("date", today);
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
    water.add(ml);
    setPulseKey((k) => k + 1);
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
            <span className="text-base text-[color:var(--gold)]">{(goalMl / 1000).toFixed(1)}L</span>
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
          <PopoverContent
            align="end"
            className="w-56 luxe-card p-4 border-0"
          >
            <p className="caps-gold mb-2">Meta diária</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={500}
                max={6000}
                step={100}
                value={goalMl}
                onChange={(e) => setGoalMl(Math.max(500, Number(e.target.value) || 0))}
                className="w-full font-mono bg-black/40 border border-[color:var(--gold)]/30 rounded-lg px-2 py-1.5 text-white text-sm tabular-nums focus:outline-none focus:border-[color:var(--gold)]"
              />
              <span className="text-xs text-muted-foreground">ml</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[2000, 2400, 3000].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoalMl(g)}
                  className="flex-1 py-1 rounded-md text-[10px] font-mono border border-[color:var(--gold)]/20 text-muted-foreground hover:text-[color:var(--gold)] hover:border-[color:var(--gold)]/50 transition-colors"
                >
                  {g}
                </button>
              ))}
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
              <li key={iso} className="flex items-center gap-3">
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider w-7 ${
                    isToday
                      ? "text-[color:var(--gold)]"
                      : completed
                        ? "text-[color:var(--cyan)]"
                        : "text-muted-foreground/60"
                  }`}
                  style={
                    completed
                      ? { textShadow: "0 0 6px rgb(56 189 248 / 0.7)" }
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
                      stiffness: 90,
                      damping: 18,
                      duration: 0.7,
                    }}
                    className="relative h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(56 189 248 / 0.65), rgb(125 211 252 / 0.85))",
                      boxShadow: completed || isToday
                        ? "0 0 8px rgb(56 189 248 / 0.8), inset 0 0 4px rgb(255 255 255 / 0.3)"
                        : "inset 0 0 3px rgb(255 255 255 / 0.15)",
                    }}
                  >
                    {/* Glow sweep on today's bar after add */}
                    <AnimatePresence>
                      {isToday && pulseKey > 0 && (
                        <motion.span
                          key={`sweep-${pulseKey}`}
                          aria-hidden
                          initial={{ x: "-120%", opacity: 0.9 }}
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

                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70 w-8 text-right">
                  {pct}%
                </span>
              </li>
            );
          })}
        </ul>

        {/* Right: action pills */}
        <div className="flex flex-col justify-center gap-2 w-20">
          <button
            onClick={() => handleAdd(100)}
            className="press group relative rounded-full px-3 py-2.5 bg-white/[0.03] backdrop-blur-md border border-[color:var(--cyan)]/40 hover:border-[color:var(--cyan)] transition-all"
            style={{
              boxShadow:
                "0 0 12px rgb(56 189 248 / 0.25), inset 0 0 8px rgb(56 189 248 / 0.08)",
            }}
          >
            <span className="flex items-center justify-center gap-1 text-[color:var(--cyan)] font-mono text-xs font-bold">
              <Plus className="size-3" /> 100
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-0.5">
              ml
            </span>
          </button>
          <button
            onClick={() => handleAdd(250)}
            className="press rounded-full px-3 py-2 bg-white/[0.02] backdrop-blur-md border border-[color:var(--cyan)]/25 hover:border-[color:var(--cyan)]/60 transition-all text-[color:var(--cyan)]/90 font-mono text-[11px] font-semibold"
          >
            +250
          </button>
          <button
            onClick={() => handleAdd(500)}
            className="press rounded-full px-3 py-2 bg-white/[0.02] backdrop-blur-md border border-[color:var(--cyan)]/25 hover:border-[color:var(--cyan)]/60 transition-all text-[color:var(--cyan)]/90 font-mono text-[11px] font-semibold"
          >
            +500
          </button>
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
