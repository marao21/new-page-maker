import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { isSupabaseConfigured, supabase } from "../integrations/supabase/client";
import { executeGitHubEdit, listGitHubRepositories, validateGeminiApiKey, validateGitHubToken, type GitHubRepoOption } from "../lib/lovable-rp-engine";
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

// The database types are regenerated when the migration is applied; keep this preview compatible meanwhile.
const rpDb = supabase as any;

export const Route = createFileRoute("/lovable-rp")({
  head: () => ({
    meta: [
      { title: "Lovable RP Web — Assistente de projetos" },
      { name: "description", content: "Painel web da Lovable RP para gerenciar projetos e executar alterações no GitHub." },
    ],
  }),
  component: LovableRpDemo,
});

type ActivityItem = {
  id: string | number;
  title: string;
  detail: string;
  time: string;
  status: "Concluído" | "Pendente" | "Erro";
};

const initialActivity: ActivityItem[] = [];

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
  const [databaseStatus, setDatabaseStatus] = useState("Verificando Supabase");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; repository_full_name: string | null; branch: string; status: string }>>([]);
  const [adminUsers, setAdminUsers] = useState<Array<{id:string;email:string|null;full_name:string|null;role:string;access_status:string}>>([]);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login"|"signup">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string|null>(null);
  const [commandText, setCommandText] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [githubUser, setGithubUser] = useState("");
  const [repoOptions, setRepoOptions] = useState<GitHubRepoOption[]>([]);
  const [selectedRepository, setSelectedRepository] = useState("marao21/new-page-maker");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [githubDeviceUserCode, setGithubDeviceUserCode] = useState("");
  const [githubClientId, setGithubClientId] = useState(() => window.sessionStorage.getItem("lovable-rp-web-github-client-id") || ((import.meta as any).env?.VITE_GITHUB_CLIENT_ID as string | undefined) || "");
  const [githubDeviceBusy, setGithubDeviceBusy] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activity, setActivity] = useState(initialActivity);
  const [notice, setNotice] = useState("");
  const filteredActivity = useMemo(
    () => activity.filter((item) => (item.title + " " + item.detail).toLowerCase().includes(searchText.toLowerCase())),
    [activity, searchText],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGithubToken(window.sessionStorage.getItem("lovable-rp-web-github-token") || "");
      setGithubUser(window.sessionStorage.getItem("lovable-rp-web-github-user") || "");
      setGeminiApiKey(window.sessionStorage.getItem("lovable-rp-web-gemini-key") || "");
      setSelectedRepository(window.sessionStorage.getItem("lovable-rp-web-repository") || "marao21/new-page-maker");
      setSelectedBranch(window.sessionStorage.getItem("lovable-rp-web-branch") || "main");
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadWorkspace() {
      try {
        if (!isSupabaseConfigured()) {
          if (active) {
            setDatabaseStatus("Configuração necessária");
            setNotice("O Supabase ainda não está configurado neste ambiente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para ativar login, aprovação e histórico persistente.");
          }
          return;
        }
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!active) return;
        if (sessionError || !sessionData.session?.user) {
          setCurrentUserId(null);
          setSignedInEmail(null);
          setDatabaseStatus("Sem sessão");
          return;
        }
        const userId = sessionData.session.user.id;
        setSignedInEmail(sessionData.session.user.email ?? null);
        const { data: profile, error: profileError } = await rpDb
          .from("lovable_rp_profiles")
          .select("access_status,role,email,full_name")
          .eq("id", userId)
          .maybeSingle();
        if (!active) return;
        if (profileError) {
          setDatabaseStatus("Schema pendente");
          setNotice("Não consegui ler seu perfil no Supabase. Confira se o banco está ativo e se a migração Lovable RP foi aplicada.");
          return;
        }
        if (!profile) {
          setDatabaseStatus("Perfil não criado");
          setNotice("Sua conta existe, mas o perfil Lovable RP não foi criado. Aplique a migração no Supabase.");
          return;
        }
        if (profile.access_status !== "approved") {
          setDatabaseStatus(profile.access_status === "blocked" ? "Acesso bloqueado" : "Aguardando aprovação");
          setCurrentUserId(userId);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(profile.role === "admin");
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
        if (profile.role === "admin") {
          const { data: users, error: usersError } = await rpDb.from("lovable_rp_profiles").select("id,email,full_name,role,access_status").order("created_at", { ascending: false });
          if (!usersError) setAdminUsers(users ?? []);
        }
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

  async function handleAuth() {
    const email = authEmail.trim();
    if (!email || !authPassword) { setNotice("Informe e-mail e senha."); return; }
    if (authPassword.length < 8) { setNotice("A senha deve ter pelo menos 8 caracteres."); return; }
    setAuthBusy(true);
    setNotice("");
    try {
      const result = authMode === "signup"
        ? await supabase.auth.signUp({ email, password: authPassword, options: { data: { full_name: email.split("@")[0] } } })
        : await supabase.auth.signInWithPassword({ email, password: authPassword });
      if (result.error) throw result.error;
      if (authMode === "signup" && !result.data.session) {
        setNotice("Conta criada. Confirme o e-mail e entre depois. O acesso ao painel também depende da aprovação do administrador.");
      } else {
        setNotice(authMode === "signup" ? "Conta criada. O acesso ficará pendente até aprovação." : "Login realizado. Carregando seu acesso...");
      }
      setAuthPassword("");
      if (result.data.session) window.location.reload();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível autenticar. Verifique se o Supabase está ativo.");
    } finally { setAuthBusy(false); }
  }

  async function handleAdminStatus(userId: string, accessStatus: "approved"|"blocked"|"pending") {
    if (!isAdmin) { setNotice("Somente o administrador aprovado pode alterar acessos."); return; }
    const { error } = await rpDb.from("lovable_rp_profiles").update({ access_status: accessStatus }).eq("id", userId);
    if (error) { setNotice("Não foi possível atualizar o usuário. Confira a política RLS e se o Supabase está ativo."); return; }
    setAdminUsers((items) => items.map((user) => user.id === userId ? { ...user, access_status: accessStatus } : user));
    setNotice("Acesso do usuário atualizado no Supabase.");
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) { setNotice("Não foi possível sair da sessão."); return; }
    window.location.reload();
  }

  async function handleStartGithubDeviceFlow() {
    const clientId = githubClientId.trim();
    if (!clientId) { setNotice("Informe o Client ID público do OAuth App Lovable RP com Device Flow ativado."); return; }
    window.sessionStorage.setItem("lovable-rp-web-github-client-id", clientId);
    setGithubDeviceBusy(true); setGithubDeviceUserCode(""); setNotice("");
    try {
      const response = await fetch("https://github.com/login/device/code", { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId, scope: "repo read:user" }) });
      const data = await response.json();
      if (!response.ok || !data.device_code || !data.user_code) throw new Error(data.error_description || data.error || "O GitHub não iniciou a autorização. Confira o Client ID e o Device Flow.");
      setGithubDeviceUserCode(data.user_code);
      window.open(data.verification_uri || "https://github.com/login/device", "_blank", "noopener,noreferrer");
      let interval = Math.max(Number(data.interval) || 5, 5) * 1000;
      const expiresAt = Date.now() + Math.min(Number(data.expires_in) || 900, 900) * 1000;
      while (Date.now() < expiresAt) {
        await new Promise((resolve) => window.setTimeout(resolve, interval));
        const tr = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId, device_code: data.device_code, grant_type: "urn:ietf:params:oauth:grant-type:device_code" }) });
        const td = await tr.json();
        if (td.access_token) {
          const user = await validateGitHubToken(td.access_token); const repos = await listGitHubRepositories(td.access_token);
          setGithubToken(td.access_token); setGithubUser(user.login); setRepoOptions(repos);
          window.sessionStorage.setItem("lovable-rp-web-github-token", td.access_token); window.sessionStorage.setItem("lovable-rp-web-github-user", user.login);
          if (!repos.some((repo) => repo.full_name === selectedRepository) && repos[0]) { setSelectedRepository(repos[0].full_name); setSelectedBranch(repos[0].default_branch); }
          setGithubDeviceUserCode(""); setNotice("GitHub conectado como @" + user.login + ". " + repos.length + " repositórios encontrados."); return;
        }
        if (td.error === "authorization_pending") continue;
        if (td.error === "slow_down") { interval += 5000; continue; }
        throw new Error(td.error_description || td.error || "A autorização do GitHub não foi concluída.");
      }
      throw new Error("O código expirou. Clique em Conectar GitHub para gerar outro.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível conectar ao GitHub."); }
    finally { setGithubDeviceBusy(false); }
  }

  async function handleConnectGithub() {
    if (!githubToken.trim()) { setNotice("Cole um token do GitHub com acesso de leitura e gravação de Contents."); return; }
    setConnectingGithub(true);
    try {
      const user = await validateGitHubToken(githubToken);
      const repos = await listGitHubRepositories(githubToken);
      setGithubUser(user.login);
      setRepoOptions(repos);
      if (!repos.some((repo) => repo.full_name === selectedRepository) && repos[0]) {
        setSelectedRepository(repos[0].full_name);
        setSelectedBranch(repos[0].default_branch);
      }
      window.sessionStorage.setItem("lovable-rp-web-github-token", githubToken.trim());
      window.sessionStorage.setItem("lovable-rp-web-github-user", user.login);
      window.sessionStorage.setItem("lovable-rp-web-repository", selectedRepository);
      window.sessionStorage.setItem("lovable-rp-web-branch", selectedBranch);
      setNotice(`GitHub conectado como @${user.login}. ${repos.length} repositórios encontrados.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível conectar ao GitHub.");
    } finally { setConnectingGithub(false); }
  }

  async function handleTestGemini() {
    if (!geminiApiKey.trim()) { setNotice("Cole sua chave da API Gemini."); return; }
    setTestingGemini(true);
    try {
      await validateGeminiApiKey(geminiApiKey);
      setGeminiConnected(true);
      window.sessionStorage.setItem("lovable-rp-web-gemini-key", geminiApiKey.trim());
      setNotice("Gemini conectado e testado. A chave fica apenas nesta sessão do navegador.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível testar a chave Gemini.");
    } finally { setTestingGemini(false); }
  }

  async function executeCommand() {
    const prompt = commandText.trim();
    if (!prompt) { setNotice("Escreva o que você deseja alterar no projeto."); return; }
    if (!githubToken.trim() || !geminiApiKey.trim()) {
      setNotice("Para executar de verdade, conecte o GitHub e teste a chave Gemini na aba Conexões.");
      setActiveNav("Conexões");
      return;
    }
    setExecuting(true);
    setExecutionProgress("Iniciando execução...");
    setNotice("");
    try {
      const result = await executeGitHubEdit({
        githubToken, geminiApiKey, repository: selectedRepository, branch: selectedBranch, request: prompt,
        onProgress: setExecutionProgress,
      });
      let savedToDatabase = false;
      if (currentUserId && databaseStatus === "Supabase conectado") {
        try {
          const projectId = projects.find((project) => project.repository_full_name === result.repository)?.id ?? null;
          const { data: savedCommand, error: saveError } = await rpDb.from("lovable_rp_commands").insert({
            owner_id: currentUserId, project_id: projectId, prompt, status: "completed",
            result: JSON.stringify({ summary: result.summary, commitUrl: result.commitUrl, files: result.files }),
          }).select("id").single();
          if (!saveError && savedCommand) {
            await rpDb.from("lovable_rp_activity").insert({ owner_id: currentUserId, project_id: projectId, command_id: savedCommand.id, event_type: "command.completed", message: `${result.summary} · ${result.files.length} arquivo(s)` });
            savedToDatabase = true;
          }
        } catch { savedToDatabase = false; }
      }
      setActivity((current) => [{ id: result.commitSha, title: result.summary, detail: `${result.repository} · ${result.files.join(", ")}`, time: new Date().toLocaleString("pt-BR"), status: "Concluído" }, ...current]);
      setNotice(`Alteração gravada no GitHub: ${result.files.length} arquivo(s). Commit: ${result.commitUrl}${currentUserId && databaseStatus === "Supabase conectado" && !savedToDatabase ? " (o histórico não foi salvo no Supabase)" : savedToDatabase ? " · histórico salvo no Supabase" : ""}`);
      window.sessionStorage.setItem("lovable-rp-web-repository", selectedRepository);
      window.sessionStorage.setItem("lovable-rp-web-branch", selectedBranch);
      setActiveNav("Histórico");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao executar a alteração.";
      setActivity((current) => [{ id: Date.now(), title: prompt.slice(0, 70), detail: message, time: new Date().toLocaleString("pt-BR"), status: "Erro" }, ...current]);
      if (currentUserId && databaseStatus === "Supabase conectado") {
        try {
          const projectId = projects.find((project) => project.repository_full_name === selectedRepository)?.id ?? null;
          const { data: failedCommand, error: saveError } = await rpDb.from("lovable_rp_commands").insert({
            owner_id: currentUserId,
            project_id: projectId,
            prompt,
            status: "failed",
            error_message: message,
          }).select("id").single();
          if (!saveError && failedCommand) {
            await rpDb.from("lovable_rp_activity").insert({
              owner_id: currentUserId,
              project_id: projectId,
              command_id: failedCommand.id,
              event_type: "command.failed",
              message: message.slice(0, 1000),
            });
          }
        } catch {
          // A falha original continua visível no painel mesmo se o histórico estiver indisponível.
        }
      }
      setNotice(`A execução não foi concluída: ${message}`);
      setActiveNav("Histórico");
    } finally {
      setExecuting(false);
      setExecutionProgress("");
      setCommandText("");
    }
  }

  const selectedRepoOption = repoOptions.find((repo) => repo.full_name === selectedRepository);
  const currentProject = projects[0] ?? (selectedRepoOption ? { id: "github", name: selectedRepoOption.name, repository_full_name: selectedRepoOption.full_name, branch: selectedBranch || selectedRepoOption.default_branch, status: "active" } : { id: "empty", name: "Nenhum projeto conectado", repository_full_name: null, branch: "—", status: "empty" });
  const projectCount = databaseStatus === "Supabase conectado" ? projects.length : repoOptions.length ? 1 : 0;
  const activeTitle = activeNav === "Visão geral" ? "Visão geral" : activeNav;
  const activeDescription =
    activeNav === "Comandos" ? "Escreva o que você quer alterar e prepare uma solicitação."
    : activeNav === "Projetos" ? "Organize os repositórios que você utiliza nos seus trabalhos."
    : activeNav === "Histórico" ? "Acompanhe solicitações recentes e seus resultados."
    : activeNav === "Conexões" ? "Veja o estado das integrações que serão conectadas ao sistema."
    : activeNav === "Usuários" ? (isAdmin ? "Aprove, bloqueie ou reative contas registradas no Supabase." : "A gestão de usuários exige uma conta administradora aprovada.")
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
            <button onClick={() => { setActiveNav("Conexões"); setNotice("Gerencie as conexões de GitHub, Gemini e Supabase nesta área."); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"><Settings2 className="h-[18px] w-[18px]" /> Configurações</button>
            <button onClick={() => setNotice("Ajuda: conecte GitHub e Gemini na aba Conexões. Para usar login e histórico, o Supabase precisa estar ativo e receber a migração SQL do repositório.")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"><CircleHelp className="h-[18px] w-[18px]" /> Ajuda</button>
          </nav>

          <div className="m-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><span className="text-xs font-bold text-slate-800">Status de acesso</span></div>
            <p className="text-xs leading-5 text-slate-500">{signedInEmail || "Entre com sua conta para acessar os dados pessoais."}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">{databaseStatus}</div>
          </div>
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">MS</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{isAdmin ? "Administrador" : "Workspace"}</p><p className="truncate text-xs text-slate-500">{signedInEmail || "Sessão não autenticada"}</p></div>
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
              <button onClick={() => setNotice("As notificações em tempo real ainda não estão habilitadas. O histórico de comandos aparece na aba Histórico.")} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Estado das notificações"><Activity className="h-4 w-4" /></button>
              {signedInEmail ? <button onClick={handleSignOut} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50" title={signedInEmail}>Sair · {signedInEmail}</button> : <button onClick={() => { setActiveNav("Conexões"); setNotice("Entre ou crie uma conta na área de acesso abaixo."); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Entrar</button>}
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] p-4 sm:p-7 lg:p-9">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="mb-2 text-sm font-medium text-pink-600">Olá, Mário 👋</p><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">O que vamos construir hoje?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{activeDescription}</p></div>
              <button onClick={() => { setActiveNav("Conexões"); setNotice(signedInEmail ? "Conecte o GitHub na área de conexões para configurar repositórios." : "Entre na sua conta para gerenciar seu espaço de trabalho."); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-700"><Plus className="h-4 w-4" /> Novo projeto</button>
            </div>

            <section hidden={activeNav !== "Visão geral" && activeNav !== "Comandos"} className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#24152f] via-[#3b1740] to-[#6d174e] p-5 text-white shadow-xl shadow-pink-100 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[42px] border-white/5" />
              <div className="pointer-events-none absolute right-28 top-20 h-36 w-36 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="relative grid gap-7 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-300/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-pink-100"><Zap className="h-3.5 w-3.5" /> SEU ASSISTENTE DE DESENVOLVIMENTO</div><h3 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">Transforme suas ideias em tarefas executáveis.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-pink-100/75">Descreva a alteração que você precisa. Aqui você poderá organizar pedidos, projetos e resultados em um só lugar.</p>
                  <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Code2 className="mr-1.5 inline h-3.5 w-3.5" /> Código</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Github className="mr-1.5 inline h-3.5 w-3.5" /> GitHub</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Sparkles className="mr-1.5 inline h-3.5 w-3.5" /> Automação</span></div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm sm:p-5">
                  <label htmlFor="rp-command" className="mb-3 block text-sm font-semibold">Qual tarefa você quer realizar?</label>
                  <textarea id="rp-command" value={commandText} onChange={(event) => setCommandText(event.target.value)} placeholder="Ex.: Altere a cor do botão principal para vermelho e verifique os arquivos afetados..." className="min-h-32 w-full resize-y rounded-xl border border-white/15 bg-[#1c1025]/70 p-3 text-sm leading-6 text-white outline-none placeholder:text-white/40 focus:border-pink-300/70 focus:ring-2 focus:ring-pink-400/20" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setCommandText("Crie uma nova página responsiva e profissional, integrada ao estilo visual existente. Analise os arquivos antes de alterar e preserve as funcionalidades atuais.")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-pink-100 hover:bg-white/10">＋ Criar página</button>
                    <button type="button" onClick={() => setCommandText("Analise o projeto e implemente a melhoria que descrevi no campo principal, alterando somente os arquivos necessários e preservando o restante.")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-pink-100 hover:bg-white/10">✎ Editar projeto</button>
                    <button type="button" onClick={() => setCommandText("Revise a autenticação do projeto usando Supabase Auth, com rotas protegidas, validações e mensagens de erro claras. Não exponha chaves privadas no frontend.")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-pink-100 hover:bg-white/10">⚙ Configurar autenticação</button>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-[11px] text-pink-100/70">{executionProgress || "GitHub + Gemini · execução real após conectar"}</span><button onClick={executeCommand} disabled={executing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-950/30 transition hover:bg-pink-400 disabled:cursor-wait disabled:opacity-60"><Play className="h-4 w-4" /> {executing ? "Executando..." : "Executar alteração"}</button></div>
                </div>
              </div>
            </section>

            {notice && <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><p className="flex-1">{notice}</p><button onClick={() => setNotice("")} aria-label="Fechar aviso"><X className="h-4 w-4" /></button></div>}

            {activeNav !== "Visão geral" && activeNav !== "Comandos" && (
              <section className="mb-7 grid gap-5 xl:grid-cols-2">
                {activeNav === "Projetos" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div><h3 className="font-bold">Seus projetos</h3><p className="mt-1 text-sm text-slate-500">Repositórios que poderão ser gerenciados pelo painel.</p></div>
                      <button onClick={() => setActiveNav("Conexões")} className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-700"><Plus className="h-4 w-4" /> Configurar conexões</button>
                    </div>
                    {projects.map((project) => (
                      <div key={project.id} className="mb-3 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="h-5 w-5" /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{project.name}</p><p className="truncate text-xs text-slate-500">{project.repository_full_name ?? "Repositório não informado"}</p></div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Branch: {project.branch}</span>
                        <button onClick={() => { if (project.repository_full_name) { setSelectedRepository(project.repository_full_name); setSelectedBranch(project.branch || "main"); window.sessionStorage.setItem("lovable-rp-web-repository", project.repository_full_name); window.sessionStorage.setItem("lovable-rp-web-branch", project.branch || "main"); setNotice("Repositório selecionado para a próxima execução."); } else { setNotice("Conecte o GitHub e selecione um repositório."); setActiveNav("Conexões"); } }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50">Selecionar</button>
                      </div>
                    ))}
                    {databaseStatus === "Supabase conectado" && projects.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Nenhum projeto salvo no banco ainda.</p>}
                  </div>
                )}
                {activeNav === "Histórico" && (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <div className="border-b border-slate-100 p-5"><h3 className="font-bold">Histórico de comandos</h3><p className="mt-1 text-sm text-slate-500">Pedidos recentes e estado de cada operação.</p></div>
                    <div className="divide-y divide-slate-100">
                      {filteredActivity.map((item) => <div key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p><p className="mt-1 text-[11px] text-slate-400">{item.time}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${item.status === "Concluído" ? "bg-emerald-50 text-emerald-700" : item.status === "Erro" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span></div>)}
                      {filteredActivity.length === 0 && <p className="p-8 text-center text-sm text-slate-400">Nenhum comando encontrado.</p>}
                    </div>
                  </div>
                )}
                {activeNav === "Conexões" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <h3 className="font-bold">Conexões e integrações</h3><p className="mt-1 text-sm text-slate-500">Conecte as ferramentas que o site precisa para editar o código.</p>
                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2"><Github className="h-5 w-5" /><h4 className="text-sm font-bold">GitHub</h4>{githubUser && <span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Conectado</span>}</div>
                        <label htmlFor="rp-github-client-id" className="mt-4 block text-xs font-semibold text-slate-600">Client ID do OAuth App</label>
                        <input id="rp-github-client-id" type="text" autoComplete="off" value={githubClientId} onChange={(event) => { setGithubClientId(event.target.value); window.sessionStorage.setItem("lovable-rp-web-github-client-id", event.target.value); }} placeholder="Ex.: Iv1.xxxxx ou Ov23..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">Use o Client ID público do OAuth App da Lovable RP, com Device Flow ativado. Não cole o Client Secret nem seu token pessoal.</p>
                        <p className="mt-3 text-xs leading-5 text-slate-500">Conecte sua conta pela página oficial do GitHub. O código será gerado pelo GitHub e a conexão será verificada automaticamente.</p>
                        <button onClick={handleStartGithubDeviceFlow} disabled={githubDeviceBusy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-orange-400 px-4 py-3 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-60"><Github className="h-4 w-4" />{githubDeviceBusy ? "Aguardando autorização..." : githubUser ? "Reconectar GitHub" : "Conectar GitHub"}<ArrowRight className="h-4 w-4" /></button>
                        {githubDeviceUserCode && <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-bold text-violet-950">Autorize no GitHub</p><p className="mt-1 text-xs text-violet-800">Use o código abaixo na página que foi aberta.</p><div className="mt-3 rounded-lg bg-violet-950 px-3 py-4 text-center font-mono text-2xl font-extrabold tracking-[0.2em] text-fuchsia-300">{githubDeviceUserCode}</div><button onClick={() => { void navigator.clipboard.writeText(githubDeviceUserCode); setNotice("Código de autorização copiado."); }} className="mt-2 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-950">Copiar código</button><p className="mt-2 text-center text-[11px] text-violet-800">Aguardando autorização… verificação automática</p></div>}
                        {githubUser && <p className="mt-3 text-xs text-emerald-700">✓ Conectado como @{githubUser} · {repoOptions.length} repositórios encontrados</p>}
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-pink-600" /><h4 className="text-sm font-bold">Gemini API</h4>{geminiApiKey && <span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Chave informada</span>}</div>
                        <label htmlFor="rp-gemini-key" className="mt-4 block text-xs font-semibold text-slate-600">Chave da API Gemini</label>
                        <input id="rp-gemini-key" type="password" autoComplete="off" value={geminiApiKey} onChange={(event) => { setGeminiApiKey(event.target.value); setGeminiConnected(false); }} placeholder="AIza..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">A execução web usa uma API de IA; não usa automaticamente a sessão ou os conectores do ChatGPT.</p>
                        <button onClick={handleTestGemini} disabled={testingGemini} className="mt-3 w-full rounded-xl bg-pink-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-pink-700 disabled:opacity-60">{testingGemini ? "Testando chave..." : "Testar e salvar nesta sessão"}</button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                      <div><label htmlFor="rp-repository" className="block text-xs font-semibold text-slate-600">Repositório GitHub</label><input id="rp-repository" list="lovable-rp-repositories" value={selectedRepository} onChange={(event) => { setSelectedRepository(event.target.value); window.sessionStorage.setItem("lovable-rp-web-repository", event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400" /><datalist id="lovable-rp-repositories">{repoOptions.map((repo) => <option key={repo.full_name} value={repo.full_name}>{repo.private ? "Privado" : "Público"}</option>)}</datalist></div>
                      <div><label htmlFor="rp-branch" className="block text-xs font-semibold text-slate-600">Branch de destino</label><input id="rp-branch" value={selectedBranch} onChange={(event) => { setSelectedBranch(event.target.value); window.sessionStorage.setItem("lovable-rp-web-branch", event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400" /></div>
                    </div>
                    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Segurança: os tokens ficam temporariamente no sessionStorage desta aba, não no banco. Use somente em ambiente confiável e remova a sessão ao terminar. A execução cria um commit GitHub; revise sempre os arquivos antes de publicar.</p>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {[{ name: "GitHub", detail: "Repositórios, branches e commits", icon: Github }, { name: "Supabase", detail: "Banco de dados e permissões", icon: DatabaseIcon }, { name: "Gemini", detail: "IA para analisar e editar arquivos", icon: Bot }].map((connection) => { const Icon = connection.icon; const connected = connection.name === "GitHub" ? !!githubUser : connection.name === "Gemini" ? geminiConnected : databaseStatus === "Supabase conectado"; return <div key={connection.name} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700"><Icon className="h-5 w-5" /></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{connected ? "Conectado" : "Pendente"}</span></div><p className="mt-4 text-sm font-bold">{connection.name}</p><p className="mt-1 text-xs leading-5 text-slate-500">{connection.detail}</p><button onClick={() => setNotice(connection.name === "Supabase" ? "O banco precisa estar ativo e receber a migração do Lovable RP Web." : `A integração real com ${connection.name} ainda não foi configurada.`)} className="mt-4 text-xs font-bold text-pink-600 hover:text-pink-700">Ver configuração <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>; })}
                    </div>
                    <div className="mt-5 rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="font-bold">Acesso ao Lovable RP Web</h4><p className="mt-1 text-xs text-slate-500">Login e cadastro com Supabase Auth. O novo cadastro fica pendente até aprovação.</p></div><div className="flex rounded-lg bg-slate-100 p-1"><button onClick={() => setAuthMode("login")} className={`rounded-md px-3 py-1.5 text-xs font-bold ${authMode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}>Entrar</button><button onClick={() => setAuthMode("signup")} className={`rounded-md px-3 py-1.5 text-xs font-bold ${authMode === "signup" ? "bg-white shadow-sm" : "text-slate-500"}`}>Criar conta</button></div></div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><label htmlFor="rp-auth-email" className="block text-xs font-semibold text-slate-600">E-mail</label><input id="rp-auth-email" type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400" placeholder="voce@exemplo.com" /></div><div><label htmlFor="rp-auth-password" className="block text-xs font-semibold text-slate-600">Senha</label><input id="rp-auth-password" type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400" placeholder="Mínimo de 8 caracteres" /></div></div>
                      <button onClick={() => void handleAuth()} disabled={authBusy} className="mt-3 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-700 disabled:opacity-60">{authBusy ? "Aguarde..." : authMode === "login" ? "Entrar com Supabase" : "Criar minha conta"}</button>
                      {signedInEmail && <button onClick={() => void handleSignOut()} className="ml-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50">Sair</button>}
                    </div>
                    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Status do banco: {databaseStatus}. {databaseStatus === "Supabase conectado" ? "Autenticação e persistência estão respondendo; confirme que a migração Lovable RP está aplicada para habilitar todas as tabelas." : "Autenticação, aprovação e histórico persistente dependem de um Supabase ativo, variáveis de ambiente corretas e da migração SQL aplicada."} O site não reutiliza automaticamente a sessão da extensão ChatGPT.</p>
                  </div>
                )}
                {activeNav === "Usuários" && (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <div className="border-b border-slate-100 p-5"><h3 className="font-bold">Controle de acesso</h3><p className="mt-1 text-sm text-slate-500">Aprovação real de usuários autorizados pelo Supabase.</p></div>
                    {!signedInEmail ? <p className="p-6 text-sm text-slate-500">Faça login na área Conexões. A lista só é exibida para administradores autenticados e aprovados.</p> : !isAdmin ? <p className="p-6 text-sm text-slate-500">Esta área exige o perfil de administrador aprovado. Seu status atual: {databaseStatus}.</p> : adminUsers.length === 0 ? <p className="p-6 text-sm text-slate-500">Nenhum usuário carregado ou o Supabase está indisponível.</p> :
                      <div className="divide-y divide-slate-100">{adminUsers.map((user) => <div key={user.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-700">{(user.full_name || user.email || "U").split(" ").map((part) => part[0]).slice(0,2).join("").toUpperCase()}</div><div className="min-w-0 flex-1"><p className="break-all text-sm font-bold">{user.full_name || "Sem nome"}</p><p className="break-all text-xs text-slate-500">{user.email || user.id}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{user.role} · {user.access_status}</span><div className="flex flex-wrap gap-2"><button onClick={() => void handleAdminStatus(user.id,"approved")} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50">Aprovar</button><button onClick={() => void handleAdminStatus(user.id,"pending")} className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50">Pendente</button><button onClick={() => void handleAdminStatus(user.id,"blocked")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Bloquear</button></div></div>)}</div>}
                  </div>
                )}
              </section>
            )}

            <section hidden={activeNav !== "Visão geral"} className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Projetos conectados", value: String(projectCount).padStart(2, "0"), detail: databaseStatus === "Supabase conectado" ? "Dados do Supabase" : repoOptions.length ? "Repositório GitHub selecionado" : "Nenhum repositório verificado", icon: FolderGit2, trend: databaseStatus === "Supabase conectado" ? "Supabase" : repoOptions.length ? "GitHub" : "Aguardando conexão" }, 
                { label: "Comandos registrados", value: String(activity.length).padStart(2, "0"), detail: databaseStatus === "Supabase conectado" ? "Histórico do banco" : "Atividade desta sessão", icon: Command, trend: databaseStatus === "Supabase conectado" ? "Banco" : "Sessão" }, 
                { label: "Tarefas concluídas", value: String(activity.filter((item) => item.status === "Concluído").length).padStart(2, "0"), detail: "Comandos concluídos nesta sessão", icon: CheckCircle2, trend: "Sessão" },
                { label: "Tempo economizado", value: "—", detail: "Disponível após integração", icon: Clock3, trend: "Em breve" },
              ].map((stat) => {
                const Icon = stat.icon;
                return <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/60"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600"><Icon className="h-5 w-5" /></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{stat.trend}</span></div><p className="mt-5 text-2xl font-extrabold tracking-tight">{stat.value}</p><p className="mt-1 text-sm font-semibold text-slate-700">{stat.label}</p><p className="mt-1 text-xs text-slate-400">{stat.detail}</p></div>;
              })}
            </section>

            <section hidden={activeNav !== "Visão geral"} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-100/60">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold">Atividade recente</h3><p className="mt-1 text-xs text-slate-500">Pedidos e atualizações do workspace</p></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Buscar atividade" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-pink-300 sm:w-48" /></div></div>
                <div className="divide-y divide-slate-100">
                  {filteredActivity.length ? filteredActivity.map((item) => <div key={item.id} className="flex items-start gap-3 p-5"><div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.status === "Concluído" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{item.status === "Concluído" ? <Check className="h-4 w-4" /> : <FileCode2 className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-1 truncate text-xs text-slate-500">{item.detail}</p><p className="mt-2 text-[11px] text-slate-400">{item.time}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === "Concluído" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span></div>) : <p className="p-8 text-center text-sm text-slate-400">Nenhuma atividade encontrada.</p>}
                </div>
                <button onClick={() => setActiveNav("Histórico")} className="flex w-full items-center justify-center gap-2 border-t border-slate-100 p-4 text-xs font-bold text-pink-600 transition hover:bg-pink-50">Ver histórico completo <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/60">
                  <div className="flex items-center justify-between"><div><h3 className="font-bold">Projeto conectado</h3><p className="mt-1 text-xs text-slate-500">Estado real da conexão</p></div><button onClick={() => setActiveNav("Projetos")} aria-label="Ver projetos" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><MoreHorizontal className="h-5 w-5" /></button></div>
                  <div className="mt-5 rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{currentProject.name}</p><p className="text-xs text-slate-500">{currentProject.repository_full_name ?? "Repositório não informado"}</p></div><span className="h-2 w-2 rounded-full bg-emerald-500" /></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">Branch principal</span><code className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{currentProject.branch}</code></div><p className="mt-3 text-[11px] leading-5 text-amber-700">{databaseStatus === "Supabase conectado" ? "Projeto carregado do Supabase. As alterações de código são confirmadas pelo link de commit do GitHub." : selectedRepoOption ? "Repositório carregado do GitHub; o cadastro persistente de projetos depende do Supabase ativo." : "Nenhum repositório confirmado. Conecte o GitHub na aba Conexões para carregar seus projetos reais."}</p></div>
                  <button onClick={() => { setActiveNav("Projetos"); setNotice(repoOptions.length ? "Selecione o repositório e a branch na aba Conexões." : "Conecte o GitHub para carregar repositórios e branches reais."); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"><Plus className="h-4 w-4" /> Gerenciar projetos</button>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/60">
                  <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Gauge className="h-4 w-4" /></div><div><h3 className="text-sm font-bold">Status das integrações</h3><p className="text-xs text-slate-500">Conexões para configurar</p></div></div>
                  <div className="mt-4 space-y-3">{[{name:"GitHub",detail:"Repositórios e commits",icon:Github,connected:!!githubUser},{name:"Gemini",detail:"IA para analisar e editar arquivos",icon:Bot,connected:geminiConnected},{name:"Supabase",detail:"Dados e permissões",icon:DatabaseIcon,connected:databaseStatus === "Supabase conectado"}].map((connection) => { const Icon = connection.icon; return <div key={connection.name} className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{connection.name}</p><p className="text-[10px] text-slate-400">{connection.detail}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${connection.connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{connection.connected ? "Conectado" : "Pendente"}</span></div>; })}</div>
                  <button onClick={() => setActiveNav("Conexões")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100">Ver integrações <ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </section>
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row"><span>Lovable RP Web · versão web em implementação</span><span>Tokens do GitHub/Gemini ficam só na sessão do navegador; dados e permissões dependem do Supabase ativo.</span></footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function DatabaseIcon(props: ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" /></svg>;
}
