import { createFileRoute } from "@tanstack/react-router";

const GITHUB_OAUTH_ENDPOINTS = {
  device_code: "https://github.com/login/device/code",
  access_token: "https://github.com/login/oauth/access_token",
} as const;

export const Route = createFileRoute("/api/github/oauth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const kind = body?.kind as keyof typeof GITHUB_OAUTH_ENDPOINTS;
          const params = body?.params;
          if (!(kind in GITHUB_OAUTH_ENDPOINTS) || !params || typeof params !== "object") {
            return Response.json({ error: "invalid_request", error_description: "Solicitação OAuth inválida." }, { status: 400 });
          }
          const upstream = await fetch(GITHUB_OAUTH_ENDPOINTS[kind], {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(params as Record<string, string>).toString(),
          });
          const data = await upstream.json().catch(() => ({}));
          return Response.json(data, {
            status: upstream.ok ? 200 : upstream.status,
            headers: { "Cache-Control": "no-store" },
          });
        } catch {
          return Response.json({ error: "oauth_proxy_failed", error_description: "Não foi possível comunicar com o GitHub. Tente novamente." }, { status: 502 });
        }
      },
    },
  },
});
