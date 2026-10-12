import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Minha Página" }, { name: "description", content: "Acesse sua conta." }] }),
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
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={handleLogin}
          className="w-full rounded bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Entrar
        </button>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </main>
  );
}
