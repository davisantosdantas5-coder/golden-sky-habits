import { useEffect, useState } from "react";
import { Bell, CloudUpload, Focus } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type Prefs = {
  notifications: boolean;
  strictFocus: boolean;
  cloudSync: boolean;
};

const KEY = "hb.prefs.v1";
const DEFAULTS: Prefs = { notifications: true, strictFocus: false, cloudSync: true };

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>) };
  } catch {
    return DEFAULTS;
  }
}

export function PreferencesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    if (open) setPrefs(load());
  }, [open]);

  const update = (patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="luxe-card max-w-md w-[92vw] sm:w-full p-0 border-0 bg-transparent shadow-none [&>button]:text-[color:var(--gold)]"
        style={{ background: "transparent" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 pt-7"
        >
          <DialogTitle className="caps-gold mb-1">Preferências</DialogTitle>
          <p className="text-xs text-muted-foreground mb-5">
            Ajustes finos da sua experiência tática.
          </p>

          <div className="space-y-2.5">
            <Row
              icon={<Bell className="size-4 text-[color:var(--gold)] gold-icon" />}
              title="Notificações"
              desc="Lembretes diários de hábitos e hidratação"
              checked={prefs.notifications}
              onChange={(v) => update({ notifications: v })}
            />
            <Row
              icon={<Focus className="size-4 text-[color:var(--gold)] gold-icon" />}
              title="Modo Foco Estrito"
              desc="Bloqueia distrações durante sessões de foco"
              checked={prefs.strictFocus}
              onChange={(v) => update({ strictFocus: v })}
            />
            <Row
              icon={<CloudUpload className="size-4 text-[color:var(--gold)] gold-icon" />}
              title="Sincronizar com Nuvem"
              desc="Backup automático do seu progresso"
              checked={prefs.cloudSync}
              onChange={(v) => update({ cloudSync: v })}
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn-gold press mt-6 w-full py-3 text-sm font-semibold"
          >
            Concluído
          </button>
        </motion.div>
      </DialogContent>
    </Dialog>
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
    <div
      className="flex items-center gap-3 rounded-xl px-3.5 py-3 border bg-white/[0.02]"
      style={{ borderColor: "rgb(255 215 0 / 0.2)" }}
    >
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
