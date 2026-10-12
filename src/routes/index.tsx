import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minha Página — Atendimento com cuidado" },
      {
        name: "description",
        content: "Conheça nossos serviços, nossa história e fale com a gente.",
      },
      {
        property: "og:title",
        content: "Minha Página — Atendimento com cuidado",
      },
      {
        property: "og:description",
        content: "Conheça nossos serviços, nossa história e fale com a gente.",
      },
    ],
  }),
  component: Index,
});

const servicos = [
  {
    t: "Consultoria",
    d: "Entendemos sua necessidade e indicamos o melhor caminho.",
  },
  {
    t: "Projetos sob medida",
    d: "Soluções pensadas para o seu jeito de trabalhar.",
  },
  {
    t: "Acompanhamento",
    d: "Estamos por perto em cada etapa, do início ao fim.",
  },
];

function Index() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {/* Hero section */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-6 py-12 md:grid-cols-2 md:gap-16 md:py-24 bg-gradient-to-tr from-primary/10 to-primary/30 rounded-b-2xl shadow-lg">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Bem-vindo ao nosso espaço
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Feito com cuidado,<br />pensado para você.
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Um negócio próximo, com atendimento atencioso e resultados que fazem
            diferença no seu dia a dia.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#servicos"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
            >
              Ver serviços
            </a>
            <a
              href="#contato"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-8 py-3 text-sm font-semibold transition hover:bg-accent"
            >
              Fale conosco
            </a>
          </div>
        </div>

        <div className="relative">
          <img
            src={hero}
            alt="Nosso espaço"
            width={1600}
            height={1008}
            className="aspect-[4/3] w-full rounded-3xl border border-border/50 object-cover shadow-xl"
          />
        </div>
      </section>

      {/* Seção de serviços */}
      <section id="servicos" className="mx-auto max-w-6xl px-6 py-16 md:py-20 bg-gradient-to-br from-background to-card rounded-lg shadow-md">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight">O que fazemos</h2>
          <p className="mt-2 text-muted-foreground">
            Conheça nossos principais serviços e como podemos ajudar você.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s, i) => (
            <div
              key={s.t}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-mono text-lg font-bold text-primary">
                0{i + 1}
              </span>
              <h3 className="text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 flex-1 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção de contato */}
      <section id="contato" className="mx-auto max-w-4xl px-6 pb-16 md:pb-24 bg-card/50 rounded-xl shadow-md backdrop-blur-sm">
        <div className="relative rounded-xl bg-card/60 backdrop-blur border border-border/60 p-8 text-center shadow-md">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Vamos conversar?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Mande uma mensagem e respondemos rapidinho.
          </p>
          <a
            href="mailto:contato@minhapagina.com"
            className="mt-6 inline-block rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            contato@minhapagina.com
          </a>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-border/60 bg-background py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <span>
            © {new Date().getFullYear()} Minha Página. Todos os direitos reservados.
          </span>
          <div className="flex gap-4 text-sm">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="underline transition hover:opacity-75"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="underline transition hover:opacity-75"
            >
              Instagram
            </a>
            <a href="/" className="underline transition hover:opacity-75">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
