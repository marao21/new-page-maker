import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { supabase } from "../integrations/supabase/client";

// The database types are regenerated when the migration is applied; keep this preview compatible meanwhile.
const rpDb = supabase as any;
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  FileCode2,
  FolderGit2,
  Gauge,
  Github,
  History,
  LayoutDashboard,
  Link2,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/lovable-rp")({
  head: () => ({
    meta: [
      { title: "Lovable RP Web — Painel de demonstração" },
      { name: "description", content: "Prévia do painel web da Lovable RP." },
    ],
  }),
  component: LovableRpDemo,
});

type ActivityItem = {
  id: string | number;
  title: string;
  detail: string;
  time: string;
  status: "Concluído" | "Demonstração" | "Pendente" | "Erro";
};

const initialActivity: ActivityItem[] = [
  { id: 1, title: "Atualizar cores da página", detail: "new-page-maker · src/styles.css", time: "Há 18 min", status: "Concluído" },
  { id: 2, title: "Revisar botão de chamada", detail: "new-page-maker · src/routes/index.tsx", time: "Há 42 min", status: "Concluído" },
  { id: 3, title: "Preparar estrutura do painel", detail: "Lovable RP Web · interface", time: "Agora", status: "Demonstração" },
];

const navItems = [
  { label: "Visão geral", icon: LayoutDashboard },
  { label: "Comandos", icon: MessageSquareText },
  { label: "Projetos", icon: FolderGit2 },
  { label: "Histórico", icon: History },
  { label: "Conexões", icon: Link2 },
  { label: "Usuários", icon: Users },
];

