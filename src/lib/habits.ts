import { todayKey } from "./storage";

export type Habit = {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // token name e.g. 'primary'
  history: string[]; // ISO dates checked
  createdAt: string;
};

export const ICONS = [
  "Dumbbell", "BookOpen", "Brain", "Apple", "Moon", "Sun",
  "Footprints", "Heart", "Coffee", "Music", "Leaf", "Sparkles",
  "Pencil", "Code", "Bike", "Flame",
] as const;

export function isCheckedToday(h: Habit) {
  return h.history.includes(todayKey());
}

export function toggleToday(h: Habit): Habit {
  const t = todayKey();
  const has = h.history.includes(t);
  return { ...h, history: has ? h.history.filter((d) => d !== t) : [...h.history, t].sort() };
}

export function streak(h: Habit): number {
  if (h.history.length === 0) return 0;
  const set = new Set(h.history);
  let count = 0;
  const d = new Date();
  // if not checked today, streak might still be yesterday-based; we count from today backwards but allow today missing only if no history at all
  if (!set.has(d.toISOString().slice(0, 10))) {
    d.setDate(d.getDate() - 1);
  }
  while (set.has(d.toISOString().slice(0, 10))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function completionLast7(h: Habit): number {
  const days: string[] = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const t = new Date(d);
    t.setDate(d.getDate() - i);
    days.push(t.toISOString().slice(0, 10));
  }
  const done = days.filter((day) => h.history.includes(day)).length;
  return Math.round((done / 7) * 100);
}
