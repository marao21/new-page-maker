import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export const Route = {
  path: "/register",
  component: Register,
};

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleRegister() {
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // Após o registro, navega para a página de login
      navigate("/login", { replace: true });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Cadastrar</h1>
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
          onClick={handleRegister}
          className="w-full rounded bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Registrar
        </button>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </main>
  );
}
