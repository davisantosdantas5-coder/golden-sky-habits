import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { type Habit, completionLast7 } from "@/lib/habits";
import { dayLabel, lastNDays } from "@/lib/storage";

type Props = { habits: Habit[]; waterHistory: Record<string, number>; waterGoal: number };

export function StatsCard({ habits, waterHistory, waterGoal }: Props) {
  const days = lastNDays(7);
  const data = days.map((iso) => {
    const completed = habits.filter((h) => h.history.includes(iso)).length;
    const total = habits.length || 1;
    return {
      day: dayLabel(iso),
      iso,
      pct: Math.round((completed / total) * 100),
      completed,
      water: waterHistory[iso] ?? 0,
    };
  });

  const weekAvg = Math.round(data.reduce((s, d) => s + d.pct, 0) / data.length);
  const totalChecks = habits.reduce(
    (s, h) => s + h.history.filter((d) => days.includes(d)).length,
    0,
  );
  const bestStreak = Math.max(0, ...habits.map((h) => h.history.length));

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Estatísticas
          </h2>
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-primary">{weekAvg}%</div>
          <div className="text-xs text-muted-foreground">conclusão</div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="Check-ins" value={totalChecks} />
        <Stat label="Hábitos" value={habits.length} />
        <Stat label="Recorde" value={bestStreak} suffix="d" />
      </div>

      <div className="h-44 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 50, 100]} />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, "Conclusão"]}
            />
            <Bar dataKey="pct" radius={[8, 8, 4, 4]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.pct >= 80 ? "var(--primary)" : d.pct >= 40 ? "var(--chart-3)" : "var(--muted)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">Hidratação semanal</p>
        <div className="flex items-end gap-1.5 h-16">
          {data.map((d) => {
            const pct = Math.min(100, (d.water / waterGoal) * 100);
            return (
              <div key={d.iso} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex-1 bg-secondary rounded-md overflow-hidden flex items-end">
                  <div
                    className="w-full bg-[image:var(--gradient-water)] transition-all"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 border border-border p-3 text-center">
      <div className="text-xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
