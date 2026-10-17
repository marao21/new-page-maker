import { FormEvent, useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { classifySignupError } from "@/lib/signup-errors";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/config/product";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: `Criar conta — ${productConfig.name}` },
      { name: "description", content: "Crie sua conta com e-mail e senha." },
      { property: "og:title", content: `Criar conta — ${productConfig.name}` },
      { property: "og:description", content: "Crie sua conta com e-mail e senha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const requestInFlight = useRef(false);
  const signupCompleted = useRef(false);
  const blockedUntil = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds(Math.max(0, Math.ceil((blockedUntil.current - Date.now()) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds > 0]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || signupCompleted.current || Date.now() < blockedUntil.current) return;
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

    requestInFlight.current = true;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) {
        const failure = classifySignupError(error);
        setMessage({ type: "error", text: failure.text });
        if (failure.rateLimited) {
          blockedUntil.current = Date.now() + failure.pauseSeconds * 1000;
          setRemainingSeconds(failure.pauseSeconds);
        }
        return;
      }

      signupCompleted.current = true;
      setCompleted(true);

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
      setMessage({ type: "error", text: "Não foi possível confirmar o resultado do cadastro. Verifique sua caixa de entrada e sua conexão antes de tentar novamente." });
    } finally {
      requestInFlight.current = false;
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
          <Button
            type="submit"
            disabled={loading || remainingSeconds > 0 || completed}
            aria-busy={loading}
            className="h-auto w-full whitespace-normal rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:translate-x-0 hover:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Criando conta..." : remainingSeconds > 0 ? `Aguarde ${remainingSeconds}s` : completed ? "Cadastro enviado" : "Criar conta"}
          </Button>
        </form>
        {message && (
          <p role={message.type === "error" ? "alert" : "status"} aria-live="polite"
            className={`mt-4 text-sm ${message.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
            {message.text}
          </p>
        )}
        {remainingSeconds > 0 && <p role="timer" className="mt-2 text-sm text-muted-foreground">Pausa local: {remainingSeconds}s antes de uma nova tentativa manual. Nenhum reenvio será feito automaticamente.</p>}
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
