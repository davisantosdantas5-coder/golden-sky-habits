import { LogOut, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, signOut } = useAuth();
  const name = (user?.user_metadata?.display_name as string | undefined) ?? user?.email?.split("@")[0];
  return (
    <header className="mb-5 flex items-center gap-3">
      <div className="size-11 rounded-2xl bg-[image:var(--gradient-bolt)] flex items-center justify-center shadow-[var(--shadow-bolt)]">
        <Zap className="size-5 text-[color:var(--bolt-foreground)]" fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold tracking-tight truncate" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{title}</h1>
        <p className="text-xs text-muted-foreground truncate">
          {subtitle ?? (name ? `Olá, ${name}` : new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }))}
        </p>
      </div>
      {user && (
        <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sair" className="rounded-full">
          <LogOut className="size-4" />
        </Button>
      )}
    </header>
  );
}
