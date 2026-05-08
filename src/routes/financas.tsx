import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFinance } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/financas")({
  component: FinancePage,
  head: () => ({
    meta: [
      { title: "HabitBolt — Finanças" },
      { name: "description", content: "Controle simples de entradas e saídas." },
    ],
  }),
});

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

function FinancePage() {
  const { tx, add, remove } = useFinance();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"in" | "out">("out");

  const income = tx.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const submit = () => {
    const n = Number(amount.replace(",", "."));
    if (!title.trim() || !n) return;
    add({ title: title.trim(), amount: n, type });
    setTitle("");
    setAmount("");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <AppHeader title="Finanças" subtitle="Suas movimentações" />

      <section className="rounded-3xl border border-border bg-[image:var(--gradient-card)] p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo atual</p>
        <p
          className={cn(
            "text-3xl font-bold tabular-nums mt-1",
            balance >= 0 ? "text-primary" : "text-destructive",
          )}
        >
          {fmt(balance)}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="rounded-2xl bg-secondary/60 border border-border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowDownLeft className="size-3.5 text-[color:var(--success)]" /> Entradas
            </div>
            <p className="font-bold tabular-nums mt-1">{fmt(income)}</p>
          </div>
          <div className="rounded-2xl bg-secondary/60 border border-border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="size-3.5 text-destructive" /> Saídas
            </div>
            <p className="font-bold tabular-nums mt-1">{fmt(expense)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] space-y-2">
        <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-xl">
          {(["out", "in"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "py-1.5 rounded-lg text-sm font-medium transition",
                type === t ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground",
              )}
            >
              {t === "out" ? "Saída" : "Entrada"}
            </button>
          ))}
        </div>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Descrição" className="rounded-xl" />
        <div className="flex gap-2">
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="rounded-xl"
          />
          <Button onClick={submit} className="rounded-xl">
            <Plus className="size-4" />
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <AnimatePresence initial={false}>
          {tx.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
            >
              <div
                className={cn(
                  "size-9 rounded-xl flex items-center justify-center",
                  t.type === "in" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-destructive/15 text-destructive",
                )}
              >
                {t.type === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(t.date).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span className={cn("font-bold tabular-nums text-sm", t.type === "in" ? "text-[color:var(--success)]" : "text-destructive")}>
                {t.type === "in" ? "+" : "-"} {fmt(t.amount)}
              </span>
              <Button size="icon" variant="ghost" className="size-8 hover:text-destructive" onClick={() => remove(t.id)}>
                <Trash2 className="size-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        {tx.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Wallet className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma movimentação</p>
          </div>
        )}
      </section>
    </main>
  );
}
