import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, Target } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGoals } from "@/lib/store";

export const Route = createFileRoute("/metas")({
  component: GoalsPage,
  head: () => ({
    meta: [
      { title: "HabitBolt — Metas" },
      { name: "description", content: "Acompanhe o progresso das suas metas pessoais." },
    ],
  }),
});

function GoalsPage() {
  const { goals, add, inc, remove } = useGoals();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");

  const submit = () => {
    const n = Number(target);
    if (!title.trim() || !n) return;
    add(title.trim(), n, unit.trim() || undefined);
    setTitle("");
    setTarget("");
    setUnit("");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <AppHeader title="Metas" subtitle={`${goals.length} ativas`} />

      <section className="rounded-3xl border border-border bg-[image:var(--gradient-card)] p-4 shadow-[var(--shadow-card)] space-y-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Ler livros" className="rounded-xl" />
        <div className="flex gap-2">
          <Input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Meta"
            className="rounded-xl"
          />
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unidade" className="rounded-xl" />
          <Button onClick={submit} className="rounded-xl">
            <Plus className="size-4" />
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <AnimatePresence initial={false}>
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / Math.max(1, g.target)) * 100));
            return (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold">{g.title}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {g.current} / {g.target} {g.unit}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="size-8 hover:text-destructive" onClick={() => remove(g.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className={pct >= 100
                      ? "h-full bg-[image:var(--gradient-bolt)] shadow-[var(--shadow-bolt)]"
                      : "h-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]"}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={pct >= 100 ? "text-xs font-bold tabular-nums text-[color:var(--bolt)]" : "text-xs text-primary font-bold tabular-nums"}>{pct}%</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => inc(g.id, -1)}>
                      <Minus className="size-3.5" />
                    </Button>
                    <Button size="sm" className="rounded-xl" onClick={() => inc(g.id, 1)}>
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Target className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Defina sua primeira meta</p>
          </div>
        )}
      </section>
    </main>
  );
}
