import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICONS, type Habit } from "@/lib/habits";
import { HabitItem } from "./HabitItem";
import { cn } from "@/lib/utils";

type Props = {
  habits: Habit[];
  onAdd: (name: string, icon: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string, icon: string) => void;
};

export function HabitsCard({ habits, onAdd, onToggle, onDelete, onRename }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("Sparkles");

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), icon);
    setName("");
    setIcon("Sparkles");
    setOpen(false);
  };

  return (
    <section className="glass rounded-3xl p-6">
      <header className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold">Hábitos</h2>
          <p className="text-xs text-muted-foreground font-light mt-0.5">
            {habits.length === 0 ? "Adicione seu primeiro hábito" : `${habits.length} ativos hoje`}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-gold inline-flex items-center gap-1.5 px-4 h-9 text-xs font-bold uppercase tracking-wider"
        >
          <Plus className={cn("size-4 transition", open && "rotate-45")} />
          {open ? "Fechar" : "Novo Hábito"}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 mb-4 p-3 rounded-2xl bg-secondary/50 border border-border">
              <Input
                placeholder="Ex: Ler 20 minutos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((n) => {
                  const I = (Icons as any)[n];
                  return (
                    <button
                      key={n}
                      onClick={() => setIcon(n)}
                      className={cn(
                        "size-9 rounded-lg flex items-center justify-center transition",
                        icon === n
                          ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                          : "bg-card text-foreground hover:bg-accent",
                      )}
                    >
                      <I className="size-4" />
                    </button>
                  );
                })}
              </div>
              <Button onClick={submit} className="w-full">Adicionar hábito</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {habits.map((h) => (
            <HabitItem
              key={h.id}
              habit={h}
              onToggle={onToggle}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </AnimatePresence>
        {habits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Sparkles className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Sua lista está vazia</p>
          </div>
        )}
      </div>
    </section>
  );
}
