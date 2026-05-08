import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import type { Wellness } from "@/lib/store";
import { cn } from "@/lib/utils";

const MOOD_EMOJI = ["😞", "😟", "😐", "🙂", "😊", "😄", "😁", "🤩", "😍", "🥳", "🚀"];

type Props = { value: Wellness; onChange: (patch: Partial<Wellness>) => void };

export function WellnessCard({ value, onChange }: Props) {
  return (
    <section className="glass rounded-3xl p-6">
      <header className="flex items-center gap-3 mb-5">
        <div className="size-9 rounded-2xl bg-[color:var(--cyan)]/15 border border-[color:var(--cyan)]/30 flex items-center justify-center">
          <HeartPulse className="size-4 text-[color:var(--cyan)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Como está seu dia?</h2>
          <p className="text-xs text-muted-foreground font-light">Faça seu check-in de bem-estar</p>
        </div>
      </header>

      <Row label="Sono (horas)" value={value.sleep} onChange={(v) => onChange({ sleep: v })} />
      <Row label="Produtividade" value={value.productivity} onChange={(v) => onChange({ productivity: v })} />
      <Row
        label="Humor"
        value={value.mood}
        onChange={(v) => onChange({ mood: v })}
        renderItem={(n) => <span className="text-base leading-none">{MOOD_EMOJI[n]}</span>}
      />
    </section>
  );
}

function Row({
  label,
  value,
  onChange,
  renderItem,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  renderItem?: (n: number) => React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-base font-bold text-[color:var(--cyan)] text-glow-cyan tabular-nums">{value}</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
        {Array.from({ length: 11 }, (_, n) => {
          const active = n === value;
          return (
            <motion.button
              key={n}
              whileTap={{ scale: 0.88 }}
              onClick={() => onChange(n)}
              className={cn(
                "press shrink-0 snap-start size-10 rounded-2xl text-sm font-bold flex items-center justify-center transition-all",
                active
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-cyan)] border border-[color:var(--cyan)]/60"
                  : "bg-white/5 border border-white/10 text-foreground hover:border-[color:var(--cyan)]/30",
              )}
            >
              {renderItem ? renderItem(n) : n}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
