import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Volume2,
  ShieldCheck,
  Lock,
  Eye,
  KeyRound,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  appLock: boolean;
  statsPrivate: boolean;
};

const KEY = "hb.prefs.v1";
const DEFAULTS: Prefs = {
  habitNotifs: true,
  focusSound: true,
  profilePrivate: false,
  appLock: false,
  statsPrivate: false,
};

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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<null | "pwd" | "signoutAll" | "delete">(null);

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

  const handleChangePassword = async () => {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) {
      toast.error("Sessão não encontrada");
      return;
    }
    setBusy("pwd");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setBusy(null);
    if (error) toast.error(error.message);
    else toast.success("Enviamos um e-mail para alterar sua senha");
  };

  const handleSignOutOthers = async () => {
    setBusy("signoutAll");
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setBusy(null);
    if (error) toast.error(error.message);
    else toast.success("Sessões em outros dispositivos encerradas");
  };

  const handleDeleteAccount = async () => {
    setBusy("delete");
    try {
      await supabase.auth.signOut();
      toast.success("Solicitação registrada. Entraremos em contato.");
      navigate({ to: "/auth" });
    } catch {
      toast.error("Falha ao processar");
    } finally {
      setBusy(null);
      setConfirmDelete(false);
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

        <p className="caps-gold mb-2 pl-1 text-[10px]">Geral</p>
        <section className="luxe-card p-3.5">
          <Row
            icon={<Bell className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Notificações de Hábitos"
            desc="Lembretes diários para manter o ritmo"
            checked={prefs.habitNotifs}
            onChange={(v) => update({ habitNotifs: v })}
          />
          <Divider />
          <Row
            icon={<Volume2 className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Som do Timer de Foco"
            desc="Toques sutis ao iniciar e finalizar"
            checked={prefs.focusSound}
            onChange={(v) => update({ focusSound: v })}
          />
          <Divider />
          <Row
            icon={<ShieldCheck className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Privacidade do Perfil"
            desc="Esconde seus dados de outros usuários"
            checked={prefs.profilePrivate}
            onChange={(v) => update({ profilePrivate: v })}
          />
        </section>

        <p className="caps-gold mt-6 mb-2 pl-1 text-[10px]">Segurança e Privacidade</p>
        <section
          className="luxe-card p-3.5"
          style={{ background: "#121212" }}
        >
          <Row
            icon={<Lock className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Bloqueio por PIN/Biometria"
            desc="Exige autenticação ao abrir o app"
            checked={prefs.appLock}
            onChange={(v) => update({ appLock: v })}
          />
          <Divider />
          <Row
            icon={<Eye className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Privacidade de Dados"
            desc="XP e Streaks visíveis apenas para você"
            checked={prefs.statsPrivate}
            onChange={(v) => update({ statsPrivate: v })}
          />
          <Divider />
          <ActionRow
            icon={<KeyRound className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Alterar Senha"
            desc="Receba um link seguro por e-mail"
            onClick={handleChangePassword}
            loading={busy === "pwd"}
          />
          <Divider />
          <ActionRow
            icon={<LogOut className="size-4 text-[color:var(--gold)] gold-icon" />}
            title="Encerrar outras sessões"
            desc="Desconecta todos os outros dispositivos"
            onClick={handleSignOutOthers}
            loading={busy === "signoutAll"}
          />
        </section>

        <button
          type="button"
          onClick={save}
          className="btn-gold press mt-7 w-full py-3.5 text-sm font-semibold tracking-wide"
        >
          Salvar Alterações
        </button>

        <p className="caps-gold mt-8 mb-2 pl-1 text-[10px]" style={{ color: "#ff5b6e" }}>
          Zona de Risco
        </p>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition"
          style={{
            background: "rgb(255 91 110 / 0.06)",
            border: "1px solid rgb(255 91 110 / 0.45)",
            color: "#ff7a8a",
            boxShadow: "0 0 18px rgb(255 91 110 / 0.18), inset 0 0 12px rgb(255 91 110 / 0.06)",
          }}
        >
          <Trash2 className="size-4" />
          Excluir Conta
        </button>
      </motion.div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent
          className="luxe-card border-0 bg-transparent shadow-none"
          style={{ background: "#121212" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação é irreversível. Todos os seus hábitos, XP, streaks e dados serão apagados
              definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={busy === "delete"}
              style={{
                background: "rgb(255 91 110 / 0.15)",
                border: "1px solid rgb(255 91 110 / 0.55)",
                color: "#ff7a8a",
                boxShadow: "0 0 18px rgb(255 91 110 / 0.25)",
              }}
            >
              {busy === "delete" ? "Processando..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Divider() {
  return <div className="my-1 h-px bg-[color:var(--gold)]/15" />;
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

function ActionRow({
  icon,
  title,
  desc,
  onClick,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="press flex w-full items-center gap-3 px-2 py-3 text-left disabled:opacity-60"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {loading ? "Enviando..." : desc}
        </p>
      </div>
      <ChevronRight className="size-4 text-[color:var(--gold)]/70" />
    </button>
  );
}
