import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Volume2, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/preferencias")({
  head: () => ({
    meta: [
      { title: "Preferências — HabitBolt" },
      { name: "description", content: "Ajustes finos da sua experiência." },
    ],
  }),
  component: PreferencesPage,
});

type Prefs = {
  habitNotifs: boolean;
  focusSound: boolean;
  profilePrivate: boolean;
};

const KEY = "hb.prefs.v1";
const DEFAULTS: Prefs = { habitNotifs: true, focusSound: true, profilePrivate: false };

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>) };
  } catch {
    return DEFAULTS;
  }
}

function PreferencesPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    setPrefs(load());
  }, []);

  const update = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      toast.success("Preferências salvas");
    } catch {
      toast.error("Falha ao salvar");
    }
  };

  return (
    <div className="min-h-screen deep-space text-white">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-md px-4 pt-5 pb-32"
      >
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
          <div className="min-w-0">
            <p className="caps-gold">Preferências</p>
            <p className="text-[11px] text-muted-foreground">Ajustes finos da experiência</p>
          </div>
        </header>

        <section className="luxe-card p-3.5">
          <Row
            icon={<Bell className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Notificações de Hábitos"
            desc="Lembretes diários para manter o ritmo"
            checked={prefs.habitNotifs}
            onChange={(v) => update({ habitNotifs: v })}
          />
          <div className="my-1 h-px bg-[color:var(--gold)]/15" />
          <Row
            icon={<Volume2 className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Som do Timer de Foco"
            desc="Toques sutis ao iniciar e finalizar"
            checked={prefs.focusSound}
            onChange={(v) => update({ focusSound: v })}
          />
          <div className="my-1 h-px bg-[color:var(--gold)]/15" />
          <Row
            icon={<ShieldCheck className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Privacidade do Perfil"
            desc="Esconde seus dados de outros usuários"
            checked={prefs.profilePrivate}
            onChange={(v) => update({ profilePrivate: v })}
          />
        </section>

        <button
          type="button"
          onClick={save}
          className="btn-gold press mt-7 w-full py-3.5 text-sm font-semibold tracking-wide"
        >
          Salvar Alterações
        </button>
      </motion.div>
    </div>
  );
}

function Row({
  icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[color:var(--gold)]"
      />
    </div>
  );
}
