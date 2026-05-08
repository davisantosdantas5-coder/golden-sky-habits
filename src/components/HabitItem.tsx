import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Pencil, Trash2, X } from "lucide-react";
import * as Icons from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Habit, isCheckedToday, streak, ICONS } from "@/lib/habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string, icon: string) => void;
};

export function HabitItem({ habit, onToggle, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);

  const checked = isCheckedToday(habit);
  const s = streak(habit);
  const Icon = (Icons as any)[habit.icon] ?? Icons.Sparkles;
  const prevChecked = useRef(checked);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (checked && !prevChecked.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1400);
      return () => clearTimeout(t);
    }
    prevChecked.current = checked;
  }, [checked]);

  const save = () => {
    if (!name.trim()) return;
    onRename(habit.id, name.trim(), icon);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={pulse ? { opacity: 1, y: 0, scale: [1, 1.025, 1] } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "group rounded-2xl p-4 glass transition-shadow",
        pulse && "glass-bolt animate-pulse-bolt",
      )}
    >
      {editing ? (
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {ICONS.map((n) => {
              const I = (Icons as any)[n];
              return (
                <button
                  key={n}
                  onClick={() => setIcon(n)}
                  className={cn(
                    "size-9 rounded-lg flex items-center justify-center transition",
                    icon === n ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent",
                  )}
                >
                  <I className="size-4" />
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} className="flex-1">Salvar</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onToggle(habit.id)}
            className={cn(
              "press relative size-12 shrink-0 rounded-2xl flex items-center justify-center transition-all",
              checked
                ? "bg-[image:var(--gradient-bolt)] text-[color:var(--bolt-foreground)] shadow-[var(--shadow-bolt)]"
                : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:border-[color:var(--cyan)]/40",
            )}
          >
            <AnimatePresence mode="wait">
              {checked ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="size-6" strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Icon className="size-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="min-w-0 flex-1">
            <p className={cn("font-medium truncate", checked && "text-muted-foreground line-through")}>
              {habit.name}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Flame className={cn("size-3.5", s > 0 && "text-[color:var(--streak)]")} />
              <span className={cn(s > 0 && "text-[color:var(--streak)] font-semibold")}>
                {s} {s === 1 ? "dia" : "dias"}
              </span>
            </div>
          </div>

          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition md:opacity-100">
            <Button size="icon" variant="ghost" className="size-8" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="size-8 hover:text-destructive" onClick={() => onDelete(habit.id)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
