import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Droplet, CheckSquare, Target } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { WaterCard } from "@/components/WaterCard";
import { useHabits, useWater, useTasks, useGoals, useWellness, WATER_GOAL } from "@/lib/store";
import { isCheckedToday, streak } from "@/lib/habits";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "HabitBolt — Dashboard" },
      { name: "description", content: "Visão geral diária: hábitos, hidratação, tarefas e metas." },
    ],
  }),
});

function Dashboard() {
  const { habits } = useHabits();
  const water = useWater();
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { today: wellness } = useWellness();

  const checkedToday = habits.filter(isCheckedToday).length;
  const bestStreak = Math.max(0, ...habits.map(streak));
  const tasksOpen = tasks.filter((t) => !t.done).length;
  const goalsAvg =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce((s, g) => s + Math.min(100, (g.current / Math.max(1, g.target)) * 100), 0) / goals.length,
        );

  const stats = [
    { label: "Hábitos hoje", value: `${checkedToday}/${habits.length || 0}`, icon: Flame, to: "/habitos" as const },
    { label: "Tarefas abertas", value: tasksOpen, icon: CheckSquare, to: "/tarefas" as const },
    { label: "Metas", value: `${goalsAvg}%`, icon: Target, to: "/metas" as const },
    { label: "Hidratação", value: `${Math.round((water.today / WATER_GOAL) * 100)}%`, icon: Droplet, to: "/" as const },
  ];

  const now = new Date();
  const weekday = now.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase();
  const day = now.getDate();
  const monthYear = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 space-y-6">
      <AppHeader title="HabitBolt" />

      {/* Date hero card — graphite #121212 @ 80% with backdrop-blur */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="graphite-card tilt rounded-3xl p-6 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-medium">
            {weekday}
          </p>
          <p className="mt-1 text-6xl font-extrabold tabular-nums tracking-tighter text-white leading-none" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            {day}
          </p>
          <p className="mt-2 text-xs text-muted-foreground capitalize font-light">{monthYear}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Sequência</div>
          <div className="mt-1 text-3xl font-extrabold tabular-nums text-[color:var(--bolt)] text-glow-bolt">
            {bestStreak}<span className="text-base font-bold text-muted-foreground ml-0.5">d</span>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <Link
              to={s.to}
              className="press graphite-card block p-5"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-2xl bg-[color:var(--cyan)]/10 border border-[color:var(--cyan)]/20 flex items-center justify-center">
                  <s.icon className="size-[18px] text-[color:var(--cyan)]" strokeWidth={1.5} />
                </div>
                <ArrowRight className="size-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="mt-4 text-3xl font-extrabold tabular-nums tracking-tight text-white">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium mt-1">{s.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <WaterCard amount={water.today} goal={WATER_GOAL} onAdd={water.add} onReset={water.reset} />

        <section className="glass rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-4">Bem-estar de hoje</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Mini label="Sono" value={`${wellness.sleep}h`} />
            <Mini label="Foco" value={wellness.productivity} />
            <Mini label="Humor" value={wellness.mood} />
          </div>
          <Link
            to="/habitos"
            className="press mt-4 flex items-center justify-center gap-1.5 text-xs text-[color:var(--cyan)] font-semibold"
          >
            Atualizar check-in <ArrowRight className="size-3.5" />
          </Link>
        </section>

        <section className="glass-bolt rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Maior sequência</h2>
            <span className="text-3xl font-extrabold text-[color:var(--bolt)] text-glow-bolt tabular-nums">{bestStreak}d</span>
          </div>
          <p className="text-xs text-muted-foreground font-light">Continue marcando seus hábitos para manter a chama acesa.</p>
        </section>
      </div>
    </main>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
      <div className="text-2xl font-extrabold tabular-nums text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium mt-1">{label}</div>
    </div>
  );
}
