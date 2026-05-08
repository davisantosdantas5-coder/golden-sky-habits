import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, CheckSquare, Target, Wallet, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/habitos", label: "Hábitos", icon: ListChecks },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/financas", label: "Finanças", icon: Wallet },
  { to: "/foco", label: "Foco", icon: Timer },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl bg-black/60 border-t border-[color:var(--cyan)]/15 shadow-[0_-8px_40px_-8px_oklch(0_0_0/0.8)]">
      <div className="mx-auto max-w-3xl grid grid-cols-6 px-2 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="press group flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors text-muted-foreground"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex items-center justify-center size-9 rounded-2xl transition-all",
                    isActive
                      ? "bg-[image:var(--gradient-bolt)] text-[color:var(--bolt-foreground)] shadow-[var(--shadow-bolt)]"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none transition-colors",
                    isActive ? "text-[color:var(--bolt)] text-glow-bolt" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
