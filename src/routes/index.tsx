import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Flame, Target, Zap } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SmartWaterCard } from "@/components/SmartWaterCard";
import { useGoals, useHabits, useTasks, useWellness } from "@/lib/store";
import { isCheckedToday, streak } from "@/lib/habits";
import { dayLabel, lastNDays } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "HabitBolt — Dashboard" },
      { name: "description", content: "Painel tático Luxury Tech: hábitos, XP, hidratação e metas." },
    ],
  }),
});

function Dashboard() {
  const { habits } = useHabits();
  
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

  // XP: 12 pts per check-in over the last 7 days
  const days = lastNDays(7);
  const xpData = days.map((iso) => {
    const completed = habits.filter((h) => h.history.includes(iso)).length;
    return { day: dayLabel(iso), xp: completed * 12 };
  });
  const xpTotal = xpData.reduce((s, d) => s + d.xp, 0);
  const xpToday = xpData[xpData.length - 1]?.xp ?? 0;

  const now = new Date();
  const weekday = now.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase();
  const day = now.getDate();
  const monthYear = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <AppHeader title="HabitBolt" />

      {/* HERO — master card, irradia luz dourada nos cards de baixo */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="luxe-card luxe-hero p-6 flex items-center justify-between"
      >
        <div>
          <p className="caps-gold">{weekday}</p>
          <p className="mt-1 font-mono text-7xl font-bold tabular-nums tracking-tighter text-white leading-[0.9]">
            {day}
          </p>
          <p className="mt-2 caps-mute capitalize">{monthYear}</p>
        </div>
        <div className="text-right">
          <p className="caps-gold">Sequência</p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-[color:var(--gold)] text-glow-bolt">
            {bestStreak}
            <span className="text-base font-medium text-muted-foreground ml-0.5">d</span>
          </p>
        </div>
      </motion.section>

      {/* BENTO GRID — densidade tática */}
      <div className="grid grid-cols-6 gap-3">
        {/* XP — wide area chart */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="luxe-card col-span-6 p-5"
        >
          <header className="flex items-start justify-between mb-3">
            <div>
              <p className="caps-gold flex items-center gap-1.5">
                <Zap className="size-3 gold-icon" /> XP · 7D
              </p>
              <p className="font-mono text-4xl font-bold text-white tabular-nums tracking-tight mt-1">
                {xpTotal}
                <span className="text-sm text-muted-foreground font-medium ml-1.5">pts</span>
              </p>
            </div>
            <div className="text-right">
              <p className="caps-mute">Hoje</p>
              <p className="font-mono text-xl text-[color:var(--gold)] tabular-nums mt-0.5">+{xpToday}</p>
            </div>
          </header>

          <div className="h-28 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity={0.55} />
                    <stop offset="60%" stopColor="#B8860B" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#020617" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="oklch(0.55 0.02 265)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, "dataMax + 6"]} />
                <Tooltip
                  cursor={{ stroke: "#FFD700", strokeOpacity: 0.3, strokeWidth: 1 }}
                  contentStyle={{
                    background: "rgb(2 6 23 / 0.95)",
                    border: "1px solid rgb(255 215 0 / 0.4)",
                    borderRadius: 12,
                    fontSize: 11,
                    color: "white",
                  }}
                  formatter={(v: number) => [`${v} XP`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#FFD700"
                  strokeWidth={1.25}
                  fill="url(#xpFill)"
                  dot={false}
                  activeDot={{ r: 3, fill: "#FFD700", stroke: "#020617", strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* WATER — Smart weekly tracker with neon flow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="col-span-6"
        >
          <SmartWaterCard />
        </motion.div>

        {/* HABITS — compact tile */}
        <CompactTile
          to="/habitos"
          icon={Flame}
          label="Hábitos"
          value={`${checkedToday}/${habits.length || 0}`}
          delay={0.15}
        />

        {/* TASKS */}
        <CompactTile
          to="/tarefas"
          icon={ArrowUpRight}
          label="Tarefas"
          value={tasksOpen}
          delay={0.2}
          span={3}
        />

        {/* GOALS */}
        <CompactTile to="/metas" icon={Target} label="Metas" value={`${goalsAvg}%`} delay={0.25} span={3} />

        {/* WELLNESS — wide bottom strip */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="luxe-card col-span-6 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="caps-gold">Bem-estar · Hoje</p>
            <Link to="/habitos" className="caps-mute hover:text-[color:var(--gold)] transition-colors">
              Atualizar →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Mini label="Sono" value={`${wellness.sleep}h`} />
            <Mini label="Foco" value={wellness.productivity} />
            <Mini label="Humor" value={wellness.mood} />
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function CompactTile({
  to,
  icon: Icon,
  label,
  value,
  delay,
  span = 3,
}: {
  to: "/habitos" | "/tarefas" | "/metas";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  delay: number;
  span?: number;
}) {
  const colSpan = span === 3 ? "col-span-3" : "col-span-2";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={colSpan}
    >
      <Link to={to} className="press luxe-card block p-4 h-full">
        <div className="flex items-center justify-between">
          <Icon className="size-4 text-[color:var(--gold)] gold-icon" />
          <ArrowUpRight className="size-3 text-muted-foreground" />
        </div>
        <p className="font-mono text-2xl font-bold text-white tabular-nums tracking-tight mt-3">{value}</p>
        <p className="caps-mute mt-0.5">{label}</p>
      </Link>
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-[color:var(--gold)]/15 p-3 text-center">
      <p className="font-mono text-xl font-bold text-white tabular-nums">{value}</p>
      <p className="caps-mute mt-1">{label}</p>
    </div>
  );
}

/** SVG ring that hugs the inner border with gold gradient progress */
function RingBorder({ pct }: { pct: number }) {
  return (
    <svg
      aria-hidden
      className="absolute inset-1.5 pointer-events-none"
      width="calc(100% - 12px)"
      height="calc(100% - 12px)"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <rect
        x="0.5"
        y="0.5"
        width="99"
        height="99"
        rx="6"
        ry="6"
        fill="none"
        stroke="url(#ringGold)"
        strokeWidth="0.6"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${pct} ${100 - pct}`}
        vectorEffect="non-scaling-stroke"
        style={{ filter: "drop-shadow(0 0 4px rgb(255 215 0 / 0.6))" }}
      />
    </svg>
  );
}
