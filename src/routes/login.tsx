import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Minha Página" },
      { name: "description", content: "Acesse sua conta com segurança." },
    ],
  }),
  component: Login,
});

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("too many requests")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (normalized.includes("fetch")) return "Não foi possível conectar ao serviço de autenticação. Verifique sua conexão.";
  return message || "Não foi possível entrar. Tente novamente.";
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (active && !sessionError && data.session?.user) {
        navigate({ to: "/", replace: true });
      }
    }).catch(() => {
      if (active) setError("Não foi possível verificar sua sessão. Atualize a página e tente novamente.");
    });
    return () => { active = false; };
  }, [navigate]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Informe um endereço de e-mail válido.");
      return;
    }
    if (!password) {
      setError("Informe sua senha.");
      return;
    }

    setLoading(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (loginError) {
        setError(friendlyAuthError(loginError.message));
        return;
      }
      await navigate({ to: "/", replace: true });
    } catch {
      setError("Ocorreu um erro ao entrar. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold">Entrar na conta</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">Use seu e-mail e sua senha cadastrados.</p>
        <form onSubmit={handleLogin} noValidate>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium">E-mail</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
            className="mb-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium">Senha</label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            maxLength={128}
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mb-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {error && <p role="alert" aria-live="polite" className="mt-4 text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?
          <Link to="/register" className="ml-1 font-medium text-primary underline hover:opacity-80">Cadastre-se</Link>
        </p>
        <p className="mt-3 text-center text-sm">
          <Link to="/" className="text-muted-foreground underline hover:text-foreground">Voltar ao início</Link>
        </p>
      </div>
    </main>
  );
}
