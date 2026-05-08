import { motion } from "framer-motion";
import { Droplet, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  amount: number;
  goal: number;
  onAdd: (ml: number) => void;
  onReset: () => void;
};

export function WaterCard({ amount, goal, onAdd, onReset }: Props) {
  const pct = Math.min(100, Math.round((amount / goal) * 100));
  const liters = (amount / 1000).toFixed(2);
  const goalL = (goal / 1000).toFixed(1);
  const nearGoal = pct >= 80;

  return (
    <section className="glass rounded-3xl p-6 overflow-hidden relative">
      <header className="flex items-start justify-between mb-5 relative z-10">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Droplet className="size-4 text-[color:var(--cyan)]" fill="currentColor" />
            Hidratação
          </h2>
          <p className="text-xs text-muted-foreground font-light mt-0.5">Meta diária {goalL}L</p>
        </div>
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-white">
          {liters}
          <span className="text-sm text-muted-foreground font-light ml-0.5">L</span>
        </span>
      </header>

      <div className="relative h-36 rounded-2xl bg-black/40 border border-[color:var(--cyan)]/15 overflow-hidden mb-5 shadow-inner">
        <motion.div
          initial={false}
          animate={{ height: `${pct}%` }}
          transition={{ type: "spring", stiffness: 110, damping: 18 }}
          className="absolute inset-x-0 bottom-0 bg-[image:var(--gradient-water)]"
        >
          {/* Wave layer 1 */}
          <div
            aria-hidden
            className="absolute -top-3 left-0 h-6 opacity-80"
            style={{
              width: "200%",
              backgroundImage:
                "radial-gradient(circle at 10% 100%, transparent 12px, var(--water) 12px), radial-gradient(circle at 30% 100%, var(--water) 12px, transparent 12px)",
              backgroundSize: "40px 24px",
              animation: "wave 3.5s linear infinite",
            }}
          />
          {/* Wave layer 2 */}
          <div
            aria-hidden
            className="absolute -top-2 left-0 h-4 opacity-60 mix-blend-screen"
            style={{
              width: "200%",
              background:
                "repeating-radial-gradient(circle at 50% 100%, oklch(0.95 0.05 220 / 0.7) 0 8px, transparent 8px 18px)",
              animation: "wave-slow 5s linear infinite",
            }}
          />
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold text-white tabular-nums tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {pct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => onAdd(250)}
          className="press rounded-2xl h-12 bg-[image:var(--gradient-bolt)] text-[color:var(--bolt-foreground)] font-bold shadow-[var(--shadow-bolt)] hover:brightness-110"
        >
          <Plus className="size-4" /> 250ml
        </Button>
        <Button
          onClick={() => onAdd(500)}
          className="press rounded-2xl h-12 bg-[image:var(--gradient-bolt)] text-[color:var(--bolt-foreground)] font-bold shadow-[var(--shadow-bolt)] hover:brightness-110"
        >
          <Plus className="size-4" /> 500ml
        </Button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="ghost" size="sm" onClick={() => onAdd(-250)} className="press flex-1 rounded-xl text-muted-foreground">
          <Minus className="size-3.5" /> 250ml
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} className="press flex-1 rounded-xl text-muted-foreground">
          Zerar
        </Button>
      </div>

      {nearGoal && (
        <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-[color:var(--bolt)]/30 shadow-[var(--shadow-bolt)]" />
      )}
    </section>
  );
}
