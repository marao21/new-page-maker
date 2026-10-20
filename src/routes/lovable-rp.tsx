import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { isSupabaseConfigured, supabase } from "../integrations/supabase/client";
import { LocalPreviewBuilder } from "../components/local-preview-builder";
import { createGitHubProject, executeGitHubEdit, listGitHubRepositories, listGeminiModels, listOpenAIModels, listOpenRouterModels, validateGeminiApiKey, validateOpenAIApiKey, validateGitHubToken, type AIModelOption, type AIProvider, type GitHubRepoOption } from "../lib/lovable-rp-engine";
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
  { label: "Prévia", icon: Play },
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
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"login"|"signup">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string|null>(null);
  const [commandText, setCommandText] = useState("");
  const [commandMode, setCommandMode] = useState<"edit" | "new">("edit");
  const [newProjectName, setNewProjectName] = useState("meu-novo-projeto");
  const [assistantReply, setAssistantReply] = useState<{title:string;summary:string;details:string[];links:Array<{label:string;url:string}>;needsSupabase?:boolean;supabaseReason?:string}|null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewInput, setPreviewInput] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<AIProvider>("gemini");
  const [aiModel, setAiModel] = useState("gemini-3.8-flash");
  const [geminiModelOptions, setGeminiModelOptions] = useState<AIModelOption[]>([]);
  const [openaiModels, setOpenaiModels] = useState<AIModelOption[]>([]);
  const [openrouterModels, setOpenrouterModels] = useState<AIModelOption[]>([]);
  const [testingOpenRouter, setTestingOpenRouter] = useState(false);
  const [openrouterConnected, setOpenrouterConnected] = useState(false);
  const [githubUser, setGithubUser] = useState("");
  const [repoOptions, setRepoOptions] = useState<GitHubRepoOption[]>([]);
  const [selectedRepository, setSelectedRepository] = useState("marao21/new-page-maker");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [githubDeviceUserCode, setGithubDeviceUserCode] = useState("");
  const githubClientId = "Iv23liJiWvTpCYrEmnmM";
  const [githubDeviceBusy, setGithubDeviceBusy] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const [openaiConnected, setOpenaiConnected] = useState(false);
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
    const oauthResult = new URLSearchParams(window.location.search).get("supabase_oauth");
    if (oauthResult) {
      const messages: Record<string, string> = {
        connected: "Supabase Management API autorizada. O token está guardado em cookie protegido do servidor.",
        not_configured: "Falta configurar SUPABASE_OAUTH_CLIENT_ID e SUPABASE_OAUTH_CLIENT_SECRET no servidor e registrar o OAuth App no painel Supabase.",
        denied: "A autorização do Supabase foi cancelada ou negada.",
        invalid_state: "A validação de segurança do OAuth falhou. Tente conectar novamente.",
        token_exchange_failed: "O Supabase retornou, mas a troca do código por token falhou. Confira Client ID, segredo e URL de retorno.",
      };
      setNotice(messages[oauthResult] || "Não foi possível concluir a autorização do Supabase.");
      window.history.replaceState({}, "", window.location.pathname);
    }
    let active = true;
    async function restoreConnections() {
      const token = window.sessionStorage.getItem("lovable-rp-web-github-token") || "";
      setGithubToken(token);
      setGithubUser(window.sessionStorage.getItem("lovable-rp-web-github-user") || "");
      setGeminiApiKey(window.sessionStorage.getItem("lovable-rp-web-gemini-key") || "");
      setOpenaiApiKey(window.sessionStorage.getItem("lovable-rp-web-openai-key") || "");
      setOpenrouterApiKey(window.sessionStorage.getItem("lovable-rp-web-openrouter-key") || "");
      setAiProvider((window.sessionStorage.getItem("lovable-rp-web-ai-provider") as AIProvider) || "gemini");
      setAiModel(window.sessionStorage.getItem("lovable-rp-web-ai-model") || "gemini-3.8-flash");
      setOpenaiConnected(!!window.sessionStorage.getItem("lovable-rp-web-openai-key"));
      setGeminiConnected(!!window.sessionStorage.getItem("lovable-rp-web-gemini-key"));
      setOpenrouterConnected(!!window.sessionStorage.getItem("lovable-rp-web-openrouter-key"));
      setSelectedRepository(window.sessionStorage.getItem("lovable-rp-web-repository") || "marao21/new-page-maker");
      setSelectedBranch(window.sessionStorage.getItem("lovable-rp-web-branch") || "main");
      const savedPreview = window.sessionStorage.getItem("lovable-rp-web-preview-url") || "";
      setPreviewUrl(savedPreview);
      setPreviewInput(savedPreview);
      if (!token) return;
      try {
        const repos = await listGitHubRepositories(token);
        if (!active) return;
        setRepoOptions(repos);
        const savedRepo = window.sessionStorage.getItem("lovable-rp-web-repository") || "";
        if (savedRepo && repos.some((repo) => repo.full_name === savedRepo)) {
          setSelectedRepository(savedRepo);
        } else if (repos[0]) {
          setSelectedRepository(repos[0].full_name);
          setSelectedBranch(repos[0].default_branch || "main");
        }
      } catch {
        if (active) setNotice("A sessão do GitHub foi encontrada, mas não consegui carregar os repositórios. Clique em Conectar GitHub para autorizar novamente.");
      }
    }
    void restoreConnections();
    return () => { active = false; };
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
    const clientId = githubClientId;
    setGithubDeviceBusy(true); setGithubDeviceUserCode(""); setNotice("");
    // Open synchronously from the click so the browser does not block the GitHub authorization tab.
    const authWindow = window.open("about:blank", "_blank");
    try {
      if (authWindow) {
        authWindow.document.title = "Conectando ao GitHub";
        authWindow.document.body.innerHTML = "<p style='font-family:system-ui;padding:24px'>Solicitando código seguro ao GitHub…</p>";
      }
      const response = await fetch("/api/github/oauth", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "device_code", params: { client_id: clientId, scope: "repo read:user" } }),
      });
      const data = await response.json();
      if (!response.ok || !data.device_code || !data.user_code) throw new Error(data.error_description || data.error || "O GitHub não iniciou a autorização. Confira o Client ID e se Device Flow está ativado.");
      setGithubDeviceUserCode(data.user_code);
      const verificationUri = data.verification_uri || "https://github.com/login/device";
      if (authWindow && !authWindow.closed) authWindow.location.href = verificationUri;
      else window.location.href = verificationUri;
      let interval = Math.max(Number(data.interval) || 5, 5) * 1000;
      const expiresAt = Date.now() + Math.min(Number(data.expires_in) || 900, 900) * 1000;
      while (Date.now() < expiresAt) {
        await new Promise((resolve) => window.setTimeout(resolve, interval));
        const tokenResponse = await fetch("/api/github/oauth", {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "access_token",
            params: {
              client_id: clientId,
              device_code: data.device_code,
              grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            },
          }),
        });
        const tokenData = await tokenResponse.json();
        if (tokenData.access_token) {
          const user = await validateGitHubToken(tokenData.access_token);
          const repos = await listGitHubRepositories(tokenData.access_token);
          setGithubToken(tokenData.access_token); setGithubUser(user.login); setRepoOptions(repos);
          window.sessionStorage.setItem("lovable-rp-web-github-token", tokenData.access_token);
          window.sessionStorage.setItem("lovable-rp-web-github-user", user.login);
          if (!repos.some((repo) => repo.full_name === selectedRepository) && repos[0]) {
            setSelectedRepository(repos[0].full_name); setSelectedBranch(repos[0].default_branch);
          }
          setGithubDeviceUserCode(""); setNotice("GitHub conectado como @" + user.login + ". " + repos.length + " repositórios encontrados.");
          if (authWindow && !authWindow.closed) authWindow.close();
          return;
        }
        if (tokenData.error === "authorization_pending") continue;
        if (tokenData.error === "slow_down") { interval += 5000; continue; }
        if (tokenData.error === "device_flow_disabled") throw new Error("Device Flow está desativado nas configurações do OAuth App do GitHub.");
        if (tokenData.error === "incorrect_client_credentials") throw new Error("O Client ID não é válido para este fluxo.");
        if (tokenData.error === "access_denied") throw new Error("A autorização foi cancelada no GitHub.");
        if (tokenData.error === "expired_token" || tokenData.error === "token_expired") throw new Error("O código expirou. Clique em Conectar GitHub para gerar outro.");
        throw new Error(tokenData.error_description || tokenData.error || "A autorização do GitHub não foi concluída.");
      }
      throw new Error("O código expirou. Clique em Conectar GitHub para gerar outro.");
    } catch (error) {
      if (authWindow && !authWindow.closed) authWindow.close();
      setNotice(error instanceof Error ? error.message : "Não foi possível conectar ao GitHub. Confira o Client ID e as configurações do aplicativo.");
    } finally { setGithubDeviceBusy(false); }
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

  function disconnectGemini() {
    window.sessionStorage.removeItem("lovable-rp-web-gemini-key");
    setGeminiApiKey(""); setGeminiConnected(false); setGeminiModelOptions([]);
    if (aiProvider === "gemini") { setAiModel(""); window.sessionStorage.removeItem("lovable-rp-web-ai-model"); }
    setNotice("Chave Gemini desconectada e removida desta sessão.");
  }

  function disconnectOpenAI() {
    window.sessionStorage.removeItem("lovable-rp-web-openai-key");
    setOpenaiApiKey(""); setOpenaiConnected(false); setOpenaiModels([]);
    if (aiProvider === "openai") { setAiModel(""); window.sessionStorage.removeItem("lovable-rp-web-ai-model"); }
    setNotice("Chave OpenAI desconectada e removida desta sessão.");
  }

  function disconnectOpenRouter() {
    window.sessionStorage.removeItem("lovable-rp-web-openrouter-key");
    setOpenrouterApiKey(""); setOpenrouterConnected(false); setOpenrouterModels([]);
    if (aiProvider === "openrouter") { setAiModel(""); window.sessionStorage.removeItem("lovable-rp-web-ai-model"); }
    setNotice("Chave OpenRouter desconectada e removida desta sessão.");
  }

  function disconnectGithub() {
    window.sessionStorage.removeItem("lovable-rp-web-github-token");
    window.sessionStorage.removeItem("lovable-rp-web-github-user");
    setGithubToken(""); setGithubUser(""); setRepoOptions([]);
    setNotice("GitHub desconectado e token removido desta sessão.");
  }

  async function handleTestGemini() {
    if (!geminiApiKey.trim()) { setNotice("Cole sua chave da API Gemini."); return; }
    setTestingGemini(true);
    try {
      await validateGeminiApiKey(geminiApiKey);
      const models = await listGeminiModels(geminiApiKey);
      setGeminiModelOptions(models);
      if (models.length) { const preferred = models.find((model) => /gemini-3\.8-flash/i.test(model.id)) || models.find((model) => /flash/i.test(model.id)) || models[0]; setAiModel(preferred.id); window.sessionStorage.setItem("lovable-rp-web-ai-model", preferred.id); }
      window.sessionStorage.setItem("lovable-rp-web-ai-provider", "gemini");
      setAiProvider("gemini");
      setGeminiConnected(true);
      window.sessionStorage.setItem("lovable-rp-web-gemini-key", geminiApiKey.trim());
      setNotice("Gemini conectado. " + (models.length ? models.length + " modelos encontrados; escolha o modelo na lista." : "A chave foi validada, mas a API não retornou modelos compatíveis."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível testar a chave Gemini.");
    } finally { setTestingGemini(false); }
  }

  async function handleTestOpenAI() {
    if (!openaiApiKey.trim()) { setNotice("Cole sua chave da API OpenAI."); return; }
    setTestingOpenAI(true);
    try {
      await validateOpenAIApiKey(openaiApiKey);
      setOpenaiConnected(true);
      setAiProvider("openai");
      setAiModel("gpt-4.1-mini");
      window.sessionStorage.setItem("lovable-rp-web-ai-provider", "openai");
      window.sessionStorage.setItem("lovable-rp-web-ai-model", "gpt-4.1-mini");
      window.sessionStorage.setItem("lovable-rp-web-openai-key", openaiApiKey.trim());
      setNotice("OpenAI API conectada e testada. A chave fica apenas nesta sessão do navegador.");
    } catch (error) {
      setOpenaiConnected(false);
      setNotice(error instanceof Error ? error.message : "Não foi possível testar a chave OpenAI.");
    } finally { setTestingOpenAI(false); }
  }


  async function handleTestOpenRouter() {
    if (!openrouterApiKey.trim()) { setNotice("Cole sua chave da API OpenRouter."); return; }
    setTestingOpenRouter(true);
    try {
      const models = await listOpenRouterModels(openrouterApiKey);
      if (!models.length) throw new Error("Nenhum modelo de texto foi encontrado nessa conta OpenRouter.");
      setOpenrouterModels(models);
      setAiModel(models[0].id);
      setAiProvider("openrouter");
      window.sessionStorage.setItem("lovable-rp-web-ai-provider", "openrouter");
      setOpenrouterConnected(true);
      window.sessionStorage.setItem("lovable-rp-web-openrouter-key", openrouterApiKey.trim());
      setNotice("OpenRouter conectado. " + models.length + " modelos encontrados; escolha o modelo na lista.");
    } catch (error) {
      setOpenrouterConnected(false);
      setNotice(error instanceof Error ? error.message : "Não foi possível carregar os modelos OpenRouter.");
    } finally { setTestingOpenRouter(false); }
  }

  async function executeCommand() {
    const prompt = commandText.trim();
    if (!prompt) { setNotice("Descreva o projeto ou a alteração que deseja."); return; }
    const aiConnected = aiProvider === "openai" ? !!openaiApiKey.trim() && openaiConnected : aiProvider === "openrouter" ? !!openrouterApiKey.trim() && openrouterConnected : !!geminiApiKey.trim() && geminiConnected;
    if (!githubToken.trim() || !aiConnected) {
      setNotice(!githubToken.trim() ? "Conecte o GitHub antes de criar ou editar. A criação do zero não exige selecionar um repositório existente." : "Conecte e teste o provedor de IA selecionado antes de executar.");
      setActiveNav("Conexões");
      return;
    }
    if (commandMode === "edit" && (!selectedRepository.trim() || !selectedBranch.trim())) {
      setNotice("Para editar, selecione um repositório e uma branch. Para criar do zero, escolha ‘Criar projeto do zero’.");
      setActiveNav("Projetos");
      return;
    }
    setExecuting(true);
    setExecutionProgress(commandMode === "new" ? "Planejando o novo projeto..." : "Analisando o pedido...");
    setNotice("");
    setAssistantReply(null);
    try {
      if (commandMode === "new") {
        const result = await createGitHubProject({
          githubToken, geminiApiKey, openaiApiKey, openrouterApiKey, aiProvider, aiModel,
          projectName: newProjectName, request: prompt, onProgress: setExecutionProgress,
        });
        setSelectedRepository(result.repository);
        setSelectedBranch(result.branch);
        window.sessionStorage.setItem("lovable-rp-web-repository", result.repository);
        window.sessionStorage.setItem("lovable-rp-web-branch", result.branch);
        setRepoOptions((current) => [{ full_name: result.repository, name: result.repository.split("/").pop() || result.repository, default_branch: result.branch, private: true, html_url: result.repoUrl }, ...current.filter((item) => item.full_name !== result.repository)]);
        setAssistantReply({
          title: "Seu projeto foi criado",
          summary: result.summary,
          details: [`Repositório: ${result.repository}`, `Branch: ${result.branch}`, `${result.files.length} arquivos iniciais criados`, result.needsSupabase ? "A IA identificou que o projeto precisa de Supabase." : "A IA identificou que o projeto pode funcionar sem Supabase."],
          links: [{label:"Abrir repositório",url:result.repoUrl},{label:"Ver commit inicial",url:result.commitUrl}],
          needsSupabase: result.needsSupabase,
          supabaseReason: result.supabaseReason,
        });
        setNotice("Novo projeto criado e arquivos enviados para o GitHub.");
      } else {
        const result = await executeGitHubEdit({
          githubToken, geminiApiKey, openaiApiKey, openrouterApiKey, aiProvider, aiModel, repository: selectedRepository, branch: selectedBranch, request: prompt,
          onProgress: setExecutionProgress,
        });
        setAssistantReply({title:"Alterações aplicadas",summary:result.summary,details:[`Repositório: ${result.repository}`,`Branch: ${result.branch}`,`Arquivos alterados: ${result.files.join(", ")}`],links:[{label:"Ver commit no GitHub",url:result.commitUrl}]});
        setActivity((current) => [{ id: result.commitSha, title: result.summary, detail: `${result.repository} · ${result.files.join(", ")}`, time: new Date().toLocaleString("pt-BR"), status: "Concluído" }, ...current]);
        setNotice(`Alteração gravada no GitHub: ${result.files.length} arquivo(s).`);
      }
      setActiveNav("Comandos");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir a tarefa.";
      setNotice(message);
      setAssistantReply({title:"Não foi possível concluir",summary:message,details:["Confira as conexões e permissões e tente novamente."],links:[]});
    } finally { setExecuting(false); }
  }

  const selectedRepoOption = repoOptions.find((repo) => repo.full_name === selectedRepository);
  const currentProject = projects[0] ?? (selectedRepoOption ? { id: "github", name: selectedRepoOption.name, repository_full_name: selectedRepoOption.full_name, branch: selectedBranch || selectedRepoOption.default_branch, status: "active" } : { id: "empty", name: "Nenhum projeto conectado", repository_full_name: null, branch: "—", status: "empty" });
  const projectCount = databaseStatus === "Supabase conectado" ? projects.length : repoOptions.length ? 1 : 0;
  const activeTitle = activeNav === "Visão geral" ? "Visão geral" : activeNav;
  const activeDescription =
    activeNav === "Comandos" ? "Escreva o que você quer alterar e prepare uma solicitação."
    : activeNav === "Projetos" ? "Organize os repositórios que você utiliza nos seus trabalhos."
    : activeNav === "Prévia" ? "Visualize seu site dentro do Lovable RP, sem precisar sair do painel."
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
              <button onClick={() => { setCommandMode("new"); setCommandText(""); setNewProjectName("meu-novo-projeto"); setActiveNav("Comandos"); setAssistantReply(null); setNotice(githubToken && (aiProvider === "gemini" ? geminiConnected : aiProvider === "openai" ? openaiConnected : openrouterConnected) ? "Descreva o projeto que deseja criar do zero." : "Antes de criar, conecte o GitHub e teste o provedor de IA em Conexões."); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-700"><Plus className="h-4 w-4" /> Novo projeto</button>
            </div>

            <section hidden={activeNav !== "Visão geral" && activeNav !== "Comandos"} className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#24152f] via-[#3b1740] to-[#6d174e] p-5 text-white shadow-xl shadow-pink-100 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[42px] border-white/5" />
              <div className="pointer-events-none absolute right-28 top-20 h-36 w-36 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="relative grid gap-7 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-300/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-pink-100"><Zap className="h-3.5 w-3.5" /> SEU ASSISTENTE DE DESENVOLVIMENTO</div><h3 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">Transforme suas ideias em tarefas executáveis.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-pink-100/75">Descreva a alteração que você precisa. Aqui você poderá organizar pedidos, projetos e resultados em um só lugar.</p>
                  <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Code2 className="mr-1.5 inline h-3.5 w-3.5" /> Código</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Github className="mr-1.5 inline h-3.5 w-3.5" /> GitHub</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85"><Sparkles className="mr-1.5 inline h-3.5 w-3.5" /> Automação</span></div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm sm:p-5">
                  <div className="mb-4 rounded-xl border border-white/15 bg-white/[0.07] p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div><p className="text-xs font-bold text-white">IA que vai executar esta tarefa</p><p className="mt-1 text-[11px] text-pink-100/70">Escolha o provedor e o modelo antes de enviar o pedido.</p></div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${(aiProvider === "gemini" ? geminiConnected : aiProvider === "openai" ? openaiConnected : openrouterConnected) ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>{(aiProvider === "gemini" ? geminiConnected : aiProvider === "openai" ? openaiConnected : openrouterConnected) ? "Conectada" : "Precisa conectar"}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label htmlFor="rp-command-ai-provider" className="mb-1 block text-[11px] font-semibold text-pink-100/80">Provedor de IA</label>
                        <select id="rp-command-ai-provider" value={aiProvider} onChange={(event) => { const value = event.target.value as AIProvider; setAiProvider(value); window.sessionStorage.setItem("lovable-rp-web-ai-provider", value); const list = value === "openai" ? openaiModels : value === "openrouter" ? openrouterModels : geminiModelOptions; const nextModel = list[0]?.id || (value === "gemini" ? "gemini-3.8-flash" : value === "openai" ? "gpt-4.1-mini" : ""); setAiModel(nextModel); window.sessionStorage.setItem("lovable-rp-web-ai-model", nextModel); }} className="w-full rounded-lg border border-white/15 bg-[#32152f] px-3 py-2 text-xs text-white outline-none focus:border-pink-300">
                          <option value="gemini">Google Gemini</option><option value="openai">OpenAI (GPT)</option><option value="openrouter">OpenRouter</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="rp-command-ai-model" className="mb-1 block text-[11px] font-semibold text-pink-100/80">Modelo</label>
                        <select id="rp-command-ai-model" value={aiModel} onChange={(event) => { setAiModel(event.target.value); window.sessionStorage.setItem("lovable-rp-web-ai-model", event.target.value); }} className="w-full rounded-lg border border-white/15 bg-[#32152f] px-3 py-2 text-xs text-white outline-none focus:border-pink-300" disabled={!(aiProvider === "gemini" ? geminiConnected : aiProvider === "openai" ? openaiConnected : openrouterConnected)}>
                          {!(aiProvider === "gemini" ? geminiModelOptions : aiProvider === "openai" ? openaiModels : openrouterModels).length && <option value={aiModel}>{aiModel || "Conecte a IA para listar modelos"}</option>}
                          {(aiProvider === "gemini" ? geminiModelOptions : aiProvider === "openai" ? openaiModels : openrouterModels).map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                        </select>
                      </div>
                    </div>
                    {!(aiProvider === "gemini" ? geminiConnected : aiProvider === "openai" ? openaiConnected : openrouterConnected) && <button type="button" onClick={() => setActiveNav("Conexões")} className="mt-2 text-[11px] font-bold text-pink-200 underline underline-offset-2">Conectar ou testar esta IA em Conexões</button>}
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { setCommandMode("edit"); setCommandText(""); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${commandMode === "edit" ? "bg-pink-500 text-white" : "border border-white/15 text-white/80"}`}>Editar projeto existente</button>
                    <button type="button" onClick={() => { setCommandMode("new"); setCommandText(""); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${commandMode === "new" ? "bg-pink-500 text-white" : "border border-white/15 text-white/80"}`}>Criar projeto do zero</button>
                  </div>
                  {commandMode === "new" && <div className="mb-4"><label htmlFor="rp-new-project-name" className="mb-2 block text-xs font-semibold">Nome do novo repositório</label><input id="rp-new-project-name" value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} placeholder="meu-projeto" className="w-full rounded-xl border border-white/15 bg-[#1c1025]/70 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-300" /><p className="mt-1 text-[11px] text-pink-100/70">A IA vai decidir pelo pedido se o projeto precisa de integração Supabase.</p></div>}
                  <label htmlFor="rp-command" className="mb-3 block text-sm font-semibold">{commandMode === "new" ? "Descreva o aplicativo ou site que quer criar" : "Qual tarefa você quer realizar?"}</label>
                  <textarea id="rp-command" value={commandText} onChange={(event) => setCommandText(event.target.value)} placeholder={commandMode === "new" ? "Ex.: Crie uma landing page moderna para uma pizzaria, com cardápio e botão para WhatsApp. Não precisa de banco de dados." : "Ex.: Altere a cor do botão principal para vermelho e verifique os arquivos afetados..."} className="min-h-32 w-full resize-y rounded-xl border border-white/15 bg-[#1c1025]/70 p-3 text-sm leading-6 text-white outline-none placeholder:text-white/40 focus:border-pink-300/70 focus:ring-2 focus:ring-pink-400/20" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setCommandText("Crie uma nova página responsiva e profissional, integrada ao estilo visual existente. Analise os arquivos antes de alterar e preserve as funcionalidades atuais.")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-pink-100 hover:bg-white/10">＋ Criar página</button>
                    <button type="button" onClick={() => setCommandText("Analise o projeto e implemente a melhoria que descrevi no campo principal, alterando somente os arquivos necessários e preservando o restante.")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-pink-100 hover:bg-white/10">✎ Editar projeto</button>
                    <button type="button" onClick={() => setCommandText("Revise a autenticação do projeto usando Supabase Auth, com rotas protegidas, validações e mensagens de erro claras. Não exponha chaves privadas no frontend.")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-pink-100 hover:bg-white/10">⚙ Configurar autenticação</button>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-[11px] text-pink-100/70">{executionProgress || "GitHub + Gemini · execução real após conectar"}</span><button onClick={executeCommand} disabled={executing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-950/30 transition hover:bg-pink-400 disabled:cursor-wait disabled:opacity-60"><Play className="h-4 w-4" /> {executing ? "Trabalhando..." : commandMode === "new" ? "Criar projeto" : "Executar alteração"}</button></div>
                </div>
              </div>
            </section>

            {assistantReply && <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-700"><Sparkles className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900">{assistantReply.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{assistantReply.summary}</p>
                {assistantReply.details.length > 0 && <ul className="mt-3 space-y-1 text-sm text-slate-600">{assistantReply.details.map((detail) => <li key={detail}>• {detail}</li>)}</ul>}
                {assistantReply.needsSupabase !== undefined && <div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-sm font-semibold">{assistantReply.needsSupabase ? "Supabase necessário" : "Supabase não é necessário para a primeira versão"}</p><p className="mt-1 text-xs leading-5 text-slate-600">{assistantReply.supabaseReason}</p>{assistantReply.needsSupabase && <p className="mt-2 text-xs text-amber-700">A criação/ligação da instância Supabase ainda requer autorização de gerenciamento e configuração das variáveis do projeto.</p>}</div>}
                {assistantReply.links.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{assistantReply.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-3 py-2 text-xs font-bold text-white">{link.label}<ArrowRight className="h-3.5 w-3.5" /></a>)}</div>}
              </div></div>
            </section>}

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
                    <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-5">
                      <div><h4 className="font-bold">Repositórios do GitHub</h4><p className="mt-1 text-xs text-slate-500">Lista carregada da conta GitHub conectada. Escolha um para editar.</p></div>
                      {!githubToken && <button onClick={() => setActiveNav("Conexões")} className="rounded-lg bg-pink-600 px-3 py-2 text-xs font-bold text-white">Conectar GitHub</button>}
                    </div>
                    {githubToken && repoOptions.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">Nenhum repositório carregado. Abra Conexões e reconecte o GitHub para atualizar a lista.</p>}
                    {repoOptions.filter((repo) => !projects.some((project) => project.repository_full_name === repo.full_name)).map((repo) => (
                      <div key={repo.full_name} className="mb-3 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Github className="h-5 w-5" /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{repo.name}</p><p className="truncate text-xs text-slate-500">{repo.full_name}</p></div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{repo.private ? "Privado" : "Público"} · {repo.default_branch}</span>
                        <button onClick={() => { setSelectedRepository(repo.full_name); setSelectedBranch(repo.default_branch || "main"); window.sessionStorage.setItem("lovable-rp-web-repository", repo.full_name); window.sessionStorage.setItem("lovable-rp-web-branch", repo.default_branch || "main"); setCommandMode("edit"); setActiveNav("Comandos"); setCommandText(""); setNotice("Projeto " + repo.full_name + " selecionado. Descreva a alteração que deseja fazer."); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50">Selecionar para editar</button>
                        <a href={repo.html_url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold hover:bg-slate-50">Abrir GitHub</a>
                      </div>
                    ))}
                    {databaseStatus === "Supabase conectado" && projects.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Nenhum projeto interno salvo no banco. Os repositórios GitHub aparecem na lista acima.</p>}
                    <p className="mt-4 text-xs leading-5 text-amber-700">Importante: a lista acima mostra repositórios do GitHub. Projetos da conta Supabase ainda não são listados automaticamente por esta tela; a conexão de gerenciamento do Supabase precisa estar concluída no servidor para buscar esses projetos.</p>
                  </div>
                )}
                {activeNav === "Prévia" && (
                  <>
                  <LocalPreviewBuilder />
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div><h3 className="font-bold">Prévia do projeto</h3><p className="mt-1 text-sm text-slate-500">Abra a versão publicada do seu projeto dentro deste painel.</p></div>
                      {previewUrl && <button onClick={() => { const frame = document.getElementById("rp-project-preview") as HTMLIFrameElement | null; if (frame) frame.src = previewUrl; }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50"><Play className="h-3.5 w-3.5" /> Atualizar prévia</button>}
                    </div>
                    <form onSubmit={(event) => { event.preventDefault(); const raw = previewInput.trim(); if (!raw) { setNotice("Cole o endereço publicado do seu projeto."); return; } let parsed: URL; try { parsed = new URL(raw.startsWith("http://") || raw.startsWith("https://") ? raw : "https://" + raw); } catch { setNotice("Esse endereço não parece válido. Use a URL publicada do Lovable ou Vercel."); return; } if (!["https:", "http:"].includes(parsed.protocol)) { setNotice("Use um endereço HTTP ou HTTPS válido."); return; } setPreviewUrl(parsed.toString()); setPreviewInput(parsed.toString()); window.sessionStorage.setItem("lovable-rp-web-preview-url", parsed.toString()); setNotice("Endereço da prévia salvo nesta sessão."); }} className="flex flex-col gap-2 sm:flex-row">
                      <input aria-label="URL publicada do projeto" value={previewInput} onChange={(event) => setPreviewInput(event.target.value)} placeholder="https://seu-projeto.lovable.app ou https://seu-projeto.vercel.app" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
                      <button type="submit" className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold text-white hover:bg-pink-700">Abrir dentro do site</button>
                    </form>
                    {previewUrl ? (
                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2"><p className="min-w-0 truncate text-xs text-slate-500">{previewUrl}</p><button onClick={() => { setPreviewUrl(""); setPreviewInput(""); window.sessionStorage.removeItem("lovable-rp-web-preview-url"); }} className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100">Limpar</button></div>
                        <iframe id="rp-project-preview" title="Prévia do projeto selecionado" src={previewUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads" className="h-[70vh] min-h-[480px] w-full bg-white" />
                        <p className="border-t border-slate-200 bg-white px-3 py-2 text-[11px] leading-5 text-slate-500">Se a prévia ficar em branco ou mostrar bloqueio, o site de destino pode impedir exibição em iframe. Nesse caso, será necessário habilitar a incorporação no site publicado ou usar uma prévia compatível.</p>
                      </div>
                    ) : (
                      <div className="mt-4 flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm"><Play className="h-6 w-6" /></div><p className="font-semibold">Sua prévia aparecerá aqui</p><p className="mt-1 max-w-lg text-sm text-slate-500">Cole a URL publicada do projeto no campo acima. O painel tenta carregar a página sem tirar você do Lovable RP.</p></div>
                    )}
                  </div>
                  </>
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
                        <p className="mt-4 text-xs leading-5 text-slate-500">Conexão segura com o aplicativo GitHub Lovable RP. Clique abaixo para gerar seu código de autorização.</p>
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">Use o Client ID público do OAuth App da Lovable RP, com Device Flow ativado. Não cole o Client Secret nem seu token pessoal.</p>
                        <p className="mt-3 text-xs leading-5 text-slate-500">Conecte sua conta pela página oficial do GitHub. O código será gerado pelo GitHub e a conexão será verificada automaticamente.</p>
                        <button onClick={handleStartGithubDeviceFlow} disabled={githubDeviceBusy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-orange-400 px-4 py-3 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-60"><Github className="h-4 w-4" />{githubDeviceBusy ? "Aguardando autorização..." : githubUser ? "Reconectar GitHub" : "Conectar GitHub"}<ArrowRight className="h-4 w-4" /></button>
                        {githubDeviceUserCode && <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-bold text-violet-950">Autorize no GitHub</p><p className="mt-1 text-xs text-violet-800">Use o código abaixo na página que foi aberta.</p><div className="mt-3 rounded-lg bg-violet-950 px-3 py-4 text-center font-mono text-2xl font-extrabold tracking-[0.2em] text-fuchsia-300">{githubDeviceUserCode}</div><button onClick={() => { void navigator.clipboard.writeText(githubDeviceUserCode); setNotice("Código de autorização copiado."); }} className="mt-2 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-950">Copiar código</button><p className="mt-2 text-center text-[11px] text-violet-800">Aguardando autorização… verificação automática</p></div>}
                        {githubUser && <><p className="mt-3 text-xs text-emerald-700">✓ Conectado como @{githubUser} · {repoOptions.length} repositórios encontrados</p><button onClick={disconnectGithub} className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Desconectar GitHub</button></>}
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2"><DatabaseIcon className="h-5 w-5 text-emerald-600" /><h4 className="text-sm font-bold">Supabase Management API</h4><span className="ml-auto rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Configuração necessária</span></div>
                        <p className="mt-4 text-xs leading-5 text-slate-500">Conecte sua conta Supabase para autorizar o Lovable RP a acessar e modificar apenas os projetos e recursos permitidos pelas permissões que você aprovar.</p>
                        <button onClick={() => { window.location.href = "/api/supabase/oauth/start"; }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"><DatabaseIcon className="h-4 w-4" />Conectar Supabase<ArrowRight className="h-4 w-4" /></button>
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">O botão inicia o OAuth no servidor. Para concluir, cadastre o aplicativo Lovable RP no Supabase e configure as variáveis secretas do servidor.</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-pink-600" /><h4 className="text-sm font-bold">Gemini API</h4>{geminiApiKey && <span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Chave informada</span>}</div>
                        <label htmlFor="rp-gemini-key" className="mt-4 block text-xs font-semibold text-slate-600">Chave da API Gemini</label>
                        <input id="rp-gemini-key" type="password" autoComplete="off" value={geminiApiKey} onChange={(event) => { setGeminiApiKey(event.target.value); setGeminiConnected(false); }} placeholder="AIza..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">A execução web usa uma API de IA; não usa automaticamente a sessão ou os conectores do ChatGPT.</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2"><button onClick={handleTestGemini} disabled={testingGemini} className="w-full rounded-xl bg-pink-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-pink-700 disabled:opacity-60">{testingGemini ? "Testando chave..." : "Testar e salvar nesta sessão"}</button><button onClick={disconnectGemini} disabled={!geminiApiKey && !geminiConnected} className="w-full rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-bold text-rose-700 disabled:opacity-40">Desconectar chave</button></div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-emerald-600" /><h4 className="text-sm font-bold">OpenAI API (GPT)</h4>{openaiConnected && <span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Conectado</span>}</div>
                        <label htmlFor="rp-openai-key" className="mt-4 block text-xs font-semibold text-slate-600">Chave da API OpenAI</label>
                        <input id="rp-openai-key" type="password" autoComplete="off" value={openaiApiKey} onChange={(event) => { setOpenaiApiKey(event.target.value); setOpenaiConnected(false); }} placeholder="sk-..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">Alternativa ao Gemini. A API OpenAI tem cobrança separada da assinatura do ChatGPT. O site escolhe automaticamente OpenAI quando ela estiver conectada; caso contrário, usa Gemini.</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2"><button onClick={handleTestOpenAI} disabled={testingOpenAI} className="w-full rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{testingOpenAI ? "Testando chave..." : "Conectar e testar OpenAI"}</button><button onClick={disconnectOpenAI} disabled={!openaiApiKey && !openaiConnected} className="w-full rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-bold text-rose-700 disabled:opacity-40">Desconectar chave</button></div>
                      </div>

                      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 sm:col-span-2">
                        <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-violet-700" /><h4 className="text-sm font-bold">OpenRouter — catálogo de modelos</h4>{openrouterConnected && <span className="ml-auto rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">Conectado</span>}</div>
                        <label htmlFor="rp-openrouter-key" className="mt-3 block text-xs font-semibold text-slate-600">Chave da API OpenRouter</label>
                        <input id="rp-openrouter-key" type="password" autoComplete="off" value={openrouterApiKey} onChange={(event) => { setOpenrouterApiKey(event.target.value); setOpenrouterConnected(false); }} placeholder="sk-or-v1-..." className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
                        <p className="mt-2 text-[11px] text-slate-500">Carrega os modelos disponíveis na API OpenRouter. O modelo escolhido será usado nas edições do GitHub.</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2"><button onClick={handleTestOpenRouter} disabled={testingOpenRouter} className="w-full rounded-xl bg-violet-700 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-60">{testingOpenRouter ? "Carregando modelos..." : "Conectar e carregar modelos"}</button><button onClick={disconnectOpenRouter} disabled={!openrouterApiKey && !openrouterConnected} className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-bold text-rose-700 disabled:opacity-40">Desconectar chave</button></div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                        <h4 className="text-sm font-bold">Provedor e modelo usados nas edições</h4>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div><label htmlFor="rp-ai-provider" className="block text-xs font-semibold text-slate-600">Provedor de IA</label><select id="rp-ai-provider" value={aiProvider} onChange={(event) => { const value = event.target.value as AIProvider; setAiProvider(value); window.sessionStorage.setItem("lovable-rp-web-ai-provider", value); const list = value === "openai" ? openaiModels : value === "openrouter" ? openrouterModels : geminiModelOptions; if (list.length) setAiModel(list[0].id); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="gemini">Google Gemini</option><option value="openai">OpenAI API (GPT)</option><option value="openrouter">OpenRouter (vários modelos)</option></select></div>
                          <div><label htmlFor="rp-ai-model" className="block text-xs font-semibold text-slate-600">Modelo</label><select id="rp-ai-model" value={aiModel} onChange={(event) => { setAiModel(event.target.value); window.sessionStorage.setItem("lovable-rp-web-ai-model", event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value={aiModel}>{aiModel}</option>{(aiProvider === "openai" ? openaiModels : aiProvider === "openrouter" ? openrouterModels : geminiModelOptions).filter((model) => model.id !== aiModel).map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select><p className="mt-1 text-[11px] text-slate-500">A lista vem da API do provedor depois de conectar a chave.</p></div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 sm:col-span-2">
                        <div className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-emerald-700" /><h4 className="text-sm font-bold">IA própria de cada usuário</h4><span className="ml-auto rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">Configuração individual</span></div>
                        <p className="mt-2 text-[11px] leading-5 text-slate-600">Cada pessoa pode conectar sua própria chave de API OpenAI ou Gemini nos campos acima. O site usa a IA conectada para interpretar o pedido e preparar as alterações no repositório GitHub selecionado. A assinatura do ChatGPT não pode ser conectada diretamente ao site como API; o uso de API segue a cobrança e os limites do provedor.</p>
                        <p className="mt-2 text-[11px] leading-5 text-slate-600">Por segurança, as chaves atuais ficam somente na sessão deste navegador e não são enviadas ao banco do New Page Maker. Em computador compartilhado, desconecte a chave ao terminar e encerre a sessão.</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                      <div><label htmlFor="rp-repository" className="block text-xs font-semibold text-slate-600">Repositório GitHub</label><select id="rp-repository" value={selectedRepository} onChange={(event) => { const repo = repoOptions.find((item) => item.full_name === event.target.value); setSelectedRepository(event.target.value); if (repo?.default_branch) setSelectedBranch(repo.default_branch); window.sessionStorage.setItem("lovable-rp-web-repository", event.target.value); if (repo?.default_branch) window.sessionStorage.setItem("lovable-rp-web-branch", repo.default_branch); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400"><option value="">{githubUser ? (repoOptions.length ? "Selecione um repositório" : "Nenhum repositório carregado") : "Conecte o GitHub primeiro"}</option>{repoOptions.map((repo) => <option key={repo.full_name} value={repo.full_name}>{repo.full_name}{repo.private ? " · Privado" : " · Público"}</option>)}</select><p className="mt-1 text-[11px] text-slate-500">{repoOptions.length ? `${repoOptions.length} repositório(s) disponível(is)` : "A lista aparece depois que o GitHub estiver conectado."}</p></div>
                      <div><label htmlFor="rp-branch" className="block text-xs font-semibold text-slate-600">Branch de destino</label><input id="rp-branch" value={selectedBranch} onChange={(event) => { setSelectedBranch(event.target.value); window.sessionStorage.setItem("lovable-rp-web-branch", event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400" /></div>
                    </div>
                    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Segurança: os tokens ficam temporariamente no sessionStorage desta aba, não no banco. Use somente em ambiente confiável e remova a sessão ao terminar. A execução cria um commit GitHub; revise sempre os arquivos antes de publicar.</p>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {[{ name: "GitHub", detail: "Repositórios, branches e commits", icon: Github }, { name: "Supabase", detail: "Banco de dados e permissões", icon: DatabaseIcon }, { name: "Gemini", detail: "IA para analisar e editar arquivos", icon: Bot }].map((connection) => { const Icon = connection.icon; const connected = connection.name === "GitHub" ? !!githubUser : connection.name === "Gemini" ? geminiConnected : databaseStatus === "Supabase conectado"; return <div key={connection.name} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700"><Icon className="h-5 w-5" /></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{connected ? "Conectado" : "Pendente"}</span></div><p className="mt-4 text-sm font-bold">{connection.name}</p><p className="mt-1 text-xs leading-5 text-slate-500">{connection.detail}</p><button onClick={() => setNotice(connection.name === "Supabase" ? "O banco precisa estar ativo e receber a migração do Lovable RP Web." : `A integração real com ${connection.name} ainda não foi configurada.`)} className="mt-4 text-xs font-bold text-pink-600 hover:text-pink-700">Ver configuração <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>; })}
                    </div>
                    <div className="mt-5 rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="font-bold">Acesso ao Lovable RP Web</h4><p className="mt-1 text-xs text-slate-500">Login e cadastro com Supabase Auth. O novo cadastro fica pendente até aprovação.</p></div><div className="flex rounded-lg bg-slate-100 p-1"><button onClick={() => setAuthMode("login")} className={`rounded-md px-3 py-1.5 text-xs font-bold ${authMode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}>Entrar</button><button onClick={() => setAuthMode("signup")} className={`rounded-md px-3 py-1.5 text-xs font-bold ${authMode === "signup" ? "bg-white shadow-sm" : "text-slate-500"}`}>Criar conta</button></div></div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><label htmlFor="rp-auth-email" className="block text-xs font-semibold text-slate-600">E-mail</label><input id="rp-auth-email" type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400" placeholder="voce@exemplo.com" /></div><div><label htmlFor="rp-auth-password" className="block text-xs font-semibold text-slate-600">Senha</label><div className="relative mt-1"><input id="rp-auth-password" type={showAuthPassword ? "text" : "password"} autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-20 text-sm outline-none focus:border-pink-400" placeholder="Mínimo de 8 caracteres" /><button type="button" onClick={() => setShowAuthPassword((visible) => !visible)} aria-label={showAuthPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute inset-y-0 right-2 my-1 rounded-lg px-2 text-xs font-semibold text-pink-700 hover:bg-pink-50">{showAuthPassword ? "Ocultar" : "Ver senha"}</button></div></div></div>
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
                  <button onClick={() => { setActiveNav("Projetos"); setNotice(repoOptions.length ? "Escolha um repositório existente na aba Projetos. Para criar um novo, use Novo projeto e selecione Criar projeto do zero." : "Para editar um projeto existente, conecte o GitHub. Para criar do zero, use Novo projeto e conecte o GitHub e a IA."); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"><Plus className="h-4 w-4" /> Gerenciar projetos</button>
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
