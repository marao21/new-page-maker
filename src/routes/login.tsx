import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Minha Página" },
      { name: "description", content: "Acesse sua conta." },
    ],
  }),
  component: Login,
});

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData.session?.user) {
        navigate({ to: "/", replace: true });
      }
    });
  }, [navigate]);

  async function handleLogin() {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate({ to: "/", replace: true });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="mb-8 text-center text-2xl font-bold">Entrar na conta</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Entrar
        </button>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?
          <Link to="/register" className="ml-1 font-medium text-primary underline hover:opacity-80">
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
