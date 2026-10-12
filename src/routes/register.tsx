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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 px-4 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-center text-3xl font-extrabold text-gray-800">Criar conta</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleRegister}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Registrar
        </button>
        {message && (
          <p
            className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
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