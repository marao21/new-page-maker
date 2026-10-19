import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/supabase/oauth/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID;
        if (!clientId) {
          return new Response(
            `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Configuração OAuth necessária</title><body style="font:16px system-ui;max-width:680px;margin:48px auto;padding:24px;color:#172033"><h1>Configuração OAuth do Supabase pendente</h1><p>O Lovable RP ainda não possui o Client ID do OAuth App no servidor. Por isso, o Supabase não pode abrir a tela de consentimento.</p><ol><li>No Supabase, abra as configurações da organização e crie o OAuth App do Lovable RP.</li><li>Na Vercel, abra o projeto new-page-maker → Settings → Environment Variables.</li><li>Cadastre <code>SUPABASE_OAUTH_CLIENT_ID</code> e <code>SUPABASE_OAUTH_CLIENT_SECRET</code>.</li><li>Cadastre <code>SUPABASE_OAUTH_REDIRECT_URI</code> com o valor <code>${new URL("/api/supabase/oauth/callback", new URL(request.url).origin).toString()}</code> e use exatamente essa URL no cadastro OAuth do Supabase.</li><li>Faça um novo deploy para as variáveis entrarem em vigor.</li></ol><p>Não compartilhe o Client Secret no chat nem o coloque em variáveis que começam com <code>VITE_</code>.</p><p><a href="/lovable-rp">Voltar ao Lovable RP</a> · <a href="https://supabase.com/dashboard" rel="noreferrer">Abrir Supabase</a></p></body></html>`,
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
          );
        }
        const requestUrl = new URL(request.url);
        const redirectUri = process.env.SUPABASE_OAUTH_REDIRECT_URI || new URL("/api/supabase/oauth/callback", requestUrl.origin).toString();
        const stateBytes = crypto.getRandomValues(new Uint8Array(32));
        const state = Array.from(stateBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
        const authorize = new URL("https://api.supabase.com/v1/oauth/authorize");
        authorize.searchParams.set("client_id", clientId);
        authorize.searchParams.set("response_type", "code");
        authorize.searchParams.set("redirect_uri", redirectUri);
        authorize.searchParams.set("state", state);
        const secure = requestUrl.protocol === "https:" ? "; Secure" : "";
        return new Response(null, {
          status: 302,
          headers: {
            Location: authorize.toString(),
            "Cache-Control": "no-store",
            "Set-Cookie": `lovable_rp_supabase_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/api/supabase/oauth; Max-Age=600${secure}`,
          },
        });
      },
    },
  },
});