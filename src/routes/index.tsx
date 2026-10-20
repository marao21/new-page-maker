import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Lovable RP — Workspace GitHub" },
    { name: "description", content: "Seu workspace para criar e editar projetos GitHub." },
    { property: "og:title", content: "Lovable RP — Workspace GitHub" },
    { property: "og:description", content: "Seu workspace para criar e editar projetos GitHub." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: () => {
    throw redirect({ to: "/lovable-rp" });
  },
});
