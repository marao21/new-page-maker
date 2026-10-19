import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/supabase/oauth/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookies = request.headers.get("cookie") || "";
        const connected = cookies.split(";").some((part) => part.trim().startsWith("lovable_rp_supabase_access="));
        return Response.json({ connected }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});