function LovableRpDemo() {
  const [activeNav, setActiveNav] = useState("Visão geral");
  const [databaseStatus, setDatabaseStatus] = useState("Prévia sem login");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; repository_full_name: string | null; branch: string; status: string }>>([]);
  const [commandText, setCommandText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activity, setActivity] = useState(initialActivity);
  const [notice, setNotice] = useState("");
  const filteredActivity = useMemo(
    () => activity.filter((item) => (item.title + " " + item.detail).toLowerCase().includes(searchText.toLowerCase())),
    [activity, searchText],
  );

  useEffect(() => {
    let active = true;
    async function loadWorkspace() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!active) return;
        if (sessionError || !sessionData.session?.user) {
          setDatabaseStatus("Prévia sem login");
          return;
        }
        const userId = sessionData.session.user.id;
        const { data: profile, error: profileError } = await rpDb
          .from("lovable_rp_profiles")
          .select("access_status")
          .eq("id", userId)
          .maybeSingle();
        if (!active) return;
        if (profileError || profile?.access_status !== "approved") {
          setDatabaseStatus(profile?.access_status === "blocked" ? "Acesso bloqueado" : "Aguardando aprovação");
          return;
        }
        setCurrentUserId(userId);
        const [projectResult, commandResult] = await Promise.all([
          rpDb.from("lovable_rp_projects").select("id,name,repository_full_name,branch,status").eq("owner_id", userId).order("created_at", { ascending: false }),
          rpDb.from("lovable_rp_commands").select("id,prompt,status,created_at,project_id").eq("owner_id", userId).order("created_at", { ascending: false }).limit(10),
        ]);
        if (!active) return;
        if (projectResult.error || commandResult.error) {
          setDatabaseStatus("Schema pendente");
          return;
        }
        setProjects(projectResult.data ?? []);
        setActivity((commandResult.data ?? []).map((item) => ({
          id: item.id,
          title: item.prompt.slice(0, 70),
          detail: item.status === "completed" ? "Comando concluído" : item.status === "failed" ? "Falha registrada" : "Salvo no Supabase · ainda sem execução automática",
          time: new Date(item.created_at).toLocaleString("pt-BR"),
          status: item.status === "completed" ? "Concluído" as const : item.status === "failed" ? "Erro" as const : "Pendente" as const,
        })));
        setDatabaseStatus("Supabase conectado");
      } catch {
        if (active) setDatabaseStatus("Supabase indisponível");
      }
    }
    void loadWorkspace();
    return () => { active = false; };
  }, []);

  async function previewCommand() {
    const prompt = commandText.trim();
    if (!prompt) {
      setNotice("Escreva um comando para visualizar como ele aparecerá na fila.");
      return;
    }
    if (currentUserId && databaseStatus === "Supabase conectado") {
      const { data, error } = await rpDb.from("lovable_rp_commands").insert({ owner_id: currentUserId, prompt, status: "draft" }).select("id,prompt,status,created_at").single();
      if (error || !data) {
        setNotice("Não foi possível salvar no Supabase. Verifique a migração e as permissões; nenhum comando foi executado.");
        return;
      }
      setActivity((current) => [{ id: data.id, title: data.prompt.slice(0, 70), detail: "Salvo no Supabase · aguardando executor", time: new Date(data.created_at).toLocaleString("pt-BR"), status: "Pendente" }, ...current]);
      setNotice("Comando salvo no Supabase. Ele ainda não foi executado pelo motor da extensão.");
    } else {
      setActivity((current) => [{ id: Date.now(), title: prompt.slice(0, 70), detail: "Prévia local · não salvo no banco", time: "Agora", status: "Demonstração" }, ...current]);
      setNotice("Prévia local: comando exibido no histórico, mas não foi salvo no banco nem executado.");
    }
    setCommandText("");
    setActiveNav("Histórico");
  }

  const currentProject = projects[0] ?? { id: "demo", name: "new-page-maker", repository_full_name: "marao21/new-page-maker", branch: "main", status: "demo" };
  const projectCount = databaseStatus === "Supabase conectado" ? projects.length : 1;
  const activeTitle = activeNav === "Visão geral" ? "Visão geral" : activeNav;
  const activeDescription =
    activeNav === "Comandos" ? "Escreva o que você quer alterar e prepare uma solicitação."
    : activeNav === "Projetos" ? "Organize os repositórios que você utiliza nos seus trabalhos."
    : activeNav === "Histórico" ? "Acompanhe solicitações recentes e seus resultados."
    : activeNav === "Conexões" ? "Veja o estado das integrações que serão conectadas ao sistema."
    : activeNav === "Usuários" ? "Prévia do controle de acesso que será ativado posteriormente."
    : "Seu centro de comando para projetos, solicitações e automações.";

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <div className="flex min-h-screen">
        {mobileMenuOpen && (
          <button aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />
        )}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-200">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="font-extrabold tracking-tight">Lovable RP</p>
              <p className="text-xs text-slate-500">Web workspace</p>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
          </div>

          <div className="px-4 pt-5">
            <div className="flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/70 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-pink-600 shadow-sm"><Sparkles className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-pink-950">Espaço de trabalho</p>
                <p className="truncate text-xs text-pink-700">Meu ambiente</p>
              </div>
              <ChevronDown className="h-4 w-4 text-pink-500" />
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activeNav === item.label;
              return (
                <button key={item.label} onClick={() => { setActiveNav(item.label); setMobileMenuOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${selected ? "bg-pink-600 text-white shadow-md shadow-pink-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                  {item.label === "Histórico" && <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] ${selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{activity.length}</span>}
                </button>
              );
            })}
            <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Preferências</p>
            <button onClick={() => setNotice("As configurações serão habilitadas na próxima etapa.")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"><Settings2 className="h-[18px] w-[18px]" /> Configurações</button>
            <button onClick={() => setNotice("A central de ajuda será adicionada à versão funcional.")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"><CircleHelp className="h-[18px] w-[18px]" /> Ajuda</button>
          </nav>

          <div className="m-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><span className="text-xs font-bold text-slate-800">Modo de visualização</span></div>
            <p className="text-xs leading-5 text-slate-500">Login e controle de usuários ainda não estão ativos nesta prévia.</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> DEMO</div>
          </div>
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">MS</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Administrador</p><p className="text-xs text-slate-500">Prévia local</p></div>
              <MoreHorizontal className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
              <div><div className="flex items-center gap-2 text-xs text-slate-400"><span>Workspace</span><span>/</span><span className="text-slate-600">{activeTitle}</span></div><h1 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">{activeTitle}</h1></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:flex"><span className={`h-2 w-2 rounded-full ${databaseStatus === "Supabase conectado" ? "bg-emerald-500" : "bg-amber-500"}`} /> {databaseStatus}</div>
              <button onClick={() => setNotice("A central de notificações será conectada quando o backend estiver pronto.")} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Notificações"><Activity className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-pink-500" /></button>
              <button onClick={() => setNotice("Perfil e autenticação serão configurados depois da aprovação da interface.")} className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-2.5 hover:bg-slate-50"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-xs font-bold text-pink-700">MS</span><ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" /></button>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] p-4 sm:p-7 lg:p-9">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="mb-2 text-sm font-medium text-pink-600">Olá, Mário 👋</p><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">O que vamos construir hoje?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{activeDescription}</p></div>
              <button onClick={() => { setActiveNav("Projetos"); setNotice("A conexão real com repositórios será configurada depois."); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-700"><Plus className="h-4 w-4" /> Novo projeto</button>
            </div>

            <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#24152f] via-[#3b1740] to-[#6d174e] p-5 text-white shadow-xl shadow-pink-100 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[42px] border-white/5" />
              <div className="pointer-events-none absolute right-28 top-20 h-36 w-36 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="relative grid gap-7 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-300/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-pink-100"><Zap className="h-3.5 w-3.5" /> SEU ASSISTENTE DE DESENVOLVIMENTO</div><h3 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">Transforme suas ideias em tarefas executáveis.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-pink-100/75">Descreva a alteração que você precisa. Aqui você poderá organizar pedidos, projetos e resultados em um só lugar.</p>
                  <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Code2 className="mr-1.5 inline h-3.5 w-3.5" /> Código</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Github className="mr-1.5 inline h-3.5 w-3.5" /> GitHub</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Sparkles className="mr-1.5 inline h-3.5 w-3.5" /> Automação</span></div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm sm:p-5">
                  <label htmlFor="rp-command" className="mb-3 block text-sm font-semibold">Qual tarefa você quer realizar?</label>
                  <textarea id="rp-command" value={commandText} onChange={(event) => setCommandText(event.target.value)} placeholder="Ex.: Altere a cor do botão principal para vermelho e verifique os arquivos afetados..." className="min-h-32 w-full resize-y rounded-xl border border-white/15 bg-[#1c1025]/70 p-3 text-sm leading-6 text-white outline-none placeholder:text-white/40 focus:border-pink-300/70 focus:ring-2 focus:ring-pink-400/20" />
                  <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[11px] text-pink-100/60">Prévia visual · não executa código</span><button onClick={previewCommand} className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-950/30 transition hover:bg-pink-400"><Play className="h-4 w-4" /> Preparar comando</button></div>
                </div>
              </div>
            </section>

            {notice && <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><p className="flex-1">{notice}</p><button onClick={() => setNotice("")} aria-label="Fechar aviso"><X className="h-4 w-4" /></button></div>}

            <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Projetos conectados", value: String(projectCount).padStart(2, "0"), detail: databaseStatus === "Supabase conectado" ? "Dados do Supabase" : "Projeto ilustrativo", icon: FolderGit2, trend: databaseStatus === "Supabase conectado" ? "Supabase" : "Prévia" },
                { label: "Comandos registrados", value: String(activity.length).padStart(2, "0"), detail: databaseStatus === "Supabase conectado" ? "Dados do banco" : "Histórico de demonstração", icon: Command, trend: databaseStatus === "Supabase conectado" ? "Banco" : "Prévia" },
                { label: "Tarefas concluídas", value: "02", detail: "Histórico ilustrativo", icon: CheckCircle2, trend: "Demo" },
                { label: "Tempo economizado", value: "—", detail: "Disponível após integração", icon: Clock3, trend: "Em breve" },
              ].map((stat) => {
                const Icon = stat.icon;
                return <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/60"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600"><Icon className="h-5 w-5" /></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{stat.trend}</span></div><p className="mt-5 text-2xl font-extrabold tracking-tight">{stat.value}</p><p className="mt-1 text-sm font-semibold text-slate-700">{stat.label}</p><p className="mt-1 text-xs text-slate-400">{stat.detail}</p></div>;
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-100/60">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold">Atividade recente</h3><p className="mt-1 text-xs text-slate-500">Pedidos e atualizações do workspace</p></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Buscar atividade" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-pink-300 sm:w-48" /></div></div>
                <div className="divide-y divide-slate-100">
                  {filteredActivity.length ? filteredActivity.map((item) => <div key={item.id} className="flex items-start gap-3 p-5"><div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.status === "Concluído" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{item.status === "Concluído" ? <Check className="h-4 w-4" /> : <FileCode2 className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-1 truncate text-xs text-slate-500">{item.detail}</p><p className="mt-2 text-[11px] text-slate-400">{item.time}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === "Concluído" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span></div>) : <p className="p-8 text-center text-sm text-slate-400">Nenhuma atividade encontrada.</p>}
                </div>
                <button onClick={() => setActiveNav("Histórico")} className="flex w-full items-center justify-center gap-2 border-t border-slate-100 p-4 text-xs font-bold text-pink-600 transition hover:bg-pink-50">Ver histórico completo <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/60">
                  <div className="flex items-center justify-between"><div><h3 className="font-bold">Projeto conectado</h3><p className="mt-1 text-xs text-slate-500">Exemplo de cartão de projeto</p></div><button onClick={() => setActiveNav("Projetos")} aria-label="Ver projetos" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><MoreHorizontal className="h-5 w-5" /></button></div>
                  <div className="mt-5 rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{currentProject.name}</p><p className="text-xs text-slate-500">{currentProject.repository_full_name ?? "Repositório não informado"}</p></div><span className="h-2 w-2 rounded-full bg-emerald-500" /></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">Branch principal</span><code className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{currentProject.branch}</code></div><p className="mt-3 text-[11px] leading-5 text-amber-700">{databaseStatus === "Supabase conectado" ? "Projeto carregado do banco; conexão OAuth com GitHub ainda precisa ser habilitada." : "Cartão de demonstração. Os dados reais aparecerão após conectar e configurar o Supabase."}</p></div>
                  <button onClick={() => { setActiveNav("Projetos"); setNotice("O seletor de projetos será conectado ao GitHub na próxima etapa."); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"><Plus className="h-4 w-4" /> Gerenciar projetos</button>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/60">
                  <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Gauge className="h-4 w-4" /></div><div><h3 className="text-sm font-bold">Status das integrações</h3><p className="text-xs text-slate-500">Conexões para configurar</p></div></div>
                  <div className="mt-4 space-y-3">{[{name:"GitHub",detail:"Repositórios e commits",icon:Github},{name:"ChatGPT",detail:"Fluxo de execução",icon:Bot},{name:"Supabase",detail:"Dados e permissões",icon:DatabaseIcon}].map((connection) => { const Icon = connection.icon; return <div key={connection.name} className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{connection.name}</p><p className="text-[10px] text-slate-400">{connection.detail}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">Pendente</span></div>; })}</div>
                  <button onClick={() => setActiveNav("Conexões")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100">Ver integrações <ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </section>
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row"><span>Lovable RP Web · interface de demonstração</span><span>Os dados desta tela são ilustrativos e ainda não são salvos no banco.</span></footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function DatabaseIcon(props: ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" /></svg>;
}
