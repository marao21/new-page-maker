import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Cadastrar — Minha Página" },
      { name: "description", content: "Crie sua conta com e-mail e senha." },
    ],
  }),
  component: Register,
});

interface Message {
  type: "error" | "success";
  text: string;
}

function friendlyRegisterError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("user already registered")) return "Este e-mail já está cadastrado. Tente entrar.";
  if (normalized.includes("password") && (normalized.includes("length") || normalized.includes("characters"))) return "A senha não atende aos requisitos mínimos configurados.";
  if (normalized.includes("invalid email")) return "Informe um endereço de e-mail válido.";
  if (normalized.includes("too many requests")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (normalized.includes("fetch")) return "Não foi possível conectar ao serviço de autenticação. Verifique sua conexão.";
  return message || "Não foi possível criar sua conta. Tente novamente.";
}

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setMessage({ type: "error", text: "Informe um endereço de e-mail válido." });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: "error", text: "A senha deve ter pelo menos 8 caracteres." });
      return;
    }
    if (password.length > 128) {
      setMessage({ type: "error", text: "A senha deve ter no máximo 128 caracteres." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: friendlyRegisterError(error.message) });
        return;
      }

      if (data.user && !data.session) {
        setMessage({
          type: "success",
          text: "Cadastro realizado! Verifique sua caixa de entrada para confirmar o e-mail antes de entrar.",
        });
        return;
      }

      if (data.session) {
        setMessage({ type: "success", text: "Cadastro realizado com sucesso! Redirecionando..." });
        await navigate({ to: "/membros", replace: true });
        return;
      }

      setMessage({ type: "success", text: "Cadastro recebido. Se necessário, confirme seu e-mail para ativar a conta." });
    } catch {
      setMessage({ type: "error", text: "Ocorreu um erro ao criar sua conta. Verifique sua conexão e tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold">Criar conta</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">Cadastre-se com seu e-mail e crie uma senha segura.</p>
        <form onSubmit={handleRegister} noValidate>
          <label htmlFor="register-email" className="mb-2 block text-sm font-medium">E-mail</label>
          <input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mb-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium">Senha (mínimo 8 caracteres)</label>
          <div className="relative mb-4">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              placeholder="Crie uma senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-muted-foreground hover:text-foreground rounded-r-xl">
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium">Confirmar senha</label>
          <div className="relative mb-6">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Ocultar confirmação da senha" : "Mostrar confirmação da senha"} className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-muted-foreground hover:text-foreground rounded-r-xl">
              {showConfirmPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
        {message && (
          <p role={message.type === "error" ? "alert" : "status"} aria-live="polite"
            className={`mt-4 text-sm ${message.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
            {message.text}
          </p>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem uma conta?
          <Link to="/login" className="ml-1 font-medium text-primary underline hover:opacity-80">Entrar</Link>
        </p>
        <p className="mt-3 text-center text-sm">
          <Link to="/" className="text-muted-foreground underline hover:text-foreground">Voltar ao início</Link>
        </p>
      </div>
    </main>
  );
}
