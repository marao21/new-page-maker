import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { ThemeToggle } from "../components/ui/ThemeToggle";

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
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* Cabeçalho móvel e simples (este header não é estritamente necessário porque já temos o da raiz, mas deixado como exemplo) */}
      <header className="mx-auto hidden max-w-6xl items-center justify-between px-6 py-6 md:flex">
        <span className="font-display text-2xl">Minha Página</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="#contato"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Fale conosco
          </a>
        </div>
      </header>

      {/* Hero section */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">Bem-vindo</p>
          <h1 className="font-display text-5xl leading-tight md:text-6xl">
            Feito com cuidado,<br /> pensado para você.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Um negócio próximo, com atendimento atencioso e resultados que fazem
            diferença no seu dia a dia.
          </p>
          <a
            href="#servicos"
            className="mt-8 inline-block rounded-full border border-foreground px-6 py-3 font-medium transition hover:bg-foreground hover:text-background"
          >
            Ver serviços
          </a>
        </div>
        <img
          src={hero}
          alt="Nosso espaço"
          width={1600}
          height={1008}
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
        />
      </section>

      {/* Seção de serviços */}
      <section id="servicos" className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-4xl">O que fazemos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {servicos.map((s, i) => (
              <div
                key={s.t}
                className="rounded-2xl bg-card p-8 shadow-sm transition hover:shadow-md"
              >
                <span className="font-display text-3xl text-primary">0{i + 1}</span>
                <h3 className="mt-4 text-2xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Prova Social */}
      <section className="mx-auto max-w-6xl px-6 py-20" id="prova-social">
        <h2 className="mb-8 text-center font-display text-4xl">Aprovado por quem confia</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-card p-6 text-center shadow-sm">
            <p className="text-xl font-semibold tracking-tight">“Melhor experiência que já tive!”</p>
            <p className="mt-2 text-sm text-muted-foreground">Joana, empreendedora</p>
          </div>
          <div className="rounded-xl bg-card p-6 text-center shadow-sm">
            <p className="text-xl font-semibold tracking-tight">“Resultado rápido e acompanhamento incrível.”</p>
            <p className="mt-2 text-sm text-muted-foreground">Marcos, consultor</p>
          </div>
          <div className="rounded-xl bg-card p-6 text-center shadow-sm">
            <p className="text-xl font-semibold tracking-tight">“Equipe de primeira, trabalho impecável!”</p>
            <p className="mt-2 text-sm text-muted-foreground">Ana, influenciadora</p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl md:text-5xl">Vamos conversar?</h2>
        <p className="mt-4 text-muted-foreground">Mande uma mensagem e respondemos rapidinho.</p>
        <a
          href="mailto:contato@minhapagina.com"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition hover:opacity-90"
        >
          contato@minhapagina.com
        </a>
      </section>

      {/* Rodapé */}
      <footer className="border-t bg-background py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <span>
            © {new Date().getFullYear()} Minha Página. Todos os direitos reservados.
          </span>
          <div className="flex gap-4 text-sm">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-75"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-75"
            >
              Instagram
            </a>
            <a href="/" className="underline hover:opacity-75">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
