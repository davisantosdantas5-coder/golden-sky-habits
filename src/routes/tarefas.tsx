import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, CheckSquare } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tarefas")({
  component: TasksPage,
  head: () => ({
    meta: [
      { title: "HabitBolt — Tarefas" },
      { name: "description", content: "Lista de tarefas com check-in rápido." },
    ],
  }),
});

function TasksPage() {
  const { tasks, add, toggle, remove } = useTasks();
  const [title, setTitle] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    add(title.trim());
    setTitle("");
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <AppHeader title="Tarefas" subtitle={`${open.length} em aberto`} />

      <section className="rounded-3xl border border-border bg-[image:var(--gradient-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="O que você precisa fazer?"
            className="rounded-xl"
          />
          <Button onClick={submit} className="rounded-xl">
            <Plus className="size-4" />
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <AnimatePresence initial={false}>
          {[...open, ...done].map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggle(t.id)}
                className={cn(
                  "size-9 shrink-0 rounded-xl flex items-center justify-center transition-all",
                  t.done
                    ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {t.done && <Check className="size-5" strokeWidth={3} />}
              </motion.button>
              <p className={cn("flex-1 text-sm", t.done && "line-through text-muted-foreground")}>{t.title}</p>
              <Button size="icon" variant="ghost" className="size-8 hover:text-destructive" onClick={() => remove(t.id)}>
                <Trash2 className="size-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <CheckSquare className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma tarefa por aqui</p>
          </div>
        )}
      </section>
    </main>
  );
}
