import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight, BookOpen, CheckCircle2, CircleHelp, Download, FileSpreadsheet,
  GraduationCap, LogOut, Menu, MonitorPlay, Sparkles, X
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/membros")({
  head: () => ({
    meta: [
      { title: "Área de Membros — Guia de Foco" },
      { name: "description", content: "Acesse seus materiais e acompanhe seu progresso." },
      { property: "og:title", content: "Área de Membros — Guia de Foco" },
      { property: "og:description", content: "Acesse seus materiais e acompanhe seu progresso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MembersArea,
});

const materials = [
  {
    title: "Guia de Foco — Plano prático de 7 dias",
    description: "Um material prático para escolher prioridades, reduzir distrações e criar uma rotina de foco.",
    detail: "PDF • 5 páginas",
    icon: BookOpen,
    tone: "bg-pink-100 text-pink-700",
    href: "/guia-de-foco-plano-pratico.pdf",
  },
  {
    title: "Dashboard do Notion",
    description: "Organize tarefas e acompanhe sua evolução em um só lugar.",
    detail: "Modelo para duplicar",
    icon: MonitorPlay,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    title: "Planilhas e checklists",
    description: "Ferramentas práticas para planejar a semana e tirar tarefas do papel.",
    detail: "Excel, Sheets e A4",
    icon: FileSpreadsheet,
    tone: "bg-emerald-100 text-emerald-700",
  },
];

function MembersArea() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session?.user) {
        navigate({ to: "/login", replace: true });
        return;
      }
      setEmail(data.session.user.email ?? "");
      setChecking(false);
    }).catch(() => {
      if (active) navigate({ to: "/login", replace: true });
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        navigate({ to: "/login", replace: true });
      } else {
        setEmail(session.user.email ?? "");
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (!error) await navigate({ to: "/login", replace: true });
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
          Verificando seu acesso...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600 text-sm font-black text-white">GF</span>
          <span className="leading-tight">
            <span className="block font-extrabold">Guia de Foco</span>
            <span className="text-xs text-slate-500">Área de membros</span>
          </span>
        </Link>
        <div className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Seu espaço</div>
        <a href="#inicio" className="flex items-center gap-3 rounded-xl bg-pink-50 px-3 py-3 font-semibold text-pink-700">
          <GraduationCap className="h-5 w-5" /> Visão geral
        </a>
        <a href="#materiais" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 transition hover:bg-slate-100">
          <BookOpen className="h-5 w-5" /> Meus materiais
        </a>
        <a href="#ajuda" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 transition hover:bg-slate-100">
          <CircleHelp className="h-5 w-5" /> Ajuda
        </a>
        <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
          <Sparkles className="mb-3 h-5 w-5 text-pink-300" />
          <p className="font-bold">Um passo de cada vez.</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">Pequenas ações consistentes ajudam você a avançar.</p>
        </div>
      </aside>

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 p-2 sm:p-6" role="dialog" aria-modal="true" aria-label="Leitor do Guia de Foco">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div>
                <h2 className="font-extrabold text-slate-900">Guia de Foco — Plano prático de 7 dias</h2>
                <p className="text-xs text-slate-500">Leitura do PDF dentro da área de membros</p>
              </div>
              <div className="flex items-center gap-2">
                <a href="/guia-de-foco-plano-pratico.pdf" target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir em nova aba</a>
                <button type="button" onClick={() => setGuideOpen(false)} className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-bold text-white hover:bg-pink-700" aria-label="Fechar leitor">Fechar</button>
              </div>
            </div>
            <iframe src="/guia-de-foco-plano-pratico.pdf#toolbar=1&navpanes=0" title="Guia de Foco — Plano prático de 7 dias" className="min-h-0 w-full flex-1 bg-slate-100" />
          </div>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-600 text-xs font-black text-white">GF</span>
              <span className="font-bold">Área de membros</span>
            </div>
            <div className="hidden text-sm text-slate-500 md:block">Seu conteúdo, em um só lugar</div>
            <div className="flex items-center gap-3">
              <span className="hidden max-w-56 truncate text-sm text-slate-600 sm:block">{email}</span>
              <button onClick={handleLogout} disabled={loggingOut} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-60">
                <LogOut className="h-4 w-4" /> {loggingOut ? "Saindo..." : "Sair"}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg border border-slate-200 p-2 md:hidden" aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}>
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <nav className="space-y-1 border-t border-slate-100 bg-white p-3 md:hidden">
              <a onClick={() => setMobileMenuOpen(false)} href="#inicio" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Visão geral</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#materiais" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Meus materiais</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#ajuda" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Ajuda</a>
            </nav>
          )}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
          <section id="inicio" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-pink-600 to-rose-700 p-6 text-white sm:p-10">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                <Sparkles className="h-4 w-4" /> SEU ESPAÇO DE APRENDIZADO
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Bem-vindo(a) à sua área de membros!</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-pink-50 sm:text-base">Tudo o que você precisa para planejar melhor sua rotina e transformar intenção em ação está reunido aqui.</p>
              <a href="#materiais" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-pink-700 shadow-sm transition hover:bg-pink-50">
                Ver meus materiais <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[36px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-700"><BookOpen className="h-5 w-5" /></div>
              <p className="mt-4 text-2xl font-black">03</p><p className="mt-1 text-sm text-slate-500">Materiais previstos no seu acesso</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></div>
              <p className="mt-4 text-2xl font-black">No seu ritmo</p><p className="mt-1 text-sm text-slate-500">Acesse quando quiser</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><GraduationCap className="h-5 w-5" /></div>
              <p className="mt-4 text-2xl font-black">Seu progresso</p><p className="mt-1 text-sm text-slate-500">Comece pelo primeiro material</p>
            </div>
          </section>

          <section id="materiais" className="mt-10 scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-sm font-bold text-pink-700">BIBLIOTECA</p><h2 className="mt-1 text-2xl font-black tracking-tight">Seus materiais</h2><p className="mt-1 text-sm text-slate-500">Os recursos do produto que você adquiriu.</p></div>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {materials.map((material) => {
                const Icon = material.icon;
                return (
                  <article key={material.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${material.tone}`}><Icon className="h-6 w-6" /></div>
                    <h3 className="mt-5 text-lg font-extrabold">{material.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{material.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500"><Download className="h-4 w-4" /> {material.detail}</div>
                    {material.href ? (
                      <button type="button" onClick={() => setGuideOpen(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                        <BookOpen className="h-4 w-4" /> Abrir PDF no sistema
                      </button>
                    ) : (
                      <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">Material anunciado na página do produto. O link do arquivo precisa ser configurado para liberar o acesso.</div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section id="ajuda" className="mt-10 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-700"><CircleHelp className="h-5 w-5" /></div><div><h2 className="text-lg font-extrabold">Precisa de ajuda?</h2><p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">Se você tiver dificuldade para acessar sua conta ou seus materiais, entre em contato com o suporte do produto.</p></div></div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600">Use o canal de suporte informado na compra <ArrowUpRight className="h-4 w-4" /></span>
            </div>
          </section>

          <footer className="flex flex-col gap-2 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Guia de Foco • Área de membros</span>
            <Link to="/" className="font-semibold text-slate-500 hover:text-pink-700">Voltar à página inicial</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
