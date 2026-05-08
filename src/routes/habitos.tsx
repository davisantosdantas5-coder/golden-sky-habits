import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { HabitsCard } from "@/components/HabitsCard";
import { WellnessCard } from "@/components/WellnessCard";
import { WellnessTrends } from "@/components/WellnessTrends";
import { useHabits, useWellness } from "@/lib/store";

export const Route = createFileRoute("/habitos")({
  component: HabitsPage,
  head: () => ({
    meta: [
      { title: "HabitBolt — Hábitos & Bem-estar" },
      { name: "description", content: "Gerencie hábitos, faça check-in de bem-estar e veja tendências." },
    ],
  }),
});

function HabitsPage() {
  const { habits, add, toggle, remove, rename } = useHabits();
  const { data, today, set } = useWellness();

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 space-y-6">
      <AppHeader title="Hábitos" subtitle="Construa sua rotina" />
      <WellnessCard value={today} onChange={set} />
      <WellnessTrends history={data} />
      <HabitsCard habits={habits} onAdd={add} onToggle={toggle} onDelete={remove} onRename={rename} />
    </main>
  );
}
