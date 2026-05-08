import { useLocalStorage, todayKey } from "./storage";
import type { Habit } from "./habits";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Wellness = { sleep: number; productivity: number; mood: number };
export type Task = { id: string; title: string; done: boolean; createdAt: string };
export type Goal = { id: string; title: string; target: number; current: number; unit?: string };
export type Tx = { id: string; title: string; amount: number; type: "in" | "out"; date: string; category?: string };
export type FocusSession = { id: string; minutes: number; date: string };

export const WATER_GOAL = 2000;

// ---------- HABITS (Supabase) ----------
export function useHabits() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;

  const { data: habits = [] } = useQuery({
    queryKey: ["habits", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Habit[]> => {
      const [{ data: rows, error: e1 }, { data: checks, error: e2 }] = await Promise.all([
        supabase.from("habits").select("*").order("created_at", { ascending: true }),
        supabase.from("habit_checkins").select("habit_id, date"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const map = new Map<string, string[]>();
      (checks ?? []).forEach((c: any) => {
        const arr = map.get(c.habit_id) ?? [];
        arr.push(c.date);
        map.set(c.habit_id, arr);
      });
      return (rows ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        icon: r.icon,
        color: "primary",
        history: (map.get(r.id) ?? []).sort(),
        createdAt: r.created_at,
      }));
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["habits", userId] });

  const addM = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("habits").insert({ user_id: userId, name, icon });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const renameM = useMutation({
    mutationFn: async ({ id, name, icon }: { id: string; name: string; icon: string }) => {
      const { error } = await supabase.from("habits").update({ name, icon }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleM = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Not authenticated");
      const today = todayKey();
      const habit = habits.find((h) => h.id === id);
      const has = habit?.history.includes(today);
      if (has) {
        const { error } = await supabase
          .from("habit_checkins")
          .delete()
          .eq("habit_id", id)
          .eq("date", today);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_checkins")
          .insert({ habit_id: id, user_id: userId, date: today });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  return {
    habits,
    add: (name: string, icon: string) => addM.mutate({ name, icon }),
    toggle: (id: string) => toggleM.mutate(id),
    remove: (id: string) => removeM.mutate(id),
    rename: (id: string, name: string, icon: string) => renameM.mutate({ id, name, icon }),
  };
}

// ---------- WATER (Supabase) ----------
export function useWater() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const today = todayKey();

  const { data: amount = 0 } = useQuery({
    queryKey: ["water", userId, today],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("water_intake")
        .select("amount_ml")
        .eq("date", today)
        .maybeSingle();
      if (error) throw error;
      return data?.amount_ml ?? 0;
    },
  });

  const upsert = async (newAmount: number) => {
    if (!userId) return;
    const { error } = await supabase
      .from("water_intake")
      .upsert({ user_id: userId, date: today, amount_ml: Math.max(0, newAmount) }, { onConflict: "user_id,date" });
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["water", userId, today] });
  };

  return {
    today: amount,
    add: (ml: number) => upsert(amount + ml),
    reset: () => upsert(0),
  };
}

// ---------- WELLNESS (Supabase) ----------
export function useWellness() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const today = todayKey();

  const { data = {} } = useQuery({
    queryKey: ["wellness", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Record<string, Wellness>> => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data, error } = await supabase
        .from("wellness_logs")
        .select("date, sleep, productivity, mood")
        .gte("date", since.toISOString().slice(0, 10));
      if (error) throw error;
      const out: Record<string, Wellness> = {};
      (data ?? []).forEach((r: any) => {
        out[r.date] = { sleep: r.sleep, productivity: r.productivity, mood: r.mood };
      });
      return out;
    },
  });

  const current: Wellness = data[today] ?? { sleep: 7, productivity: 5, mood: 5 };

  const set = async (patch: Partial<Wellness>) => {
    if (!userId) return;
    const merged = { ...current, ...patch };
    qc.setQueryData<Record<string, Wellness>>(["wellness", userId], (prev) => ({
      ...(prev ?? {}),
      [today]: merged,
    }));
    const { error } = await supabase
      .from("wellness_logs")
      .upsert({ user_id: userId, date: today, ...merged }, { onConflict: "user_id,date" });
    if (error) throw error;
  };

  return { data, today: current, set };
}


export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("pulse.tasks", []);
  return {
    tasks,
    add: (title: string) =>
      setTasks((t) => [{ id: crypto.randomUUID(), title, done: false, createdAt: new Date().toISOString() }, ...t]),
    toggle: (id: string) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x))),
    remove: (id: string) => setTasks((t) => t.filter((x) => x.id !== id)),
  };
}

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<Goal[]>("pulse.goals", []);
  return {
    goals,
    add: (title: string, target: number, unit?: string) =>
      setGoals((g) => [...g, { id: crypto.randomUUID(), title, target, current: 0, unit }]),
    inc: (id: string, delta: number) =>
      setGoals((g) => g.map((x) => (x.id === id ? { ...x, current: Math.max(0, x.current + delta) } : x))),
    remove: (id: string) => setGoals((g) => g.filter((x) => x.id !== id)),
  };
}

export function useFinance() {
  const [tx, setTx] = useLocalStorage<Tx[]>("pulse.finance", []);
  return {
    tx,
    add: (t: Omit<Tx, "id" | "date">) =>
      setTx((all) => [{ ...t, id: crypto.randomUUID(), date: new Date().toISOString() }, ...all]),
    remove: (id: string) => setTx((all) => all.filter((x) => x.id !== id)),
  };
}

export function useFocus() {
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>("pulse.focus", []);
  return {
    sessions,
    log: (minutes: number) =>
      setSessions((s) => [{ id: crypto.randomUUID(), minutes, date: new Date().toISOString() }, ...s]),
  };
}
