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
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Bem-vindo
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Feito com cuidado,
            <br /> pensado para você.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Um negócio próximo, com atendimento atencioso e resultados que fazem
            diferença no seu dia a dia.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="#servicos"
              className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:opacity-90"
            >
              Ver serviços
            </a>
            <a
              href="#contato"
              className="inline-block rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary/10"
            >
              Fale conosco
            </a>
          </div>
        </div>

        <img
          src={hero}
          alt="Nosso espaço"
          width={1600}
          height={1008}
          className="aspect-[4/3] w-full rounded-2xl border border-border/50 object-cover shadow-2xl transition-transform duration-300 transform hover:scale-105"
        />
      </section>

      {/* Seção de serviços */}
      <section id="servicos" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight">O que fazemos</h2>
          <p className="mt-2 text-muted-foreground">
            Conheça nossos principais serviços e como podemos ajudar você.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {servicos.map((s, i) => (
            <div
              key={s.t}
              className="bg-card/60 backdrop-blur border border-border/60 rounded-xl p-8 hover:shadow-xl hover:border-primary/40 transition-transform duration-300 transform hover:scale-105"
            >
              <span className="font-mono text-xl font-semibold text-primary">0{i + 1}</span>
              <h3 className="mt-4 text-2xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção de contato */}
      <section id="contato" className="mx-auto max-w-4xl px-6 pb-16 md:pb-24">
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
