import { Mail, Pencil, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const name =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email?.split("@")[0] ?? "Usuário";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const initial = name.slice(0, 1).toUpperCase();
  const created = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

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
          <DialogTitle className="caps-gold mb-5">Meu perfil</DialogTitle>

          <div className="flex flex-col items-center text-center">
            {/* Gold ring avatar */}
            <div
              className="relative size-28 rounded-full p-[2.5px] mb-4"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
                boxShadow:
                  "0 0 28px rgb(255 215 0 / 0.45), 0 0 60px rgb(255 215 0 / 0.18)",
              }}
            >
              <div className="flex size-full items-center justify-center rounded-full bg-[#020617] overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={name} className="size-full object-cover" />
                ) : (
                  <span className="font-mono text-4xl font-bold text-[color:var(--gold)] text-glow-bolt">
                    {initial}
                  </span>
                )}
              </div>
            </div>

            <h2
              className="text-xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Inter', system-ui" }}
            >
              {name}
            </h2>
            {user?.email && (
              <p className="mt-1 font-mono text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3 text-[color:var(--gold)]" /> {user.email}
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Membro desde" value={created} />
            <Stat label="Plano" value="HabitBolt" />
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn-gold press mt-6 w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Pencil className="size-4" /> Editar dados
          </button>

          <p className="mt-3 text-center caps-mute flex items-center justify-center gap-1.5">
            <UserIcon className="size-3" /> ID · {user?.id?.slice(0, 8) ?? "—"}
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-[color:var(--gold)]/20 p-3 text-center">
      <p className="caps-mute">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-white truncate">{value}</p>
    </div>
  );
}
