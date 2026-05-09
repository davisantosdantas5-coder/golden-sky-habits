import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Pencil, Flame, Droplets, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — HabitBolt" },
      { name: "description", content: "Seu perfil e estatísticas gerais." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const name =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Dantass";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const initial = name.slice(0, 1).toUpperCase();

  // Stats from localStorage (best-effort)
  const stats = readStats();

  return (
    <div className="min-h-screen deep-space text-white">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-md px-4 pt-5 pb-24"
      >
        {/* Back */}
        <header className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            aria-label="Voltar"
            className="press flex size-10 items-center justify-center rounded-full border border-[color:var(--gold)]/40 bg-[#020617]/80 backdrop-blur"
            style={{ boxShadow: "0 0 14px rgb(255 215 0 / 0.18)" }}
          >
            <ArrowLeft className="size-4 text-[color:var(--gold)]" />
          </button>
          <p className="caps-gold">Meu Perfil</p>
        </header>

        {/* Avatar block */}
        <section className="flex flex-col items-center text-center">
          <div
            className="relative size-32 rounded-full p-[3px] mb-4"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
              boxShadow:
                "0 0 36px rgb(255 215 0 / 0.55), 0 0 80px rgb(255 215 0 / 0.22)",
            }}
          >
            <div className="flex size-full items-center justify-center rounded-full bg-[#020617] overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={name} className="size-full object-cover" />
              ) : (
                <span className="font-mono text-5xl font-bold text-[color:var(--gold)] text-glow-bolt">
                  {initial}
                </span>
              )}
            </div>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Inter', system-ui" }}
          >
            {name}
          </h1>
          {user?.email && (
            <p className="mt-1.5 font-mono text-xs text-muted-foreground flex items-center gap-1.5">
              <Mail className="size-3 text-[color:var(--gold)]" /> {user.email}
            </p>
          )}
        </section>

        {/* Bento — Estatísticas Gerais */}
        <section className="luxe-card mt-7 p-5">
          <p className="caps-gold mb-4">Estatísticas Gerais</p>
          <div className="grid grid-cols-3 gap-3">
            <StatTile
              icon={<Sparkles className="size-4 text-[color:var(--gold)] gold-icon" />}
              label="Total XP"
              value={fmt(stats.xp)}
            />
            <StatTile
              icon={<Flame className="size-4 text-[color:var(--gold)] gold-icon" />}
              label="Streak"
              value={`${stats.streak}d`}
            />
            <StatTile
              icon={<Droplets className="size-4 text-[color:var(--gold)] gold-icon" />}
              label="Água total"
              value={`${(stats.waterMl / 1000).toFixed(1)}L`}
            />
          </div>
        </section>

        {/* Edit */}
        <button
          type="button"
          className="btn-gold press mt-6 w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Pencil className="size-4" /> Editar dados
        </button>
      </motion.div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl bg-white/[0.02] border p-3 text-center"
      style={{ borderColor: "rgb(255 215 0 / 0.22)" }}
    >
      <div className="mx-auto mb-1.5 flex size-8 items-center justify-center rounded-lg bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25">
        {icon}
      </div>
      <p className="caps-mute">{label}</p>
      <p className="mt-1 font-mono text-base font-bold text-white truncate">{value}</p>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR");
}

function readStats() {
  if (typeof window === "undefined") return { xp: 0, streak: 0, waterMl: 0 };
  let xp = 0,
    streak = 0,
    waterMl = 0;
  try {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.startsWith("hb.water.")) {
        const v = Number(JSON.parse(localStorage.getItem(k) ?? "0"));
        if (Number.isFinite(v)) waterMl += v;
      }
    }
    xp = Number(localStorage.getItem("hb.xp.total") ?? 0) || 0;
    streak = Number(localStorage.getItem("hb.streak.current") ?? 0) || 0;
  } catch {
    /* noop */
  }
  return { xp, streak, waterMl };
}
