import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minha Página — Atendimento com cuidado" },
      { name: "description", content: "Conheça nossos serviços, nossa história e fale com a gente." },
      { property: "og:title", content: "Minha Página — Atendimento com cuidado" },
      { property: "og:description", content: "Conheça nossos serviços, nossa história e fale com a gente." },
    ],
  }),
  component: Index,
});

const servicos = [
  { t: "Consultoria", d: "Entendemos sua necessidade e indicamos o melhor caminho." },
  { t: "Projetos sob medida", d: "Soluções pensadas para o seu jeito de trabalhar." },
  { t: "Acompanhamento", d: "Estamos por perto em cada etapa, do início ao fim." },
];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl">Minha Página</span>
        <a href="#contato" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
          Fale conosco
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">Bem-vindo</p>
          <h1 className="text-5xl leading-tight md:text-6xl">Feito com cuidado, pensado para você.</h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Um negócio próximo, com atendimento atencioso e resultados que fazem diferença no seu dia a dia.
          </p>
          <a href="#servicos" className="mt-8 inline-block rounded-full border border-foreground px-6 py-3 font-medium transition hover:bg-foreground hover:text-background">
            Ver serviços
          </a>
        </div>
        <img src={hero} alt="Nosso espaço" width={1600} height={1008} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl" />
      </section>

      <section id="servicos" className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl">O que fazemos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {servicos.map((s, i) => (
              <div key={s.t} className="rounded-2xl bg-card p-8">
                <span className="font-display text-3xl text-primary">0{i + 1}</span>
                <h3 className="mt-4 text-2xl">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl">Vamos conversar?</h2>
        <p className="mt-4 text-muted-foreground">Mande uma mensagem e respondemos rapidinho.</p>
        <a href="mailto:contato@minhapagina.com" className="mt-8 inline-block rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition hover:opacity-90">
          contato@minhapagina.com
        </a>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Minha Página
      </footer>
    </main>
  );
}
