import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "HabitBolt — Entrar" },
      { name: "description", content: "Entre ou cadastre-se no HabitBolt para sincronizar seus hábitos." },
    ],
  }),
});

function AuthPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = mode === "login" ? await signIn(email, password) : await signUp(email, password, name || email.split("@")[0]);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(mode === "login" ? "Bem-vindo de volta!" : "Conta criada!");
    router.invalidate();
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_20%,transparent),transparent_60%)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-16 rounded-2xl bg-[image:var(--gradient-bolt)] flex items-center justify-center shadow-[var(--shadow-bolt)] mb-4">
            <Zap className="size-8 text-[color:var(--bolt-foreground)]" fill="currentColor" strokeWidth={2.5} />
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight bg-[image:var(--gradient-bolt)] bg-clip-text text-transparent"
            style={{ fontFamily: "'Space Grotesk', system-ui", letterSpacing: "-0.03em" }}
          >
            HabitBolt
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login" ? "Entre para continuar sua jornada" : "Crie sua conta gratuita"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como devemos te chamar?" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>

          <Button type="submit" disabled={busy} className="w-full mt-2 rounded-xl shadow-[var(--shadow-glow)]">
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition"
        >
          {mode === "login" ? (
            <>Ainda não tem conta? <span className="text-primary font-medium">Cadastre-se</span></>
          ) : (
            <>Já tem conta? <span className="text-primary font-medium">Entrar</span></>
          )}
        </button>
      </motion.div>
    </main>
  );
}
