import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/supabase/oauth/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID;
        if (!clientId) {
          return Response.redirect(new URL("/lovable-rp?supabase_oauth=not_configured", request.url), 302);
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