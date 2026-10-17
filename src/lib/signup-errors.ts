export interface SignupError {
  code?: string | undefined;
  status?: number | undefined;
  message: string;
}

export function classifySignupError(error: SignupError) {
  const message = error.message.toLowerCase();
  const emailLimit = error.code === "over_email_send_rate_limit" || message.includes("email rate limit exceeded");
  const rateLimited = emailLimit || error.code === "over_request_rate_limit" || error.status === 429 || message.includes("too many requests");
  if (rateLimited) {
    // auth-js does not expose Retry-After. This is a local pause, not an
    // assertion that the server's quota will reset after this interval.
    return {
      rateLimited: true,
      pauseSeconds: 60,
      text: emailLimit
        ? "O Supabase atingiu o limite de envio de e-mails de confirmação. O prazo de liberação não foi informado; o bloqueio pode durar mais que a pausa abaixo. Se persistir, o responsável pelo site precisa verificar o SMTP e os limites de envio."
        : "O serviço de cadastro limitou o número de solicitações. O prazo de liberação não foi informado; o bloqueio pode durar mais que a pausa abaixo.",
    };
  }
  let text = "Não foi possível criar sua conta. Tente novamente mais tarde. Se persistir, entre em contato com o suporte.";
  if (error.code === "user_already_exists" || error.code === "email_exists" || message.includes("already registered")) text = "Este e-mail já está cadastrado. Tente entrar.";
  else if (error.code === "weak_password" || (message.includes("password") && (message.includes("length") || message.includes("characters")))) text = "A senha não atende aos requisitos mínimos configurados.";
  else if (error.code === "email_address_invalid" || message.includes("invalid email")) text = "Informe um endereço de e-mail válido.";
  else if (error.code === "email_provider_disabled" || error.code === "signup_disabled") text = "O cadastro por e-mail está desativado. O responsável pelo site precisa verificar as configurações de autenticação no Supabase.";
  else if (error.status === 0 || message.includes("fetch") || message.includes("network")) text = "Não foi possível confirmar o resultado do cadastro por uma falha de conexão. Verifique sua caixa de entrada antes de tentar novamente.";
  else if (error.status && error.status >= 500) text = "O serviço de cadastro apresentou uma falha. O responsável pelo site precisa verificar os registros do Supabase e a configuração de envio de e-mails.";
  return { rateLimited: false, pauseSeconds: 0, text };
}