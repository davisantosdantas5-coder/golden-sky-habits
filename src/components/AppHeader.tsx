import { LogOut, Settings, User as UserIcon, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const name =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email?.split("@")[0];
  const initial = (name ?? "H").slice(0, 1).toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      try {
        // ensure any cached supabase tokens are cleared
        Object.keys(localStorage)
          .filter((k) => k.startsWith("sb-"))
          .forEach((k) => localStorage.removeItem(k));
      } catch {
        /* noop */
      }
      navigate({ to: "/auth" });
    }
  };

  return (
    <header className="mb-5 flex items-center gap-3">
      <div className="size-11 rounded-2xl bg-[image:var(--gradient-bolt)] flex items-center justify-center shadow-[var(--shadow-bolt)]">
        <Zap className="size-5 text-[color:var(--bolt-foreground)]" fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <h1
          className="text-xl font-bold tracking-tight truncate"
          style={{ fontFamily: "'Inter', system-ui" }}
        >
          {title}
        </h1>
        <p className="text-xs text-muted-foreground truncate">
          {subtitle ??
            (name
              ? `Olá, ${name}`
              : new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }))}
        </p>
      </div>

      {user && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Perfil"
              className="press relative size-10 rounded-full p-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
                boxShadow: "0 0 14px rgb(255 215 0 / 0.35)",
              }}
            >
              <span className="flex size-full items-center justify-center rounded-full bg-[#020617] font-mono text-sm font-bold text-[color:var(--gold)]">
                {initial}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="glass-dropdown w-60 p-1.5 text-white border-0 shadow-none"
            >
              <div className="px-3 py-2.5">
                <p className="caps-gold">Conta</p>
                <p className="mt-1 truncate font-medium text-sm text-white">{name ?? "Usuário"}</p>
                {user.email && (
                  <p className="truncate text-[11px] text-muted-foreground font-mono">
                    {user.email}
                  </p>
                )}
              </div>
              <DropdownMenuSeparator className="bg-[color:var(--gold)]/20" />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  // wait for menu close animation, then open dialog
                  setTimeout(() => setProfileOpen(true), 80);
                }}
                className="glow-gold-hover rounded-lg px-3 py-2.5 text-sm focus:bg-transparent cursor-pointer"
              >
                <UserIcon className="size-4 mr-2.5 text-[color:var(--gold)] gold-icon" />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setPrefsOpen(true), 80);
                }}
                className="glow-gold-hover rounded-lg px-3 py-2.5 text-sm focus:bg-transparent cursor-pointer"
              >
                <Settings className="size-4 mr-2.5 text-[color:var(--gold)] gold-icon" />
                Preferências
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[color:var(--gold)]/20" />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  void handleSignOut();
                }}
                className="glow-gold-hover rounded-lg px-3 py-2.5 text-sm focus:bg-transparent cursor-pointer"
              >
                <LogOut className="size-4 mr-2.5 text-[color:var(--gold)] gold-icon" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
          <PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} />
        </>
      )}
    </header>
  );
}
