import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import type { Wellness } from "@/lib/store";
import { lastNDays, dayLabel } from "@/lib/storage";

type Props = { history: Record<string, Wellness> };

export function WellnessTrends({ history }: Props) {
  const days = lastNDays(7);
  const data = days.map((iso) => {
    const w = history[iso];
    return {
      day: dayLabel(iso),
      Sono: w?.sleep ?? null,
      Produtividade: w?.productivity ?? null,
      Humor: w?.mood ?? null,
    };
  });

  return (
    <section className="glass rounded-3xl p-6">
      <header className="flex items-center gap-3 mb-4">
        <div className="size-9 rounded-2xl bg-[color:var(--cyan)]/15 border border-[color:var(--cyan)]/30 flex items-center justify-center">
          <TrendingUp className="size-4 text-[color:var(--cyan)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Tendências de Bem-estar</h2>
          <p className="text-xs text-muted-foreground font-light">Sua semana em um olhar</p>
        </div>
      </header>
      <div className="h-52 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} ticks={[0, 5, 10]} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            <Line type="monotone" dataKey="Sono" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Produtividade" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Humor" stroke="var(--chart-3)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
