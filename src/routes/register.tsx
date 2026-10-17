import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Cadastrar — Minha Página" },
      { name: "description", content: "Crie sua conta." },
    ],
  }),
  component: Register,
});

interface Message {
  type: "error" | "success";
  text: string;
}

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const navigate = useNavigate();

  async function handleRegister() {
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    if (data.user && !data.session) {
      setMessage({
        type: "success",
        text: "Cadastro realizado! Verifique sua caixa de entrada para confirmar o e-mail.",
      });
      return;
    }

    if (data.session) {
      setMessage({ type: "success", text: "Cadastro realizado com sucesso!" });
      setTimeout(() => navigate({ to: "/", replace: true }), 2000);
      return;
    }

    setMessage({ type: "success", text: "Cadastro realizado! Por favor, confirme seu e-mail." });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="mb-8 text-center text-2xl font-bold">Criar conta</h1>
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
          onClick={handleRegister}
          className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Registrar
        </button>
        {message && (
          <p
            className={`mt-4 text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}
          >
            {message.text}
          </p>
        )}
        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?
          <Link to="/login" className="ml-1 font-medium text-blue-600 underline hover:opacity-80">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
