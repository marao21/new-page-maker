import { createFileRoute } from "@tanstack/react-router";

function cookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export const Route = createFileRoute("/api/supabase/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const fail = (reason: string) => Response.redirect(new URL("/lovable-rp?supabase_oauth=" + encodeURIComponent(reason), url.origin), 302);
        const providerError = url.searchParams.get("error");
        if (providerError) return fail("denied");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const savedState = cookieValue(request, "lovable_rp_supabase_oauth_state");
        if (!code || !state || !savedState || state !== savedState) return fail("invalid_state");

        const clientId = process.env["SUPABASE_OAUTH_CLIENT_ID"];
        const clientSecret = process.env["SUPABASE_OAUTH_CLIENT_SECRET"];
        const redirectUri = process.env["SUPABASE_OAUTH_REDIRECT_URI"] || new URL("/api/supabase/oauth/callback", url.origin).toString();
        if (!clientId || !clientSecret) return fail("not_configured");

        try {
          const tokenResponse = await fetch("https://api.supabase.com/v1/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
            }),
            cache: "no-store",
          });
          const tokens = await tokenResponse.json().catch(() => ({}));
          if (!tokenResponse.ok || typeof tokens.access_token !== "string") return fail("token_exchange_failed");
          const maxAge = Math.max(60, Math.min(Number(tokens.expires_in) || 3600, 86400));
          const secure = url.protocol === "https:" ? "; Secure" : "";
          const headers = new Headers({
            Location: new URL("/lovable-rp?supabase_oauth=connected", url.origin).toString(),
            "Cache-Control": "no-store",
          });
          headers.append("Set-Cookie", `lovable_rp_supabase_access=${encodeURIComponent(tokens.access_token)}; HttpOnly; SameSite=Lax; Path=/api/supabase; Max-Age=${maxAge}${secure}`);
          headers.append("Set-Cookie", `lovable_rp_supabase_oauth_state=; HttpOnly; SameSite=Lax; Path=/api/supabase/oauth; Max-Age=0${secure}`);
          if (typeof tokens.refresh_token === "string" && tokens.refresh_token) {
            headers.append("Set-Cookie", `lovable_rp_supabase_refresh=${encodeURIComponent(tokens.refresh_token)}; HttpOnly; SameSite=Lax; Path=/api/supabase; Max-Age=2592000${secure}`);
          }
          return new Response(null, { status: 302, headers });
        } catch {
          return fail("token_exchange_failed");
        }
      },
    },
  },
});